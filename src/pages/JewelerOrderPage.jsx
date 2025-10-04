import { useParams, Link } from "react-router-dom"
import { useState, useEffect } from "react"

import User from "../services/api"

import editIcon from "../assets/edit.png"
import deleteIcon from "../assets/delete.png"

const JewelerOrderPage = () => {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [sliderImages, setSliderImages] = useState([])

  const handlePrev = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? sliderImages.length - 1 : prev - 1
    )
  }

  const handleNext = () => {
    setCurrentImageIndex((prev) =>
      prev === sliderImages.length - 1 ? 0 : prev + 1
    )
  }

  const capitalize = (str) => {
    if (!str || typeof str !== "string") return ""
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  useEffect(() => {
    const getOrder = async () => {
      const response = await User.get(`/orders/${orderId}`)
      const raw = response.data.order

      const formatted = {
        ...raw,
        status: capitalize(raw.status),
        collectionMethod: capitalize(raw.collectionMethod),
        paymentMethod: capitalize(raw.paymentMethod),
        paymentStatus: capitalize(raw.paymentStatus),
      }
      const jewelryImages =
        raw.jewelryOrder?.flatMap((item) => item?.jewelry?.images || []) || []
      const serviceImages =
        raw.serviceOrder?.flatMap((item) => item?.images || []) || []

      setSliderImages([...jewelryImages, ...serviceImages])
      setOrder(formatted)
    }
    getOrder()
  }, [])
  return (
    <>
      {order && (
        <>
          <div className="order-page">
            <div className="order-page-heading">
              <h1>Order </h1>
              <p>#{order._id}</p>
            </div>
            <hr />
            <div className="order-page-content">
              <div className="service-images">
                {sliderImages.length > 0 && (
                  <div className="service-image-slider">
                    <button className="left-arrow" onClick={handlePrev}>
                      ←
                    </button>
                    <div className="image-box">
                      <img
                        src={sliderImages[currentImageIndex]}
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
              <div className="order-general">
                <h2 className="order-general-heading">Summary</h2>
                <div className="order-details">
                  <div>
                    <h4>Customer </h4>
                    <p className="customer-email"> {order.user.email}</p>
                  </div>
                  <div>
                    <h4>Status </h4>
                    {order.status}
                  </div>
                  <div className="">
                    <h4>Collection Method </h4>
                    <p> {order.collectionMethod}</p>
                  </div>{" "}
                  <div>
                    <h4>Payment Method </h4>
                    <p> {order.paymentMethod}</p>
                  </div>
                  <div>
                    <h4>Payment Status </h4>
                    <p> {order.paymentStatus}</p>
                  </div>
                  <div>
                    <h4>Total Price </h4>
                    <p className="price"> {order.totalPrice} BHD</p>
                  </div>
                </div>
                {/* <button className="jeweler-update-status">
                  Update Order Status
                </button> */}
              </div>
            </div>
            <div className="order-information">
              <div className="order-information-details">
                {order.jewelryOrder?.length > 0 ? (
                  <>
                    <h3>Jewelry</h3>
                    <div className="jewelry-container">
                      {order.jewelryOrder.map((order) => {
                        return (
                          <div className="jewelry-in-order">
                            <img
                              src={`${order.jewelry.images[0]}`}
                              alt={`${order.jewelry.name}`}
                              className="image-in-order"
                            />
                            <div className="jewelry-in-order-details">
                              <h5>{order.jewelry.name}</h5>
                              <span>
                                <span>
                                  {" "}
                                  <h6>Quantity:</h6>
                                  <p>{order.jewelry.quantity || 1}</p>
                                </span>
                                <span>
                                  {" "}
                                  <h6>Total Price:</h6>
                                  <p className="price">
                                    {order.jewelry.totalPrice} BHD
                                  </p>
                                </span>
                              </span>
                              <div>
                                <h6>Notes</h6>
                                <p>{order.jewelry.notes || "-"}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>{" "}
                  </>
                ) : null}
                {order.serviceOrder?.length > 0 ? (
                  <>
                    <span id="services-span">
                      {" "}
                      <h3>Service</h3> (s)
                    </span>
                    <div className="service-container">
                      {order.serviceOrder.map((order) => {
                        return (
                          <div className="service-in-order">
                            <img
                              src={`${order.service.images[0]}`}
                              alt={`${order.service.name}`}
                              className="image-in-order"
                            />
                            <div className="jewelry-in-order-details">
                              <h5>{order.service.name}</h5>
                              <span>
                                <span>
                                  {" "}
                                  <h6>Quantity:</h6>
                                  <p>{order.quantity || 1}</p>
                                </span>
                                <span>
                                  {" "}
                                  <h6>Total Price:</h6>
                                  <p className="price">
                                    {order.totalPrice} BHD
                                  </p>
                                </span>
                              </span>
                              {/* include section for the jewelry on which this service will be performed on */}
                              <div>
                                <h6>Notes</h6>
                                <p>{order.notes || "-"}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>{" "}
                  </>
                ) : null}
              </div>
            </div>
          </div>

          {/* <FeedbackModal
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
          /> */}
        </>
      )}
    </>
  )
}

export default JewelerOrderPage
