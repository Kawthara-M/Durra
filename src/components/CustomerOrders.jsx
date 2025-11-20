import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { STATUS_DISPLAY_MAP, PAYMENT_DISPLAY_MAP } from "../services/statusMap"
import User from "../services/api"

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

  const groupOrdersByStatus = (orders) =>
    orders.reduce((acc, order) => {
      const statusKey = order.status || "unknown"
      if (!acc[statusKey]) acc[statusKey] = []
      acc[statusKey].push(order)
      return acc
    }, {})

  const groupedOrders = groupOrdersByStatus(filteredOrders)

  const goToPayment = (order) => {
    navigate(`/payment/${order._id}`)
  }

  return (
    <div className="orders-view">
      <div className="orders-page-in-profile">
        <h2>Orders</h2>

        <div className="orders-box">
          {filteredOrders.length === 0 ? (
            <p className="cart-empty">No orders found.</p>
          ) : (
            Object.entries(groupedOrders).map(([statusKey, grouped]) => (
              <div key={statusKey} className="order-group-in-profile">

                {grouped.map((order) => {
                  const isUnpaidAccepted =
                  order.status === "accepted" &&
                  order.paymentStatus === "not-paid" &&
                  order.paymentMethod === "Card"
                  
                  return (
                    <div
                    key={order._id}
                    className="order-card-in-profile"
                    >
                      <h3>{STATUS_DISPLAY_MAP[statusKey] || statusKey}</h3>
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
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default CustomerOrders
