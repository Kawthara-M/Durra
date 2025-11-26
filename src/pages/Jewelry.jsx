import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

import ProductCard from "../components/ProductCard"
import Filter from "../components/Filter.jsx"
import User from "../services/api"
import {
  fetchMetalRates,
  calculatePreciousMaterialCost,
  calculateTotalCost,
  calculateCollectionPrice,
} from "../services/calculator.js"
import jewelryImage from "../assets/jewelry-page.jpg"
import filter from "../assets/filter.png"
import "../../public/stylesheets/jewelry-page.css"

const Jewelry = () => {
  const [jewelry, setJewelry] = useState([])
  const [collections, setCollections] = useState([])

  const [filteredJewelry, setFilteredJewelry] = useState([])
  const [filteredCollections, setFilteredCollections] = useState([])

  const [metalRates, setMetalRates] = useState()
  const [loading, setLoading] = useState(true)

  const filterFields = [
    { name: "singlePiece", label: "Single Piece", type: "checkbox" },
    { name: "collection", label: "Collections", type: "checkbox" },

    {
      name: "type",
      label: "Type",
      type: "select",
      options: [
        { value: "", label: "All Types" },
        { value: "ring", label: "Ring" },
        { value: "necklace", label: "Necklace" },
        { value: "bracelet", label: "Bracelet" },
        { value: "earrings", label: "Earrings" },
        { value: "pendant", label: "Pendant" },
      ],
    },

    {
      name: "material",
      label: "Material",
      type: "select",
      options: [
        { value: "", label: "All Materials" },
        { value: "gold", label: "Gold" },
        { value: "silver", label: "Silver" },
        { value: "platinum", label: "Platinum" },
        { value: "diamond", label: "Diamond" },
        { value: "pearl", label: "Pearl" },
      ],
    },
  ]

  const [filters, setFilters] = useState({
    singlePiece: false,
    collection: false,
    type: "",
    material: "",
  })
  const [showFilter, setShowFilter] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [jewelryRes, collectionsRes, rates] = await Promise.all([
          User.get("/jewelry/"),
          User.get("/collections/"),
          fetchMetalRates(),
        ])

        setJewelry(jewelryRes.data.jewelry)
        setFilteredJewelry(jewelryRes.data.jewelry)

        setCollections(collectionsRes.data.collections)
        setFilteredCollections(collectionsRes.data.collections)

        setMetalRates(rates)
      } catch (error) {
        console.error("Failed to load data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (showFilter) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [showFilter])

  const getJewelryPrice = (item) => {
    if (!metalRates) return null
    const metalCost = calculatePreciousMaterialCost(
      item.preciousMaterials,
      metalRates
    )
    const total = calculateTotalCost(metalCost, item.originPrice)
    return Number(total.toFixed(2))
  }

  const getCollectionPriceValue = (collection) => {
    if (!metalRates) return null
    const price = calculateCollectionPrice(collection, metalRates)
    return Number(price.toFixed(2))
  }

  const applyFilters = (filters) => {
    let filteredJewelry = [...jewelry]
    let filteredCollections = [...collections]

    if (filters.type) {
      filteredJewelry = filteredJewelry.filter(
        (item) => item.type?.toLowerCase() === filters.type
      )
      filteredCollections = []
    }

    if (filters.material) {
      const mat = filters.material.toLowerCase()

      filteredJewelry = filteredJewelry.filter((item) => {
        const matchMain = item.mainMaterial?.toLowerCase() === mat
        const matchPrecious = item.preciousMaterials?.some(
          (pm) => pm.name?.toLowerCase() === mat
        )
        const matchDiamond = mat === "diamond" && item.diamonds?.length > 0
        const matchPearl = mat === "pearl" && item.pearls?.length > 0
        const matchOther = item.otherMaterials?.some(
          (m) => m.name?.toLowerCase() === mat
        )
        return (
          matchMain || matchPrecious || matchDiamond || matchPearl || matchOther
        )
      })
    }

    if (filters.singlePiece && !filters.collection) filteredCollections = []
    if (!filters.singlePiece && filters.collection) filteredJewelry = []

    if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
      filteredJewelry = filteredJewelry.filter((item) => {
        const price = getJewelryPrice(item)
        return price >= filters.minPrice && price <= filters.maxPrice
      })

      filteredCollections = filteredCollections.filter((col) => {
        const price = getCollectionPriceValue(col)
        return price >= filters.minPrice && price <= filters.maxPrice
      })
    }

    setFilteredJewelry(filteredJewelry)
    setFilteredCollections(filteredCollections)
  }

  if (loading) return <div className="loader"></div>

  return (
    <>
      {jewelry.length > 0 && (
        <>
          <div className="jewelry-page-container">
            <div
              className="jewelry-page-header"
              style={{
                backgroundImage: `url(${jewelryImage})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
              }}
            >
              <h1>Jewelry</h1>
              <p>"The Finest of Jewelry and Collections"</p>
            </div>
            <div className="jewelry-page">
              <div className="jewelry-page-overview">
                <button
                  className="filter-toggle"
                  onClick={() => setShowFilter(true)}
                >
                  <img
                    src={filter}
                    alt="filter"
                    className="icon"
                    title="Filter"
                  />
                </button>

                {showFilter && (
                  <div
                    className="jewelry-filter-backdrop"
                    onClick={() => setShowFilter(false)}
                  />
                )}

                <div
                  className={`jewelry-filter-sidebar ${
                    showFilter ? "open" : ""
                  }`}
                >
                  <button
                    className="jewelry-filter-close-btn"
                    onClick={() => setShowFilter(false)}
                    title="Close"
                  >
                    ✕
                  </button>

                  <Filter
                    filters={filters}
                    fields={filterFields}
                    showPrice={true}
                    onApply={(f) => {
                      setFilters(f)
                      applyFilters(f)
                      setShowFilter(false)
                    }}
                  />
                </div>
              </div>

              <div className="jewelry-grid">
                {filteredJewelry.map((j) => (
                  <ProductCard
                    key={j._id}
                    item={j}
                    type="jewelry"
                    metalRates={metalRates}
                    showActions={true}
                    showShopName
                  />
                ))}

                {filteredCollections.map((c) => (
                  <Link key={c._id} to={`/collections/${c._id}`}>
                    <ProductCard
                      item={c}
                      type="collection"
                      metalRates={metalRates}
                      showActions={true}
                      showShopName
                    />
                  </Link>
                ))}

                {filteredJewelry.length === 0 &&
                  filteredCollections.length === 0 && (
                    <div className="empty-wrapper">
                      <p className="empty">No Jewelry Available</p>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default Jewelry
