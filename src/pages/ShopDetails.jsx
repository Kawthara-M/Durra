import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import User from "../services/api"
import ProductCard from "../components/ProductCard"
import { fetchMetalRates } from "../services/calculator" 
import "../../public/stylesheets/shop-details.css"

const ShopDetails = () => {
  const { shopId } = useParams()
  const navigate = useNavigate()
  const [shop, setShop] = useState(null)
  const [jewelries, setJewelries] = useState([])
  const [services, setServices] = useState([])
  const [activeTab, setActiveTab] = useState("jewelry")
  const [loading, setLoading] = useState(true)
  const [metalRates, setMetalRates] = useState(null) 

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        setLoading(true)
        const [shopResponse, jewelryResponse, servicesResponse, rates] =
          await Promise.all([
            User.get(`/shops/${shopId}`),
            User.get(`/jewelry/shop/${shopId}`),
            User.get(`/services/shop/${shopId}`),
            fetchMetalRates(),
          ])

        setShop(shopResponse.data.shop)
        setJewelries(jewelryResponse.data.jewelries || [])
        setServices(servicesResponse.data.services || [])
        setMetalRates(rates || null) 
      } catch (error) {
        console.error("Failed to fetch shop data", error)
      } finally {
        setLoading(false)
      }
    }

    fetchShopData()
  }, [shopId])

  const handleJewelryClick = (jewelryId) => {
    navigate(`/jewelry/${jewelryId}`)
  }

  const handleServiceClick = (serviceId) => {
    navigate(`/services/${serviceId}`)
  }

  if (loading) {
    return (
      <div className="shop-details-page">
        <div className="loading">Loading shop details...</div>
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="shop-details-page">
        <div className="error">Shop not found</div>
      </div>
    )
  }

  return (
    <div className="shop-details-page">
      <div className="shop-header">
        <div className="shop-header-content">
          <div className="shop-logo-large">
            {shop.logo ? (
              <img src={shop.logo} alt={`${shop.name} logo`} />
            ) : (
              <div className="logo-placeholder">
                {shop.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="shop-info">
            <h1 className="shop-title">{shop.name}</h1>
            {shop.description && (
              <p className="shop-description-large">{shop.description}</p>
            )}
            <div className="shop-meta">
              <p>Member since {new Date(shop.createdAt).getFullYear()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="shop-tabs">
        <button
          className={`tab-button ${activeTab === "jewelry" ? "active" : ""}`}
          onClick={() => setActiveTab("jewelry")}
        >
          Jewelry ({jewelries.length})
        </button>
        <button
          className={`tab-button ${activeTab === "services" ? "active" : ""}`}
          onClick={() => setActiveTab("services")}
        >
          Services ({services.length})
        </button>
      </div>

      {activeTab === "jewelry" && (
        <div className="items-section">
          {jewelries.length > 0 ? (
            <div className="jewelry-grid">
              {jewelries.map((jewelry) => (
                <ProductCard
                  key={jewelry._id}
                  item={jewelry}
                  type="jewelry"
                  metalRates={metalRates} 
                  onClick={() => handleJewelryClick(jewelry._id)}
                  showShopName
                  showActions
                />
              ))}
            </div>
          ) : (
            <div className="no-items">
              <p>No jewelry pieces found for this shop.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "services" && (
        <div className="items-section">
          {services.length > 0 ? (
            <div className="jewelry-grid">
              {services.map((service) => (
                <ProductCard
                  key={service._id}
                  item={service}
                  type="service"
                  showShopName
                  showActions
                  metalRates={null} 
                  onClick={() => handleServiceClick(service._id)}
                />
              ))}
            </div>
          ) : (
            <div className="no-items">
              <p>No services found for this shop.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ShopDetails
