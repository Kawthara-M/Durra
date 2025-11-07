import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import ProductCard from "../components/ProductCard.jsx"
import User from "../services/api"
import "../../public/stylesheets/jeweler-services.css"

const JewelerServices = () => {
  const navigate = useNavigate()
  const [services, setServices] = useState([])

  useEffect(() => {
    const getServices = async () => {
      try {
        const response = await User.get("/services/shop")
        setServices(response.data.services)
      } catch (err) {
        console.error("Failed to fetch services", err)
      }
    }
    getServices()
  }, [])

  return (
    <div className="jeweler-services">
      <h1 className="services-heading">Services</h1>

      {services?.length === 0 ? (
        <p>No services found.</p>
      ) : (
        <div className="grid">
          {services.map((service) => (
            <Link to={`/show-service/${service._id}`} key={service._id}>
              <ProductCard
                item={service}
                type="service"
                showActions={false} // hides add to cart/wishlist
              />
            </Link>
          ))}
        </div>
      )}

      <button
        type="button"
        className="add-to-jewelry-list"
        title="Add Service"
        onClick={() => navigate("/add-services")}
      >
        +
      </button>
    </div>
  )
}

export default JewelerServices
