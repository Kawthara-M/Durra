import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import User from "../services/api"
import Filter from "../components/Filter.jsx"
import ProductCard from "../components/ProductCard"
import filter from "../assets/filter.png"
import jewelryImage from "../assets/services-page.jpg"
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, shopsRes] = await Promise.all([
          User.get("/services/"),
          User.get("/shops/"),
        ])

        setServices(servicesRes.data.services)
        setFilteredServices(servicesRes.data.services)
        setShops(shopsRes.data.shops)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
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

  if (loading) return <div className="loader"></div>

  return (
    <>
      {services.length > 0 && (
        <div className="jewelry-page-container">
          <div
            className="jewelry-page-header"
            style={{
              backgroundImage: `url(${jewelryImage})`,
              backgroundPosition: "left",
              backgroundSize: "cover",
              color: "black",
            }}
          >
            <h1
              style={{
                color: "black",
                top: "14rem",
              }}
            >
              Services
            </h1>
            <p
              style={{
                top: "17rem",
                color: "black",
              }}
            >
              "Keep your jewelry as new as it was"
            </p>
          </div>
          <div className="jewelry-page">
            <div className="jewelry-page-overview">
              <button
                className="filter-toggle"
                onClick={() => setShowFilter(true)}
              >
                <img
                  src={filter}
                  alt="filter"
                  className="icon"
                  title="Filter"
                />
              </button>

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
                <ProductCard
                  key={s._id}
                  item={s}
                  type="service"
                  showActions
                  showShopName
                />
              ))}

              {filteredServices.length === 0 && (
                <div className="empty-wrapper">
                  <p className="empty">No Services Available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Services
