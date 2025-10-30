import { useState, useEffect } from "react"
import { useLocation, useSearchParams } from "react-router-dom"
import { useUser } from "../context/UserContext"

import User from "../services/api"
import ProductCard from "../components/ProductCard"

import placeholder from "../assets/placeholder.png"
import "../../public/stylesheets/search.css"

const Search = () => {
  const location = useLocation()
  const { user } = useUser()
  const [searchParams] = useSearchParams()
  const query = searchParams.get("search")
  const [results, setResults] = useState(location.state?.results || null)
  const [metalRates, setMetalRates] = useState({})

  const [order, setOrder] = useState()

  const getJewelryPrice = (item) => {
    if (!metalRates) return null

    const metalCost = calculatePreciousMaterialCost(
      item.preciousMaterials,
      metalRates
    )
    const total = calculateTotalCost(metalCost, item.originPrice)

    return total.toFixed(2)
  }

  // if user accessed this page through link and not by searching first
  // there will be no location.state.results, so we have to fetch
  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return

      setResults(null) // clear old results
      try {
        const response = await User.get("/search", {
          params: { search: query },
        })
        setResults(response.data)
      } catch (err) {
        console.error("Search fetch error:", err)
        setResults(null)
      }
    }

    const loadRates = async () => {
      const rates = await fetchMetalRates()
      setMetalRates(rates)
    }

    fetchResults()
    loadRates()
  }, [query])

  const addToCart = async () => {
    if (!user) return
    // check if cart has pending order for this customer
    const customerOrders = await User.get("/orders/")
    const orderInCart = customerOrders.map((o) => {
      return o.status === "pending"
    })

    // if no, call post
    if (orderInCart.length > 0) {
      const newOrder = await User.post("/orders/")
    }

    // if yes call put
  }

  return (
    <div className="search-results-page">
      <span className="search-title">
        <h2>Search Results for:</h2>
        <h3>"{query}"</h3>
      </span>

      {!results ? (
        <p>No results found.</p>
      ) : (
        <div className="search-results">
          <div className="search-grid">
            {results.shops?.map((shop) => (
              <div key={shop._id} className="search-card shop">
                {/* add logo image */}
                <img
                  src={shop.logo || placeholder}
                  alt={shop.name}
                  className="search-card-image shop-logo"
                />
                <div className="card-info">
                  <h3 className="service-card__title">{shop.name}</h3>
                </div>
                {/* <p className="service-card__content">{shop.description}</p> */}
              </div>
            ))}

          {results.jewelry?.map((item) => (
  <ProductCard
    key={item._id}
    item={item}
    type="jewelry"
    metalRates={metalRates}
    onAddToCart={addToCart}
  />
))}

{results.services?.map((service) => (
  <ProductCard
    key={service._id}
    item={service}
    type="service"
    onAddToCart={addToCart}
  />
))}

          </div>
        </div>
      )}
    </div>
  )
}

export default Search
