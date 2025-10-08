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
  const [isExpanded, setIsExpanded] = useState(false)

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
                        <strong>Total Weight:</strong> {item.totalWeight}g
                      </p>

                      {/* {item.preciousMaterials?.length > 0 && (
                        <div>
                          <p>
                            <strong>Precious Metals:</strong>
                          </p>
                          <ul className="collection-list">
                            {item.preciousMaterials.map((material, index) => (
                              <li key={index}>
                                {material.karat}K {material.name} -{" "}
                                {material.weight}g
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {item.pearls?.length > 0 && (
                        <div>
                          <p>
                            <strong>Pearls:</strong>
                          </p>
                          <ul className="collection-list">
                            {item.pearls.map((pearl, index) => (
                              <li key={index}>
                                {pearl.number}x {pearl.type} {pearl.shape}{" "}
                                {pearl.color} Pearl - {pearl.weight}g
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {item.diamonds?.length > 0 && (
                        <div>
                          <p>
                            <strong>Diamonds:</strong>
                          </p>
                          <ul className="collection-list">
                            {item.diamonds.map((diamond, index) => (
                              <li key={index}>
                                {diamond.number}x {diamond.type} Diamond -{" "}
                                {diamond.weight}g<br />
                                <span>
                                  Color: {diamond.color}, Clarity:{" "}
                                  {diamond.clarity}, Cut: {diamond.cutGrade},
                                  Shape: {diamond.shape}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {item.otherMaterials?.length > 0 && (
                        <div>
                          <p>
                            <strong>Metals:</strong>
                          </p>
                          <ul className="collection-list">
                            {item.otherMaterials.map((m, index) => (
                              <li key={index}>
                                {m.name} - {m.weight}g
                              </li>
                            ))}
                          </ul>
                        </div>
                      )} */}
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
