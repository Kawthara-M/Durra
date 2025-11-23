import { useParams } from "react-router-dom"
import { useState, useEffect } from "react"

import { STATUS_DISPLAY_MAP, PAYMENT_DISPLAY_MAP } from "../services/statusMap"
import imageSlider from "../services/imageSliders"
import User from "../services/api"

const JewelerOrderPage = () => {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [sliderImages, setSliderImages] = useState([])
  const [isExpanded, setIsExpanded] = useState(false)

  const {
    currentIndex: currentImageIndex,
    handleNext,
    handlePrev,
  } = imageSlider(sliderImages.length > 0 ? sliderImages : [])

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
        paymentStatus:
          PAYMENT_DISPLAY_MAP[raw.paymentStatus] || raw.paymentStatus,
      }
      const jewelryImages =
        raw.jewelryOrder?.flatMap((i) => i.item?.images[0] || []) || []

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
            {" "}
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
                      <button onClick={() => updateOrder("ready")}>
                        Delivery Ready
                      </button>
                      {/* at this point we should send an email to driver to come pick up the order */}
                      {order.collectionMethod === "at-shop-collection" && (
                        <button onClick={() => updateOrder("pickup")}>
                          Pickup Ready{" "}
                        </button>
                      )}
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
                </div>
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
                      {order.totalPrice.toFixed(2)} BHD
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-information">
              <div
                className="contents-toggle-header"
                onClick={() => setIsExpanded((prev) => !prev)}
              >
                <h3>Contents</h3>
                <p>{isExpanded ? "-" : "+"}</p>
              </div>

              {isExpanded && (
                <div className="order-information-details">
                  {order.jewelryOrder?.length > 0 && (
                    <>
                      <h4>Jewelry</h4>
                      {order.jewelryOrder.map((entry) => (
                        <div key={entry._id} className="contents-item">
                          <h5>{entry.item.name}</h5>
                          <div className="contents-item-details">
                            <span>
                              <h6>Quantity:</h6> <p> {entry.quantity || 1}</p>
                            </span>
                            {entry.size && (
                              <span>
                                <h6>Size:</h6>
                                <p>{entry.size}</p>
                              </span>
                            )}

                            <span>
                              <h6>Total Price:</h6>
                              <p>{Number(entry.totalPrice).toFixed(3)} BHD</p>
                            </span>
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {order.serviceOrder?.length > 0 && (
                    <>
                      <h4>Services</h4>
                      {order.serviceOrder.map((serviceItem) => (
                        <div key={serviceItem._id} className="contents-item">
                          <h5>{serviceItem.service.name}</h5>

                          <div>
                            <strong>Jewelry included:</strong>
                            <ul className="order-service-list">
                              {serviceItem.jewelry.length > 0 ? (
                                serviceItem.jewelry.map((jewelryItem) => (
                                  <li key={jewelryItem._id}>
                                    {jewelryItem.name}
                                  </li>
                                ))
                              ) : (
                                <li>-</li>
                              )}
                            </ul>
                          </div>

                          <p>Quantity: {serviceItem.jewelry.length || 1}</p>
                          <p>
                            Total Price:{" "}
                            {Number(serviceItem.totalPrice).toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}{" "}
                            BHD
                          </p>
                          <p>Notes: {serviceItem.notes || "-"}</p>
                        </div>
                      ))}
                    </>
                  )}
                  {order.notes && (
                    <div className="contents-item">
                      <h5>Notes</h5>
                      <p>{order.notes}</p>
                    </div>
                  )}
                </div>
              )}
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
