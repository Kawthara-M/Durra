import { useState, useEffect } from "react"
import { useLocation, useSearchParams, useNavigate } from "react-router-dom"
import { FaMapMarkerAlt } from "react-icons/fa"

import ProductCard from "../components/ProductCard"
import LocationMap from "../components/LocationMap"
import User from "../services/api"

import { fetchMetalRates } from "../services/calculator.js"
import placeholder from "../assets/placeholder.png"
import "../../public/stylesheets/search.css"

const Search = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const query = searchParams.get("search")

  const [results, setResults] = useState(location.state?.results || null)
  const [metalRates, setMetalRates] = useState(null)

  const [showMapModal, setShowMapModal] = useState(false)
  const [mapPosition, setMapPosition] = useState(null)
  const [mapShopName, setMapShopName] = useState("")
  const [mapAddressText, setMapAddressText] = useState("")

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
        <div className="loader"></div>
      ) : (
        <div className="search-results">
          <div className="search-grid">
            {results.shops?.map((shop) => {
              const address = shop.user.defaultAddress
              const hasCoords =
                address &&
                Array.isArray(address.coordinates) &&
                address.coordinates.length === 2

              const formattedAddress =
                address &&
                [
                  address.road && `Road ${address.road.trim()}`,
                  address.block && `Block ${address.block}`,
                  address.governante &&
                    ` ${address.governante.trim()}  Governate`,
                  address.area && `Area ${address.area.trim()}`,
                ]
                  .filter(Boolean)
                  .join(", ")

              return (
                <div
                  key={shop._id}
                  to={`/shop/${shop._id}`}
                  className="search-card shop"
                >
                  <img
                    src={shop.logo || placeholder}
                    alt={shop.name}
                    className="search-card-image shop-logo"
                    onClick={() => navigate(`/shop/${shop._id}`)}
                  />
                  <div
                    className="card-info"
                    onClick={() => navigate(`/shop/${shop._id}`)}
                  >
                    <h3 className="service-card__title">{shop.name}</h3>

                    <p className="shop-address">
                      {formattedAddress}
                      {hasCoords && (
                        <button
                          className="address-map-button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()

                            const [lng, lat] = address.coordinates
                            setMapPosition([lat, lng])
                            setMapShopName(shop.name)
                            setMapAddressText(formattedAddress)
                            setShowMapModal(true)
                          }}
                          title="View on map"
                        >
                          <FaMapMarkerAlt className="address-map-icon" />
                        </button>
                      )}
                    </p>
                  </div>
                </div>
              )
            })}

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

      {showMapModal && (
        <div
          className="map-modal-overlay"
          onClick={() => setShowMapModal(false)}
        >
          <div className="map-modal" onClick={(e) => e.stopPropagation()}>
            <div className="map-modal-header">
              <h3>{mapShopName}</h3>
              <button
                type="button"
                className="map-modal-close"
                onClick={() => setShowMapModal(false)}
              >
                ✕{" "}
              </button>
            </div>
            <p>{mapAddressText}</p>

            {mapPosition && (
              <LocationMap position={mapPosition} onChange={null} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Search
