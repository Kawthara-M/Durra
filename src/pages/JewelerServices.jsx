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
      <div className="jeweler-jewelry-header">
        <h1 className="jeweler-jewelry-heading">Services</h1>
        <button
          type="button"
          title="Add Service"
          onClick={() => navigate("/add-services")}
        >
          Add Service
        </button>
      </div>
      {services?.length === 0 ? (
        <p>No services found.</p>
      ) : (
        <div className="grid">
          {services.map((service) => (
            <Link to={`/show-service/${service._id}`} key={service._id}>
              <ProductCard item={service} type="service" showActions={false} />
            </Link>
          ))}
        </div>
      )}

    </div>
  )
}

export default JewelerServices
