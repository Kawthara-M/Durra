import { useParams, Link } from "react-router-dom"
import { useState, useEffect } from "react"

import User from "../services/api"

import editIcon from "../assets/edit.png"
import deleteIcon from "../assets/delete.png"

const JewelerOrderPage = () => {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    const getOrder = async () => {
      const response = await User.get(`/orders/${orderId}`)
      setOrder(response.data.order)
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
              <h1>Order </h1>
              <p>#{order._id}</p>
            </div>
            <hr />
            <div className="order-page-content">
              <div className="order-general">
                <h2>Summary</h2>
                <div className="order-details">
                  <div>
                    <h4>Customer </h4>
                    <p className="customer-email"> {order.user.email}</p>
                  </div>
                  <div>
                    <h4>Status </h4>
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </div>
                  <div className="">
                    <h4>Collection Method </h4>
                    <p>
                      {" "}
                      {order.collectionMethod.charAt(0).toUpperCase() +
                        order.collectionMethod.slice(1)}
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
                    <p> {order.totalPrice} BHD</p>
                  </div>
                </div>
                <button className="jeweler-update-status">
                  Update Order Status
                </button>
              </div>

              <div className="order-information">
                <div>
                  {" "}
                  <h2>Details</h2>
                </div>
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
                                    <p>{order.jewelry.totalPrice} BHD</p>
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
                      <h3>Service</h3>
                      <div className="service-container">
                        {order.serviceOrder.map((order) => {
                          return (
                            <div className="service-in-order">
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
                                    <p>{order.totalPrice} BHD</p>
                                  </span>
                                </span>
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
