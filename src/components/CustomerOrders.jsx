import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { STATUS_DISPLAY_MAP, PAYMENT_DISPLAY_MAP } from "../services/statusMap"
import User from "../services/api"

const STATUS_PRIORITY = {
  pickup: 0,   
  accepted: 1, 
  // anything else will get priority 2
  rejected: 3, 
}

const getStatusPriority = (status) => {
  if (status in STATUS_PRIORITY) return STATUS_PRIORITY[status]
  return 2 
}

const CustomerOrders = () => {
  const [orders, setOrders] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        const response = await User.get("/orders")
        setOrders(response.data.orders || [])
      } catch (error) {
        console.error("Error fetching orders:", error)
      }
    }
    fetchUserOrders()
  }, [])

  const filteredOrders = orders.filter(
    (order) => order.status !== "cancelled" && order.status !== "pending"
  )

  const sortedOrders = [...filteredOrders].sort(
    (a, b) => getStatusPriority(a.status) - getStatusPriority(b.status)
  )

  const goToPayment = (order) => {
    navigate(`/payment/${order._id}`)
  }

  return (
    <div className="orders-view">
      <div className="orders-page-in-profile">
        <h2>Orders</h2>

        <div className="orders-box">
          {sortedOrders.length === 0 ? (
            <p className="cart-empty">No orders found.</p>
          ) : (
            sortedOrders.map((order) => {
              const isUnpaidAccepted =
                order.status === "accepted" &&
                order.paymentStatus === "not-paid" &&
                order.paymentMethod === "Card"

              return (
                <div
                  key={order._id}
                  className="order-card-in-profile"
                >
                  <h3>{STATUS_DISPLAY_MAP[order.status] || order.status}</h3>

                  <div className="inline">
                    <h6>Order ID:</h6>
                    <p>{order._id}</p>
                  </div>

                  <div className="inline">
                    <h6>Total Price:</h6>
                    <p>{order.totalPrice.toFixed(3)} BHD</p>
                  </div>

                  <div className="inline">
                    <h6>Payment Status:</h6>
                    <p>
                      {PAYMENT_DISPLAY_MAP[order.paymentStatus] ||
                        order.paymentStatus ||
                        "Unknown"}
                    </p>
                  </div>

                  <p className="placed-on-date">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>

                  {isUnpaidAccepted && (
                    <button
                      className="pay-now-btn"
                      onClick={() => goToPayment(order)}
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default CustomerOrders
