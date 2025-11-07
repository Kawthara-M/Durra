import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import ProductCard from "../components/ProductCard.jsx"
import User from "../services/api"
import { fetchMetalRates } from "../services/calculator.js"
import "../../public/stylesheets/jeweler-services.css"

const JewelerCollectionsPage = () => {
  const navigate = useNavigate()
  const [collections, setCollections] = useState([])
  const [metalRates, setMetalRates] = useState()

  useEffect(() => {
    const getCollections = async () => {
      try {
        const response = await User.get("/collections/")
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

  return (
    <div className="jeweler-collections">
      <h1 className="collections-heading">Jewelry Collections</h1>

      {collections?.length === 0 ? (
        <p>No collections found.</p>
      ) : (
        <div className="grid">
          {collections.map((collection) => (
            <Link
              to={`/show-collection/${collection._id}`}
              key={collection._id}
            >
              <ProductCard
                item={collection}
                type="collection"
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
        title="Add Collection"
        onClick={() => navigate("/add-collections")}
      >
        +
      </button>
    </div>
  )
}

export default JewelerCollectionsPage
