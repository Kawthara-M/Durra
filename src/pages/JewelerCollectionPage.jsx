import { useParams, useNavigate, Link } from "react-router-dom"
import { useEffect, useState } from "react"

import FeedbackModal from "../components/FeedbackModal"
import imageSlider from "../services/imageSliders"
import {
  fetchMetalRates,
  calculatePreciousMaterialCost,
  calculateTotalCost,
} from "../services/calculator"
import User from "../services/api"

import editIcon from "../assets/edit.png"
import deleteIcon from "../assets/delete.png"
const JewelerCollectionPage = () => {
  const navigate = useNavigate()
  const { collectionId } = useParams()

  const [collection, setCollection] = useState(null)
  const [totalPrice, setTotalPrice] = useState(0)
  const {
    currentIndex: currentImageIndex,
    handleNext,
    handlePrev,
  } = imageSlider(collection?.images)
  const [isExpanded, setIsExpanded] = useState(false)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    const getCollection = async () => {
      try {
        const response = await User.get(`/collections/${collectionId}`)
        const fetchedCollection = response.data.collection
        setCollection(fetchedCollection)

        const metalRates = await fetchMetalRates()

        let jewelryTotal = 0

        for (const item of fetchedCollection.jewelry) {
          const origin = parseFloat(item.originPrice || 0)
          const materialCost = calculatePreciousMaterialCost(
            item.preciousMaterials,
            metalRates
          )

          const totalForItem = calculateTotalCost(materialCost, origin)
          jewelryTotal += totalForItem
        }

        const collectionOrigin = parseFloat(fetchedCollection.originPrice || 0)
        const total = jewelryTotal + collectionOrigin

        setTotalPrice(total.toFixed(2))
      } catch (error) {
        console.error("Error fetching collection or metal rates", error)
      }
    }

    getCollection()
  }, [])

  const deleteCollection = async () => {
    try {
      await User.delete(`/collections/${collectionId}`)
      navigate("/jeweler-collections")
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to delete the collection"
      setErrorMessage(message)
    }
  }
  return (
    <>
      {collection && (
        <>
          <div className="service-page">
            <div className="service-page-content">
              <div className="service-images">
                {collection.jewelry[0].images.length > 0 && (
                  <div className="service-image-slider">
                    <button className="left-arrow" onClick={handlePrev}>
                      ←
                    </button>
                    <div className="image-box">
                      <img
                        src={collection.images[currentImageIndex]}
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
                  <h1> {collection.name}</h1>
                  <Link to={`/edit-collection/${collectionId}`}>
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
                <h2 className="service-description">Description</h2>
                <p className="description">{collection.description}</p>
                <div className="service-details">
                <div className="jeweler-service-details">
                  <h3 className="service-limit">Limit Per Order</h3>
                  <p>{collection.limitPerOrder} Unit</p>
                </div>
                <div className="jeweler-service-details">
                  <h3 className="service-price">Price</h3>
                  <p >{totalPrice} BHD</p>
                </div>
                </div>
              </div>
            </div>
            <div className="collection-details-wrapper">
              <div
                className="collection-toggle-header"
                onClick={() => setIsExpanded((prev) => !prev)}
              >
                <h3 className="collection-toggle-title">Contents</h3>
                <p>{isExpanded ? "-" : "+"}</p>
              </div>

              {isExpanded &&
                collection.jewelry.map((item) => (
                  <div key={item._id} className="collection-item-section">
                    <h4 className="collection-item-title">{item.name}</h4>
                    <div className="collection-item-details">
                      <p>
                        <strong>Weight:</strong> {item.totalWeight}g
                      </p>

           
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <FeedbackModal
            show={showDeleteModal}
            type={errorMessage ? "error" : "confirm"}
            message={
              errorMessage || "Are you sure you want to delete this collection?"
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
                      onClick: deleteCollection,
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

export default JewelerCollectionPage
