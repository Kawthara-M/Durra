import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"

import User from "../services/api"

import placeholder from "../assets/placeholder.png"
import "../../public/stylesheets/jeweler-services.css"

const JewelerServices = () => {
  const navigate = useNavigate()
  const [services, setServices] = useState([])

  useEffect(() => {
    const getServices = async () => {
      try {
        const response = await User.get("/services/shop")
        console.log(response.data.services)
        setServices(response.data.services)
      } catch (err) {
        console.error("Failed to fetch services", err)
      }
    }
    getServices()
  }, [])

  return (
    <>
      <div className="jeweler-services">
        <h1 className="services-heading">Services</h1>
        {services?.length === 0 ? (
          <p>No services found.</p>
        ) : (
          services?.map((service) => (
            <Link to={`/show-service/${service._id}`}>
              <div className="service-card" key={service._id}>
                <h3 className="service-card__title">{service.name}</h3>

                <img
                  src={service.images?.[0] || placeholder}
                  alt={service.name}
                  className="service-card__image"
                />

                <p className="service-card__content">{service.description}</p>
                <div>
                  <div className="service-card__date">
                    Created on{" "}
                    {new Date(service.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="service-card__arrow" title="Show Service Page">
            <span>   →</span>
                </div>
              </div>
            </Link>
          ))
        )}

        <button
          type="button"
          className="add-service"
          title="Add Services"
          onClick={() => navigate("/add-services")}
        >
          +
        </button>
      </div>
    </>
  )
}

export default JewelerServices
