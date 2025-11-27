import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

import Filter from "../components/Filter.jsx"
import { STATUS_DISPLAY_MAP } from "../services/statusMap.js"
import User from "../services/api.js"
import filter from "../assets/filter.png"
import "../../public/stylesheets/jeweler-orders.css"

const JewelerOrderPage = () => {
  const [allOrders, setAllOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [filters, setFilters] = useState({
    jewelryOrder: false,
    serviceOrder: false,
    status: "",
    collectionMethod: "",
  })
  const [showFilter, setShowFilter] = useState(false)

  const filterFields = [
    { name: "jewelryOrder", label: "Includes Jewelry", type: "checkbox" },
    { name: "serviceOrder", label: "Includes Service", type: "checkbox" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "submitted", label: "Pending" },
        { value: "accepted", label: "Accepted" },
        { value: "rejected", label: "Rejected" },
        { value: "processing", label: "Processing" },
        { value: "pickup", label: "Ready for Pickup" },
        { value: "ready", label: "Ready for Delivery" },
        { value: "out", label: "Out for Delivery" },
        { value: "delivered", label: "Delivered" },
        { value: "picked-up", label: "Picked up" },
      ],
    },
    {
      name: "collectionMethod",
      label: "Collection Method",
      type: "select",
      options: [
        { value: "pickup", label: "Pickup" },
        { value: "delivery", label: "Delivery" },
      ],
    },
  ]

  // status priority for sorting
  const STATUS_PRIORITY = {
    submitted: 0,   // Pending
    accepted: 1,
    processing: 2,
    pickup: 3,      // Ready for Pickup
    ready: 4,       // Ready for Delivery
    out: 5,         // Out for Delivery
    delivered: 6,
    "picked-up": 7,
    rejected: 8,
  }

  useEffect(() => {
    const getOrders = async () => {
      const response = await User.get(`/orders/`)
      const orders = response.data.orders || []
      setAllOrders(orders)
      setFilteredOrders(orders) // initial, will be sorted by next effect
    }
    getOrders()
  }, [])

  useEffect(() => {
    const applyFilters = () => {
      let filtered = allOrders

      if (filters.jewelryOrder) {
        filtered = filtered.filter((o) => o.jewelryOrder?.length > 0)
      }
      if (filters.serviceOrder) {
        filtered = filtered.filter((o) => o.serviceOrder?.length > 0)
      }
      if (filters.status) {
        filtered = filtered.filter((o) => o.status === filters.status)
      }
      if (filters.collectionMethod) {
        filtered = filtered.filter(
          (o) => o.collectionMethod === filters.collectionMethod
        )
      }

      const sorted = [...filtered].sort((a, b) => {
        const pa =
          STATUS_PRIORITY[a.status] !== undefined
            ? STATUS_PRIORITY[a.status]
            : Number.MAX_SAFE_INTEGER
        const pb =
          STATUS_PRIORITY[b.status] !== undefined
            ? STATUS_PRIORITY[b.status]
            : Number.MAX_SAFE_INTEGER
        return pa - pb
      })

      setFilteredOrders(sorted)
    }

    applyFilters()
  }, [filters, allOrders])

  return (
    <>
      <div className="orders-page-container">
        <div className="orders-page-header">
          <h1>Orders</h1>
        </div>
        {filteredOrders.length > 0 && (
          <button
            className="toggle-filter-btn"
            onClick={() => setShowFilter(true)}
          >
            <img src={filter} alt="filter" className="icon" title="Filter" />
          </button>
        )}

        {filteredOrders?.length === 0 ? (
          <span className="empty">No Orders.</span>
        ) : (
          <div className="orders-grid">
            {filteredOrders.map((order) => (
              <Link to={`/show-order/${order._id}`} key={order._id}>
                <div className="order-card">
                  <div className="order-image">
                    {order.jewelryOrder?.length > 0 ? (
                      <img
                        src={order.jewelryOrder[0].item?.images[0]}
                        alt="Jewelry"
                      />
                    ) : order.serviceOrder?.length > 0 ? (
                      <img
                        src={order.serviceOrder[0].service.images[0]}
                        alt="Service"
                      />
                    ) : null}
                  </div>
                  <div className="order-card-info">
                    <h3 className="order-card__title">
                      {order.jewelryOrder?.length > 0 &&
                      order.serviceOrder?.length > 0
                        ? "Mixed Order"
                        : order.jewelryOrder?.length > 0
                        ? "Jewelry Order"
                        : order.serviceOrder?.length > 0
                        ? "Service Order"
                        : "Order"}
                    </h3>
                    <div>
                      <p>
                        Status:{" "}
                        {STATUS_DISPLAY_MAP[order.status] || order.status}
                      </p>
                      <p className="order-date">
                        Placed on:{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {showFilter && (
        <div className="filter-overlay" onClick={() => setShowFilter(false)}>
          <div className="filter-wrapper" onClick={(e) => e.stopPropagation()}>
            <Filter
              filters={filters}
              onApply={(updatedFilters) => {
                setFilters(updatedFilters)
                setShowFilter(false)
              }}
              fields={filterFields}
            />
            <button
              className="close-filter-btn"
              onClick={() => setShowFilter(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default JewelerOrderPage
