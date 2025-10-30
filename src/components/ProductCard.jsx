import placeholder from "../assets/placeholder.png"
import { useUser } from "../context/UserContext"
import { useCart } from "../context/CartContext.jsx"
import {
  calculatePreciousMaterialCost,
  calculateTotalCost,
} from "../services/calculator.js"

const ProductCard = ({ item, type, metalRates, onAddToCart }) => {
  const { user } = useUser()
  const { addToCart } = useCart()

  const getPrice = () => {
    if (type === "jewelry") {
      if (!metalRates) return "—"

      const metalCost = calculatePreciousMaterialCost(
        item.preciousMaterials,
        metalRates
      )
      const total = calculateTotalCost(metalCost, item.originPrice)

      return `${total.toFixed(2)} BD`
    }

    if (type === "service") return `${item.price?.toFixed(2)} BD`

    return null
  }

  return (
    <div key={item._id} className="search-card">
      <div className="search-image-wrapper">
        <img
          src={item.images?.[0] || placeholder}
          alt={item.name}
          className="search-card-image"
        />
        <div className="add-actions">
          <h6
            className={!user ? "disabled-link" : null}
            title={!user ? "Sign in to add to Cart" : "Add to Cart"}
      onClick={() => user && addToCart(item)}          >
            Add to Cart
          </h6>
          <h6
            className={!user ? "disabled-link" : null}
            title={!user ? "Sign in to add to Wishlist" : "Add to Wishlist"}
          >
            Favourite
          </h6>
        </div>
      </div>

      <div className="card-info">
        <h3 className="service-card__title">{item.name}</h3>
        <p className="service-card__content price">{getPrice()}</p>
      </div>
    </div>
  )
}

export default ProductCard
