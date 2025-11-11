import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import User from "../services/api"
import Filter from "../components/Filter.jsx"
import ProductCard from "../components/ProductCard"

import "../../public/stylesheets/jewelry-page.css"

const Services = () => {
  const [services, setServices] = useState([])
  const [filteredServices, setFilteredServices] = useState([])

  const [shops, setShops] = useState([])

  const [filters, setFilters] = useState({
    shop: "",
    minPrice: 0,
    maxPrice: 500,
  })

  const [showFilter, setShowFilter] = useState(false)


  useEffect(() => {
    const getServices = async () => {
      const response = await User.get("/services/")
      setServices(response.data.services)
      setFilteredServices(response.data.services)
    }

    const getShops = async () => {
      const response = await User.get("/shops/") 
      setShops(response.data.shops)
    }

    getServices()
    getShops()
  }, [])

  const applyFilters = (filters) => {
    let filtered = [...services]

    if (filters.shop) {
      filtered = filtered.filter(
        (s) => s.shop?._id?.toString() === filters.shop
      )
    }

    filtered = filtered.filter(
      (s) => s.price >= filters.minPrice && s.price <= filters.maxPrice
    )

    setFilteredServices(filtered)
  }
  const filterFields = [
    {
      name: "shop",
      label: "Shop",
      type: "select",
      options: [
        { value: "", label: "All Shops" },
        ...shops.map((shop) => ({
          value: shop._id,
          label: shop.user?.name || shop.name || "Shop",
        })),
      ],
    },
  ]

  return (
    <>
      {services.length > 0 && (
        <div className="jewelry-page">
          <h1>Services</h1>

          <div className="jewelry-page-overview">
            <p>{filteredServices.length} services</p>
            <p className="filter-toggle" onClick={() => setShowFilter(true)}>
              Filter
            </p>

            {showFilter && (
              <div
                className="jewelry-filter-backdrop"
                onClick={() => setShowFilter(false)}
              />
            )}

            <div
              className={`jewelry-filter-sidebar ${showFilter ? "open" : ""}`}
            >
              <button
                className="jewelry-filter-close-btn"
                onClick={() => setShowFilter(false)}
              >
                ✕
              </button>

              <Filter
                filters={filters}
                fields={filterFields}
                showPrice={true} 
                onApply={(f) => {
                  setFilters(f)
                  applyFilters(f)
                  setShowFilter(false)
                }}
              />
            </div>
          </div>

          <div className="jewelry-grid">
            {filteredServices.map((s) => (
              <Link key={s._id} 
              to={`/services/${s._id}`} 
              >
                <ProductCard item={s} type="service" showActions />
              </Link>
            ))}

            {filteredServices.length === 0 && <div className="empty-wrapper"><p className="empty">No Services Available</p></div>}
          </div>
        </div>
      )}
    </>
  )
}

export default Services
