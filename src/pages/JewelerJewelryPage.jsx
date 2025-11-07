import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import ProductCard from "../components/ProductCard.jsx"

import User from "../services/api"
import {
  fetchMetalRates,
  calculatePreciousMaterialCost,
  calculateTotalCost,
  calculateCollectionPrice,
} from "../services/calculator.js"
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
      <h1 className="services-heading">Jewelry</h1>

      {jewelry?.length === 0 ? (
        <p>No Jewelry found.</p>
      ) : (
        <div className="grid">
          {jewelry.map((j) => (
            <Link to={`/show-jewelry/${j._id}`} key={j._id}>
              <ProductCard
                item={j}
                type="jewelry"
                metalRates={metalRates}
                showActions={false} 
              />
            </Link>
          ))}
        </div>
      )}

      <button
        type="button"
        className="add-to-jewelry-list"
        title="Add Jewelry"
        onClick={() => navigate("/add-jewelry")}
      >
        +
      </button>
    </div>
  )
}

export default JewelerJewelryPage
