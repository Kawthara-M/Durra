import { useEffect, useState } from "react"
import {
  getComparison,
  addToComparison,
  removeFromComparison,
} from "../services/comparsionService.js"
import {
  fetchMetalRates,
  calculatePreciousMaterialCost,
  calculateTotalCost,
} from "../services/calculator"
import deleteIcon from "../assets/delete.png"
import "../../public/stylesheets/comparsion.css"

const Comparsion = ({ isOverlay = false, currentJewelryId, onClose }) => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [prices, setPrices] = useState({}) 

  const formatCertificationName = (name) => {
    if (!name) return ""
    if (name.toUpperCase() === "GIA") {
      return "Gemological Institute of America (GIA)"
    }
    return name
  }

  const computePrices = async (jewelryList) => {
    if (!jewelryList || jewelryList.length === 0) {
      setPrices({})
      return
    }

    try {
      const rates = await fetchMetalRates()
      const nextPrices = {}

      jewelryList.forEach((j) => {
        const preciousCost = calculatePreciousMaterialCost(
          j.preciousMaterials || [],
          rates
        )
        const total = calculateTotalCost(preciousCost, j.originPrice)
        nextPrices[j._id] = Number(total.toFixed(2))
      })

      setPrices(nextPrices)
    } catch (err) {
      console.error("Failed to compute prices for comparison:", err)
      setPrices({})
    }
  }

  useEffect(() => {
    const loadComparison = async () => {
      setLoading(true)
      setError("")

      try {
        let comparsion = null

        if (currentJewelryId) {
          comparsion = await addToComparison(currentJewelryId)
        } else {
          comparsion = await getComparison()
        }

        const list = comparsion?.jewelry || []
        setItems(list)
        await computePrices(list)
      } catch (err) {
        console.error("Failed to load comparison:", err)
        setError("Failed to load comparison.")
        setItems([])
        setPrices({})
      } finally {
        setLoading(false)
      }
    }

    loadComparison()
  }, [currentJewelryId])

  const handleRemove = async (id) => {
    try {
      const comparsion = await removeFromComparison(id)
      const list = comparsion?.jewelry || []
      setItems(list)
      await computePrices(list)
    } catch (err) {
      console.error("Failed to update comparison:", err)
      setError("Failed to update comparison.")
    }
  }

  const content = (
    <div className="comparison-container">
      <div className="comparison-header">
        <h2>Compare Jewelry</h2>
        {!isOverlay && <span className="comparsion-page-description">Let it be a Wise Decision</span>}
        {onClose && (
          <button
            type="button"
            className="comparison-close-btn"
            onClick={onClose}
          >
            ✕
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading comparison . . .</p>
      ) : error ? (
        <p className="comparison-error">{error}</p>
      ) : items.length === 0 ? (
        <p>No jewelry added for comparison yet.</p>
      ) : (
        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Attribute</th>
                {items.map((j) => (
                  <th key={j._id} className="item-cell">
                    <div className="comparison-item-header">
                      {j.images?.length > 0 && (
                        <img
                          src={j.images[0]}
                          alt={j.name}
                          className="comparison-image"
                        />
                      )}
                      <span className="comparison-name">{j.name}</span>
                      <button
                        type="button"
                        className="comparison-remove-btn"
                        onClick={() => handleRemove(j._id)}
                      >
                        <img src={deleteIcon} alt="Delete" className="icon" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Price</td>
                {items.map((j) => {
                  const price = prices[j._id]
                  return (
                    <td key={j._id}>
                      {typeof price === "number"
                        ? `${price.toFixed(2)} BHD`
                        : "-"}
                    </td>
                  )
                })}
              </tr>

              <tr>
                <td>Main Material</td>
                {items.map((j) => (
                  <td key={j._id}>{j.mainMaterial || "-"}</td>
                ))}
              </tr>

              <tr>
                <td>Total Weight</td>
                {items.map((j) => (
                  <td key={j._id}>
                    {j.totalWeight ? `${j.totalWeight} g` : "-"}
                  </td>
                ))}
              </tr>

              <tr>
                <td>Precious Metals</td>
                {items.map((j) => (
                  <td key={j._id}>
                    {j.preciousMaterials?.length
                      ? j.preciousMaterials
                          .map(
                            (m) => `${m.karat}K ${m.name} (${m.weight}g)`
                          )
                          .join(", ")
                      : "-"}
                  </td>
                ))}
              </tr>

              <tr>
                <td>Diamonds</td>
                {items.map((j) => (
                  <td key={j._id}>
                    {j.diamonds?.length
                      ? j.diamonds
                          .map(
                            (d) =>
                              `${d.number}x ${d.type} (${d.weight}g, ${d.color}/${d.clarity})`
                          )
                          .join("; ")
                      : "-"}
                  </td>
                ))}
              </tr>

              <tr>
                <td>Pearls</td>
                {items.map((j) => (
                  <td key={j._id}>
                    {j.pearls?.length
                      ? j.pearls
                          .map(
                            (p) =>
                              `${p.number}x ${p.type} ${p.shape} ${p.color} (${p.weight}g)`
                          )
                          .join("; ")
                      : "-"}
                  </td>
                ))}
              </tr>

              <tr>
                <td>Other Materials</td>
                {items.map((j) => (
                  <td key={j._id}>
                    {j.otherMaterials?.length
                      ? j.otherMaterials
                          .map((m) => `${m.name} (${m.weight}g)`)
                          .join("; ")
                      : "-"}
                  </td>
                ))}
              </tr>

              <tr>
                <td>Certifications</td>
                {items.map((j) => {
                  const verified =
                    j.certifications?.filter((c) => c.isVerified) || []

                  return (
                    <td key={j._id}>
                      {verified.length
                        ? verified
                            .map((c) => {
                              const name = formatCertificationName(c.name)
                              const parts = [name].filter(Boolean)

                              if (c.reportNumber) {
                                parts.push(`Report ${c.reportNumber}`)
                              }
                              if (c.reportDate) {
                                parts.push(`Issued on ${c.reportDate}`)
                              }

                              return parts.join(" - ")
                            })
                            .join("; ")
                        : "-"}
                    </td>
                  )
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  if (isOverlay) {
    return (
      <div className="comparison-overlay">
        <div className="comparison-modal">{content}</div>
      </div>
    )
  }

  return <div className="comparison-page">{content}</div>
}

export default Comparsion
