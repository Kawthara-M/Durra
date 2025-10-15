import { useState, useEffect } from "react"
import { STATUS_DISPLAY_MAP } from "../services/statusMap"
import User from "../services/api"

const CustomerOrders = () => {
  const [orders, setOrders] = useState([])

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

  const groupOrdersByStatus = (orders) => {
    return orders.reduce((acc, order) => {
      const statusKey = order.status || "unknown"
      if (!acc[statusKey]) {
        acc[statusKey] = []
      }
      acc[statusKey].push(order)
      return acc
    }, {})
  }

  const groupedOrders = groupOrdersByStatus(filteredOrders)

  return (
    <div className="orders-view">
      {filteredOrders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        Object.entries(groupedOrders).map(([statusKey, grouped]) => (
          <div key={statusKey} className="order-group-in-profile">
            <h3>{STATUS_DISPLAY_MAP[statusKey] || statusKey}</h3>
            {grouped.map((order) => (
              <div key={order._id} className="order-card-in-profile">
                <div className="inline">
                  <h6>Order ID:</h6>
                  <p>{order._id}</p>
                </div>
                <div className="inline">
                  <strong>Total Price:</strong>
                  <p>{order.totalPrice} BHD</p>
                </div>
                <p>
                  <strong>Collection:</strong> {order.collectionMethod}
                </p>
                <p>
                  <strong>Payment:</strong> {order.paymentStatus}
                </p>
                <p className="placed-on-date">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  )
}

export default CustomerOrders
