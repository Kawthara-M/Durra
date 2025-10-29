import { useState, useEffect } from "react"
import { useLocation, useSearchParams } from "react-router-dom"

import User from "../services/api"
import placeholder from "../assets/placeholder.png"
import "../../public/stylesheets/search.css"

const Search = () => {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const query = searchParams.get("search")
  const [results, setResults] = useState(location.state?.results || null)

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

    fetchResults()
  }, [query])

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
              <div key={shop._id} className="search-card">
                {/* add logo image */}
                <img
                  src={shop.logo || placeholder}
                  alt={shop.name}
                  className="service-card__image shop-logo"
                />
                <h3 className="service-card__title">{shop.name}</h3>
                <p className="service-card__content">{shop.description}</p>
                <div className="service-card__arrow" title="Show Jeweler Page">
                  →
                </div>
              </div>
            ))}

            {results.jewelry?.map((item) => (
              <div key={item._id} className="search-card">
                <img
                  src={item.images?.[0] || placeholder}
                  alt={item.name}
                  className="service-card__image"
                />
                <h3 className="service-card__title">{item.name}</h3>
                <p className="service-card__content">{item.description}</p>
                <div className="service-card__arrow" title="Show Jewelry Page">
                  →
                </div>
              </div>
            ))}

            {results.services?.map((service) => (
              <div key={service._id} className="search-card">
                <img
                  src={service.images?.[0] || placeholder}
                  alt={service.name}
                  className="search-card-image"
                />
                <h3 className="service-card__title">{service.name}</h3>
                <p className="service-card__content price">
                  {service.price?.toFixed(2)} BD
                </p>{" "}
                <div className="service-card__arrow" title="Show Servie Page">
                  →
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Search
