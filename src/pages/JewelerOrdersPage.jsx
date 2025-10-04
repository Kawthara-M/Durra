import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

import Filter from "../components/Filter.jsx"
import User from "../services/api.js"

import "../../public/stylesheets/jeweler-orders.css"

const JewelerorderPage = () => {
  const [allOrders, setAllOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])

  const [filters, setFilters] = useState({
    jewelryOrder: false,
    serviceOrder: false,
    status: "",
    collectionMethod: "",
  })

  const filterFields = [
    {
      name: "jewelryOrder",
      label: "Includes Jewelry",
      type: "checkbox",
    },
    {
      name: "serviceOrder",
      label: "Includes Service",
      type: "checkbox",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "submitted", label: "pending" },
        { value: "accepted", label: "accepted" },
        { value: "rejected", label: "rejected" },
        { value: "processing", label: "processing" },
        { value: "pickup", label: "ready for pickup" },
        { value: "delivered", label: "delivered" },
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

  const [showFilter, setShowFilter] = useState(false)

  useEffect(() => {
    const getOrders = async () => {
      const response = await User.get(`/orders/`)
      setAllOrders(response.data.orders)
      console.log(response.data.orders)
    }

    getOrders()
  }, [])

  useEffect(() => {
    const applyFilters = () => {
      let filtered = allOrders

      if (filters.jewelryOrder) {
        filtered = filtered.filter((order) => order.jewelryOrder?.length > 0)
      }

      if (filters.serviceOrder) {
        filtered = filtered.filter((order) => order.serviceOrder?.length > 0)
      }

      if (filters.status) {
        filtered = filtered.filter((order) => order.status === filters.status)
      }

      if (filters.collectionMethod) {
        filtered = filtered.filter(
          (order) => order.collectionMethod === filters.collectionMethod
        )
      }

      setFilteredOrders(filtered)
    }

    applyFilters()
  }, [filters, allOrders])

  return (
    <>
      <div className="orders-page">
        <div className="orders-page-header">
          <h1 id="orders-page-heading">Orders</h1>
          <button
            className="toggle-filter-btn"
            onClick={() => setShowFilter(true)}
          >
            Filter
          </button>
        </div>

        {filteredOrders?.length === 0 ? (
          <p>No Orders found.</p>
        ) : (
          filteredOrders?.map((order) => (
            <Link to={`/show-order/${order._id}`} className="order-link">
              <div className="order-card" key={order._id}>
                <div>
                  <div className="order-id">
                    <h3 className="order-card__title">Order </h3>
                    <p>#{order._id}</p>
                  </div>
                </div>
                <div className="order-image">
                  {/* show image of jewelry or service */}
                  {order.jewelryOrder?.length > 0 ? (
                    <img
                      src={`${order.jewelryOrder[0].jewelry.images[0]}`}
                      alt="First Jewelry Order Image"
                    />
                  ) : order.serviceOrder?.length > 0 ? (
                    <img
                      src={`${order.serviceOrder[0].service.images[0]}`}
                      alt="First Service Order Image"
                    />
                  ) : null}
                </div>
                <div className="order-overview">
                  <div className="order-content">
                    <h4>Content(s): </h4>
                    <p> {order.jewelryOrder?.length > 0 ? "Jewelry" : null}</p>
                    <p> {order.serviceOrder?.length > 0 ? "Service" : null}</p>
                  </div>
                  <div className="order-status">
                    <h4>Order Status:</h4>
                    <p>{order.status}</p>
                  </div>
                </div>

                {/*    <div className="order-dates">
                  <div className="order-card__date">
                    Created on {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                  <div className="order-card__date">
                    Updated on {new Date(order.updatedAt).toLocaleDateString()}
                  </div>
                </div>
 */}
                <div className="order-card__arrow" title="Show order Page">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    height="15"
                    width="15"
                  >
                    <path
                      fill="#fff"
                      d="M13.4697 17.9697C13.1768 18.2626 13.1768 18.7374 13.4697 19.0303C13.7626 19.3232 14.2374 19.3232 14.5303 19.0303L20.3232 13.2374C21.0066 12.554 21.0066 11.446 20.3232 10.7626L14.5303 4.96967C14.2374 4.67678 13.7626 4.67678 13.4697 4.96967C13.1768 5.26256 13.1768 5.73744 13.4697 6.03033L18.6893 11.25H4C3.58579 11.25 3.25 11.5858 3.25 12C3.25 12.4142 3.58579 12.75 4 12.75H18.6893L13.4697 17.9697Z"
                    ></path>
                  </svg>
                </div>
              </div>
            </Link>
          ))
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

export default JewelerorderPage
