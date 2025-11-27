import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import User from "../services/api"
import ProductCard from "../components/ProductCard"
import "../../public/stylesheets/shop-details.css"

const ShopDetails = () => {
  const { shopId } = useParams()
  const navigate = useNavigate()
  const [shop, setShop] = useState(null)
  const [jewelries, setJewelries] = useState([])
  const [services, setServices] = useState([])
  const [activeTab, setActiveTab] = useState("jewelry")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        setLoading(true)

        const shopResponse = await User.get(`/shops/${shopId}`)
        setShop(shopResponse.data.shop)

        const jewelryResponse = await User.get(`/jewelry/shop/${shopId}`)
        setJewelries(jewelryResponse.data.jewelries || [])

        const servicesResponse = await User.get(`/services/shop/${shopId}`)
        setServices(servicesResponse.data.services || [])
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
            {/* <p className="shop-cr">CR: {shop.cr}</p> */}
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
                  metalRates={null}
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
                  metalRates={null} // not needed for services
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
