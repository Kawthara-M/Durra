import { useParams, useNavigate, Link } from "react-router-dom"
import { useEffect, useState } from "react"

import Reviews from "../components/Reviews"
import FeedbackModal from "../components/FeedbackModal"
import imageSlider from "../services/imageSliders"
import User from "../services/api"
import {
  fetchMetalRates,
  calculatePreciousMaterialCost,
  calculateTotalCost,
} from "../services/calculator"

import editIcon from "../assets/edit.png"
import deleteIcon from "../assets/delete.png"
import "../../public/stylesheets/jeweler-jewelry.css"

const JewelryPiecePage = () => {
  const navigate = useNavigate()
  const { jewelryId } = useParams()

  const [jewelry, setJewelry] = useState(null)
  const {
    currentIndex: currentImageIndex,
    handleNext,
    handlePrev,
  } = imageSlider(jewelry?.images)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const [totalPrice, setTotalPrice] = useState(0)
  const [preciousMaterialCost, setPreciousMaterialCost] = useState(0)

  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const getJewelry = async () => {
      const response = await User.get(`/jewelry/${jewelryId}`)
      setJewelry(response.data.jewelry)
    }
    getJewelry()
  }, [])

  useEffect(() => {
    const getJewelry = async () => {
      try {
        const rates = await fetchMetalRates()
        const preciousCost = calculatePreciousMaterialCost(
          jewelry.preciousMaterials,
          rates
        )
        const total = calculateTotalCost(preciousCost, jewelry.originPrice)

        setPreciousMaterialCost(preciousCost.toFixed(2))
        setTotalPrice(total.toFixed(2))
      } catch (err) {
        console.error("Failed to fetch jewelry or metal rates", err)
      }
    }
    if (jewelry) {
      getJewelry()
    }
  }, [jewelry])

  const deleteJewelry = async () => {
    try {
      await User.delete(`/jewelry/${jewelryId}`)
      navigate("/jeweler-jewelry")
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to delete the jewelry"
      setErrorMessage(message)
    }
  }

  const formatCertificationName = (name) => {
    if (!name) return ""
    if (name.toUpperCase() === "GIA") {
      return "Gemological Institute of America (GIA)"
    }
    return name
  }
  return (
    <>
      {jewelry && (
        <>
          <div className="service-page">
            <div className="service-page-content">
              <div className="service-images">
                {jewelry.images.length > 0 && (
                  <div className="service-image-slider">
                    <button className="left-arrow" onClick={handlePrev}>
                      ←
                    </button>
                    <div className="image-box">
                      <img
                        src={jewelry.images[currentImageIndex]}
                        alt={`Image ${currentImageIndex + 1}`}
                        className="box-image"
                      />
                    </div>
                    <button className="right-arrow" onClick={handleNext}>
                      →
                    </button>
                  </div>
                )}
              </div>
              <div className="service-information">
                <div className="heading-and-editor">
                  <h1> {jewelry.name}</h1>{" "}
                  <Link to={`/edit-jewelry/${jewelryId}`}>
                    <img src={editIcon} alt="edit icon" className="icon" />
                  </Link>
                  <Link>
                    <img
                      src={deleteIcon}
                      alt="delete icon"
                      className="icon"
                      onClick={() => setShowDeleteModal(true)}
                    />
                  </Link>
                </div>{" "}
                <div>
                  <h2 className="service-description">Description</h2>
                  <p id="jeweler-service-description">
                    {jewelry.description}
                  </p>{" "}
                </div>
                <div className="jewelry-overview-wrapper">
                  <div className="jeweler-service-details">
                    <h3 className="service-limit">Limit Per Order</h3>
                    <p>{jewelry.limitPerOrder} Unit</p>
                  </div>
                  <div className="jeweler-service-details">
                    <h3 className="service-price">Price</h3>
                    <p>{totalPrice} BHD</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="jewelry-details-wrapper">
              <div
                className="jewelry-details"
                onClick={() => setIsExpanded((prev) => !prev)}
              >
                <h3 className="jewelry-details-heading">Jewelry Details</h3>
                <p>{isExpanded ? "-" : "+"}</p>
              </div>
              {isExpanded && (
                <div className="jewelry-extra-details">
                  <p>
                    <strong>Main Material:</strong> {jewelry.mainMaterial}
                  </p>
                  <p>
                    <strong>Total Weight:</strong> {jewelry.totalWeight}g
                  </p>
                  <p>
                    <strong>Production Cost:</strong> {jewelry.productionCost}{" "}
                    BHD
                  </p>

                  {jewelry.preciousMaterials?.length > 0 && (
                    <div>
                      <p>
                        <strong>Precious Metals:</strong>
                      </p>
                      <ul className="list-details">
                        {jewelry.preciousMaterials.map((material, index) => (
                          <li key={index}>
                            {material.karat}K {material.name} -{" "}
                            {material.weight}g
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {jewelry.pearls?.length > 0 && (
                    <div>
                      <p>
                        <strong>Pearls:</strong>
                      </p>
                      <ul className="list-details">
                        {jewelry.pearls.map((pearl, index) => (
                          <li key={index}>
                            {pearl.number}x {pearl.type} {pearl.shape}{" "}
                            {pearl.color} Pearl - {pearl.weight}g
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {jewelry.diamonds?.length > 0 && (
                    <div>
                      <p>
                        <strong>Diamonds:</strong>
                      </p>
                      <ul>
                        {jewelry.diamonds.map((diamond, index) => (
                          <li key={index}>
                            {diamond.number}x {diamond.type} Diamond -{" "}
                            {diamond.weight}g<br />
                            <span>
                              Color: {diamond.color}, Clarity: {diamond.clarity}
                              , Cut: {diamond.cutGrade}, Shape: {diamond.shape}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {jewelry.otherMaterials?.length > 0 && (
                    <div>
                      <p>
                        <strong>Other Metals:</strong>
                      </p>
                      <ul className="list-details">
                        {jewelry.otherMaterials.map((m, index) => (
                          <li key={index}>
                            {m.name}x - {m.weight}g
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {jewelry.certifications?.length > 0 && (
                    <div>
                      <p>
                        <strong>Certifications:</strong>
                      </p>
                      <ul className="list-details">
                        {jewelry.certifications.map((m, index) => (
                          <li key={index}>
                            {formatCertificationName(m.name)}: Report{" "}
                            {m.reportNumber} issued on {m.reportDate}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="service-reviews">
              <h3 className="reviews-heading">Reviews</h3>
              <Reviews
                reviewedItemId={jewelryId}
                reviewedItemType="Jewelry"
                readOnly={true} 
              />
            </div>
          </div>

          <FeedbackModal
            show={showDeleteModal}
            type={errorMessage ? "error" : "confirm"}
            message={
              errorMessage || "Are you sure you want to delete this jewelry?"
            }
            onClose={() => {
              setShowDeleteModal(false)
              setErrorMessage("")
            }}
            actions={
              errorMessage
                ? [
                    {
                      label: "Close",
                      onClick: () => {
                        setShowDeleteModal(false)
                        setErrorMessage("")
                      },
                    },
                  ]
                : [
                    {
                      label: "Delete",
                      onClick: deleteJewelry,
                    },
                    {
                      label: "Cancel",
                      onClick: () => setShowDeleteModal(false),
                    },
                  ]
            }
          />
        </>
      )}
    </>
  )
}

export default JewelryPiecePage
