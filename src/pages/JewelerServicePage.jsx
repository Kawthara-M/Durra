import { useParams, useNavigate, Link } from "react-router-dom"
import { useEffect, useState } from "react"

import Reviews from "../components/Reviews"
import FeedbackModal from "../components/FeedbackModal"
import User from "../services/api"

import editIcon from "../assets/edit.png"
import deleteIcon from "../assets/delete.png"
import "../../public/stylesheets/service-page.css"

const JewelerServicePage = () => {
  const navigate = useNavigate()
  const { serviceId } = useParams()

  const [service, setService] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    const getService = async () => {
      const response = await User.get(`/services/${serviceId}`)
      setService(response.data.service)
    }
    getService()
  }, [])

  const handlePrev = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? service.images.length - 1 : prev - 1
    )
  }

  const handleNext = () => {
    setCurrentImageIndex((prev) =>
      prev === service.images.length - 1 ? 0 : prev + 1
    )
  }

  const deleteService = async () => {
    try {
      await User.delete(`/services/${serviceId}`)
      navigate("/jeweler-services")
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to delete the service"
      setErrorMessage(message)
    }
  }

  return (
    <>
      {service && (
        <>
          <div className="service-page">
            <h1 className="service-page-heading"> {service.name}</h1>
            <hr />
            <div className="service-page-content">
              <div className="service-images">
                {service.images.length > 0 && (
                  <div className="service-image-slider">
                    <button className="left-arrow" onClick={handlePrev}>
                      ←
                    </button>
                    <div className="image-box">
                      <img
                        src={service.images[currentImageIndex]}
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
                  {" "}
                  <h2 className="service-description">Description</h2>
                  <Link to={`/edit-service/${serviceId}`}>
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
                </div>
                <p id="jeweler-service-description">{service.description}</p>

                <div className="jeweler-service-details">
                  <h3 className="service-limit">Limit Per Order:</h3>
                  <p>{service.limitPerOrder}</p>
                </div>

                <div className="jeweler-service-details">
                  <h3 className="service-price">Price:</h3>
                  <p>{service.price} BHD</p>
                </div>
              </div>
            </div>
            <div className="service-reviews">
              <h2 className="reviews-heading">Reviews</h2>
              <Reviews serviceId={serviceId} />
            </div>
          </div>

          <FeedbackModal
            show={showDeleteModal}
            type={errorMessage ? "error" : "confirm"}
            message={
              errorMessage || "Are you sure you want to delete this service?"
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
                      onClick: deleteService,
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
export default JewelerServicePage
