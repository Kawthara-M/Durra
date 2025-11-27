import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import User from "../services/api"
import "../../public/stylesheets/shops-page.css"

const Shops = () => {
  const navigate = useNavigate()
  const [shops, setShops] = useState([])
  const [filteredShops, setFilteredShops] = useState([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const getShops = async () => {
      try {
        const response = await User.get("/shops/")
        setShops(response.data.shops)
        setFilteredShops(response.data.shops)
      } catch (error) {
        console.error("Failed to fetch shops", error)
      }
    }
    getShops()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredShops(shops)
    } else {
      const filtered = shops.filter(
        (shop) =>
          shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shop.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredShops(filtered)
    }
  }, [searchTerm, shops])

  const handleShopClick = (shopId) => {
    navigate(`/shop/${shopId}`)
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  return (
    <div className="shops-page">
      <h1>Shops</h1>

      <div className="shops-page-overview">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search shops by name or description..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
      </div>

      <div className="shops-page-main">
        {filteredShops.length > 0 ? (
          <div className="shops-grid">
            {filteredShops.map((shop) => (
              <div
                key={shop._id}
                className="shop-card"
                onClick={() => handleShopClick(shop._id)}
              >
                <div className="shop-logo-container">
                  {shop.logo ? (
                    <img
                      src={shop.logo}
                      alt={`${shop.name} logo`}
                      className="shop-logo-circle"
                    />
                  ) : (
                    <div className="shop-logo-circle placeholder">
                      {shop.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="shop-info">
                  <h3 className="shop-name">{shop.name}</h3>
                  <p className="shop-description">
                    {shop.description || "No description available"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty">
            <p>
              {searchTerm ? "No shops match your search" : "No shops found."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Shops
