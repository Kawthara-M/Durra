import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import ProductCard from "../components/ProductCard.jsx"

import User from "../services/api"
import { fetchMetalRates } from "../services/calculator.js"
import "../../public/stylesheets/jeweler-services.css"

const JewelerJewelryPage = () => {
  const navigate = useNavigate()
  const [jewelry, setJewelry] = useState([])
  const [metalRates, setMetalRates] = useState([])

  useEffect(() => {
    const getJewelry = async () => {
      try {
        const response = await User.get("/jewelry/jeweler")
        setJewelry(response.data.jewelry)
      } catch (err) {
        console.error("Failed to fetch jewelry", err)
      }
    }

    const loadRates = async () => {
      try {
        const rates = await fetchMetalRates()
        setMetalRates(rates)
      } catch (err) {
        console.error("Failed to fetch metal rates", err)
      }
    }

    loadRates()
    getJewelry()
  }, [])

  return (
    <div className="jeweler-services">
      <div className="jeweler-jewelry-header">
        <h1 className="jeweler-jewelry-heading">Jewelry</h1>
        <button
          type="button"
          title="Add Jewelry"
          onClick={() => navigate("/add-jewelry")}
        >
          Add Jewelry
        </button>
      </div>

      {jewelry?.length === 0 ? (
        <span className="empty">No Jewelry.</span>
      ) : (
        <div className="grid">
          {jewelry.map((j) => (
            <ProductCard
              item={j}
              type="jewelry"
              metalRates={metalRates}
              showActions={false}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default JewelerJewelryPage
