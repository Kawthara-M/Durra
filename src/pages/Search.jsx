import { useState, useEffect } from "react"
import { useLocation, useSearchParams } from "react-router-dom"

import ProductCard from "../components/ProductCard"
import User from "../services/api"

import { fetchMetalRates } from "../services/calculator.js"
import placeholder from "../assets/placeholder.png"
import "../../public/stylesheets/search.css"

const Search = () => {
  const location = useLocation()

  const [searchParams] = useSearchParams()
  const query = searchParams.get("search")

  const [results, setResults] = useState(location.state?.results || null)
  const [metalRates, setMetalRates] = useState(null)

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return
      setResults(null)

      try {
        const response = await User.get("/search", {
          params: { search: query },
        })
        setResults(response.data)
      } catch (err) {
        console.error("Search fetch error:", err)
        setResults([])
      }
    }

    const loadRates = async () => {
      const rates = await fetchMetalRates()
      setMetalRates(rates)
    }

    fetchResults()
    loadRates()
  }, [query])

  return (
    <div className="search-results-page">
      <span className="search-title">
        <h2>Search Results for:</h2>
        <h3>"{query}"</h3>
      </span>

      {!results ? (
        <p>Loading results...</p>
      ) : (
        <div className="search-results">
          <div className="search-grid">
            {results.shops?.map((shop) => (
              <div key={shop._id} className="search-card shop">
                <img
                  src={shop.logo || placeholder}
                  alt={shop.name}
                  className="search-card-image shop-logo"
                />
                <div className="card-info">
                  <h3 className="service-card__title">{shop.name}</h3>
                </div>
              </div>
            ))}

            {results.jewelry?.map((item) => (
              <ProductCard
                key={item._id}
                item={item}
                type="jewelry"
                metalRates={metalRates}
                showActions
                showShopName
              />
            ))}

            {results.collections?.map((collection) => (
              <ProductCard
                key={collection._id}
                item={collection}
                type="collection"
                metalRates={metalRates}
                showActions
                showShopName
              />
            ))}

            {results.services?.map((service) => (
              <ProductCard
                key={service._id}
                item={service}
                type="service"
                showActions
                showShopName
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Search
