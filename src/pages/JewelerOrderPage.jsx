import { useParams, Link } from "react-router-dom"
import { useState, useEffect } from "react"

import { STATUS_DISPLAY_MAP } from "../services/statusMap"
import User from "../services/api"

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

  const updateOrder = async (status) => {
    try {
      const response = await User.put(`/orders/update-status/${orderId}`, {
        status,
      })

      const updatedStatus = response.data.order.status

      setOrder((prevOrder) => ({
        ...prevOrder,
        status: STATUS_DISPLAY_MAP[updatedStatus] || updatedStatus,
        _status: updatedStatus,
      }))
    } catch (error) {
      console.error("Error updating status:", error)
      alert(error.response?.data?.message || "Failed to update order status.")
    }
  }

  useEffect(() => {
    const getOrder = async () => {
      const response = await User.get(`/orders/${orderId}`)
      const raw = response.data.order

      const formatted = {
        ...raw,
        status: STATUS_DISPLAY_MAP[raw.status] || raw.status,
        _status: raw.status,
        collectionMethod: capitalize(raw.collectionMethod),
        paymentMethod: capitalize(raw.paymentMethod),
        paymentStatus: capitalize(raw.paymentStatus),
      }
      const jewelryImages =
        raw.jewelryOrder?.flatMap((item) => item.jewelry?.images[0] || []) || []

      const serviceJewelryImages =
        raw.serviceOrder?.flatMap((serviceItem) =>
          (serviceItem.jewelry || []).flatMap((j) => j.images || [])
        ) || []

      formatted.jewelryImageCount = jewelryImages.length

      setSliderImages([...jewelryImages, ...serviceJewelryImages])

      setOrder(formatted)
      console.log(response.data.order)
    }
    getOrder()
  }, [])

  return (
    <>
      {order && (
        <>
          <div className="order-page">
            <div className="order-page-heading">
              <div>
                <h1>Order </h1>
                <p>#{order._id}</p>
              </div>
              {order._status === "submitted" && (
                <div className="update-status">
                  <p
                    id="accept"
                    title="Accept Order"
                    onClick={() => updateOrder("accepted")}
                  >
                    ✓
                  </p>
                  <p
                    id="reject"
                    title="Reject Order"
                    onClick={() => updateOrder("rejected")}
                  >
                    ✗
                  </p>
                </div>
              )}
              {order._status === "accepted" && (
                <div className="update-status">
                  <button
                    title={`Update Order Status to Processing`}
                    onClick={() => updateOrder("processing")}
                  >
                    Start Processing
                  </button>
                </div>
              )}
              {order._status === "processing" && (
                <div className="update-status">
                  <button onClick={() => updateOrder("pickup")}>
                    Ready for Pickup
                  </button>
                  <button onClick={() => updateOrder("ready")}>
                    Ready for Delivery
                  </button>
                </div>
              )}
              {order._status === "ready" && (
                <div className="update-status">
                  <button onClick={() => updateOrder("out")}>
                    Out for Delivery
                  </button>
                </div>
              )}
              {order._status === "pickup" && (
                <div className="update-status">
                  <button
                    onClick={() => updateOrder("picked-up")}
                    title="Mark as Picked Up"
                  >
                    Picked Up
                  </button>
                </div>
              )}
            </div>{" "}
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
                      <div className="image-index-overlay">
                        {currentImageIndex + 1}/{sliderImages.length}
                      </div>
                    </div>

                    <button className="right-arrow" onClick={handleNext}>
                      →
                    </button>
                  </div>
                )}
              </div>
              <div className="order-general">
                <h3 className="order-general-heading">Summary</h3>
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
                    <p>
                      {order.collectionMethod === "out"
                        ? "Out for Delivery"
                        : order.collectionMethod === "pickup"
                        ? "Ready for Pickup"
                        : order.collectionMethod}
                    </p>
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
                    <p className="price" id="order-price">
                      {" "}
                      {order.totalPrice} BHD
                    </p>
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
                    {" "}
                    <span id="services-span">
                      <h3>Service</h3> (s)
                    </span>
                    <div className="service-container">
                      {order.serviceOrder.map((serviceItem, serviceIndex) => {
                        let imageStartIndex = order.jewelryImageCount

                        for (let i = 0; i < serviceIndex; i++) {
                          const prevJewelry =
                            order.serviceOrder[i].jewelry || []
                          const prevCount = prevJewelry.reduce(
                            (sum, j) => sum + (j.images?.length || 0),
                            0
                          )
                          imageStartIndex += prevCount
                        }

                        let currentImageIndex = imageStartIndex

                        return (
                          <div
                            className="service-in-order"
                            key={serviceItem._id}
                          >
                            <img
                              src={serviceItem.service.images[0]}
                              alt={serviceItem.service.name}
                              className="image-in-order"
                            />
                            <div className="jewelry-in-order-details">
                              <h5>{serviceItem.service.name}</h5>
                              <div>
                                <h6>Jewelry:</h6>
                                <div className="jewelry-array-in-service">
                                  {serviceItem.jewelry.map(
                                    (jewelryItem, jIndex) => {
                                      const imageCount =
                                        jewelryItem.images?.length || 0
                                      const start = currentImageIndex + 1
                                      const end = currentImageIndex + imageCount
                                      currentImageIndex = end

                                      return (
                                        <p key={jIndex}>
                                          {jewelryItem.name}: Image
                                          {imageCount > 1 ? "s" : ""}{" "}
                                          {imageCount === 1
                                            ? start
                                            : `${start}-${end}`}
                                        </p>
                                      )
                                    }
                                  )}
                                </div>
                              </div>
                              <span>
                                <h6>Quantity:</h6>
                                <p>{serviceItem.jewelry.length || 1}</p>
                              </span>
                              <span>
                                <h6>Total Price:</h6>
                                <p className="price">
                                  {serviceItem.totalPrice} BHD
                                </p>
                              </span>
                              <div>
                                <h6>Notes</h6>
                                <p>{serviceItem.notes || "-"}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
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
