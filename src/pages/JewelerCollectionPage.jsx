import { useParams, useNavigate, Link } from "react-router-dom"
import { useEffect, useState } from "react"

import FeedbackModal from "../components/FeedbackModal"
import User from "../services/api"

import editIcon from "../assets/edit.png"
import deleteIcon from "../assets/delete.png"
const JewelerCollectionPage = () => {
  const navigate = useNavigate()
  const { collectionId } = useParams()

  const [collection, setCollection] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    const getCollection = async () => {
      const response = await User.get(`/collections/${collectionId}`)
      setCollection(response.data.collection)
    }
    getCollection()
  }, [])

  const handlePrev = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? collection.images.length - 1 : prev - 1
    )
  }

  const handleNext = () => {
    setCurrentImageIndex((prev) =>
      prev === collection.images.length - 1 ? 0 : prev + 1
    )
  }

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
  return <>
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
                      {/* <img
                        src={service.images[currentImageIndex]}
                        alt={`Image ${currentImageIndex + 1}`}
                        className="box-image"
                      /> */}
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
                <p id="jeweler-service-description">{collection.description}</p>
                {/* <div className="jeweler-service-details">
                  <h3 className="service-limit">Limit Per Order:</h3>
                  <p>{service.limitPerOrder}</p>
                </div> */}
                <div className="jeweler-service-details">
                  <h3 className="service-price">Price:</h3>
                  {/* <p className="price">{service.price} BHD</p> */}
                </div>
              </div>
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
}

export default JewelerCollectionPage
