import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import ProductCard from "../components/ProductCard"
import User from "../services/api"
import { fetchMetalRates } from "../services/calculator"
import "../../public/stylesheets/wishlist.css"

const Wishlist = () => {
  const navigate = useNavigate()

  const [wishlist, setWishlist] = useState(null)
  const [metalRates, setMetalRates] = useState(null)

  useEffect(() => {
    const getWishlist = async () => {
      try {
        const response = await User.get("/wishlist")
        if (response?.data?.wishlist) {
          setWishlist(response.data.wishlist)
          console.log(response.data.wishlist)
        }
      } catch (error) {
        if (error.response?.status === 404) {
          console.log("No wishlist exists yet")
        } else {
          console.error("Error fetching wishlist:", error)
        }
      }
    }

    const loadRates = async () => {
      const rates = await fetchMetalRates()
      setMetalRates(rates)
    }

    getWishlist()
    loadRates()
  }, [])

  const handleRemoveLocal = (productId) => {
    setWishlist((prev) => ({
      ...prev,
      items: prev?.items?.filter((i) => {
        const id =
          typeof i.favouritedItem === "object"
            ? i.favouritedItem._id
            : i.favouritedItem
        return id !== productId
      }),
    }))
  }

  const hasItems = wishlist?.items?.length > 0

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <h1>Wishlist</h1>
        <span className="wishlist-overview">
          Keep your favourite selections as close as a click !
        </span>
      </div>

      {hasItems ? (
        <div className="wishlist-grid">
          {wishlist.items.map((item) => {
            const product = item.favouritedItem
            const id = typeof product === "object" ? product._id : product
            const type = item.favouritedItemType.toLowerCase()

            return (
              <Link to={`/${type}/${id}`} key={id}>
                <ProductCard
                  item={product}
                  type={type}
                  metalRates={metalRates}
                  inWishlistPage
                  onRemove={handleRemoveLocal}
                  showActions
                />
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="wishlist-empty-container">
          <p>No items in your wishlist.</p>
          <button onClick={() => navigate("/Home")}>Add</button>
        </div>
      )}
    </div>
  )
}

export default Wishlist
