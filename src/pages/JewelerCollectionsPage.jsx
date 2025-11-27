import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import ProductCard from "../components/ProductCard.jsx"
import User from "../services/api"
import { useUser } from "../context/UserContext.jsx"
import { fetchMetalRates } from "../services/calculator.js"
import "../../public/stylesheets/jeweler-services.css"

const JewelerCollectionsPage = () => {
  const navigate = useNavigate()
  const { user } = useUser()
  const [collections, setCollections] = useState([])
  const [metalRates, setMetalRates] = useState()

  useEffect(() => {
    const getCollections = async () => {
      try {
        const response = await User.get(`/collections/shop`)
        setCollections(response.data.collections)
      } catch (err) {
        console.error("Failed to fetch collections", err)
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
    getCollections()
  }, [])

  if (user && user.role !== "Jeweler") {
    return (
      <span className="empty">You are not authorized to view this page.</span>
    )
  }

  return (
    <>
      {user?.role === "Jeweler" && (
        <div className="jeweler-collections">
          <div className="jeweler-jewelry-header">
            <h1 className="jeweler-jewelry-heading">Jewelry Collections</h1>
            <button
              type="button"
              title="Add Collection"
              className="add-collections"
              onClick={() => navigate("/add-collections")}
            >
              Add
            </button>
          </div>

          {collections?.length === 0 ? (
            <span className="empty">No Collections.</span>
          ) : (
            <div className="grid">
              {collections.map((collection) => {
                return (
                  <ProductCard
                    item={collection}
                    type="collection"
                    metalRates={metalRates}
                    showActions={false}
                  />
                )
              })}
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default JewelerCollectionsPage
