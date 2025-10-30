import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

import ProductCard from "../components/ProductCard"
import User from "../services/api"
import { fetchMetalRates } from "../services/calculator.js"

import "../../public/stylesheets/jewelry-page.css"

const Jewelry = () => {
  const [jewelry, setJewelry] = useState()
  const [collections, setCollections] = useState()
  const [metalRates, setMetalRates] = useState()

  useEffect(() => {
    const getJewelry = async () => {
      const response = await User.get("/jewelry/")
      setJewelry(response.data.jewelry)
    }
    const getCollections = async () => {
      const response = await User.get("/collections/")
      setJewelry(response.data.jewelry)
      setCollections(response.data.collections)
    }
    const loadRates = async () => {
      const rates = await fetchMetalRates()
      setMetalRates(rates)
    }

    loadRates()
    getJewelry()
    getCollections()
  }, [])

  return (
    <>
      {jewelry ? (
        <div className="jewelry-page">
          <h1>Jewellery</h1>
          <div className="jewelry-page-overview">
            <p>{jewelry.length} prodcuts</p>
            <p>Filter</p>
          </div>
          <div className="jewelry-page-main">
            <div className="filter-side"></div>
            <div className="jewelry-grid">
              {jewelry?.length > 0 || collections?.length > 0 ? (
                <>
                  {jewelry?.map((j) => (
                    <Link key={j._id} to={`/jewelry/${j._id}`}>
                      <ProductCard
                        item={j}
                        type="jewelry"
                        metalRates={metalRates}
                      />
                    </Link>
                  ))}

                  {collections?.map((c) => (
                    <Link key={c._id} to={`/collections/${c._id}`}>
                      <ProductCard
                        item={c}
                        type="collection"
                        metalRates={metalRates}
                      />
                    </Link>
                  ))}
                </>
              ) : (
                <p>No Products Available</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default Jewelry
