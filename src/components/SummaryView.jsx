import { useEffect, useState, useMemo } from "react"
import {
  fetchMetalRates,
  calculatePreciousMaterialCost,
  calculateTotalCost,
  getKaratAdjustedPricePerGram,
} from "../services/calculator"

const SummaryView = ({ formData, handleChange }) => {
  const [metalRates, setMetalRates] = useState({})
  const [loadingRates, setLoadingRates] = useState(true)
  const [errorRates, setErrorRates] = useState(null)

  useEffect(() => {
    async function loadRates() {
      try {
        const rates = await fetchMetalRates()
        setMetalRates(rates)
        setLoadingRates(false)
        console.log(formData)
      } catch (error) {
        setErrorRates(error.message || "Failed to load metal rates")
        setLoadingRates(false)
      }
    }

    loadRates()
  }, [])

  const diamonds = formData?.diamonds || []
  const pearls = formData?.pearls || []
  const gemstones = formData?.otherMaterials || []

  const originCost = parseFloat(formData.originCost || 0)

  const preciousMaterialCost = useMemo(() => {
    if (!metalRates) return 0
    return calculatePreciousMaterialCost(formData.preciousMaterials, metalRates)
  }, [formData.preciousMaterials, metalRates])

  const totalCost = useMemo(
    () => calculateTotalCost(preciousMaterialCost, originCost),
    [preciousMaterialCost, originCost]
  )

  useEffect(() => {
    if (!loadingRates && metalRates) {
      handleChange({
        target: {
          name: "totalPrice",
          value: totalCost.toFixed(2),
        },
      })
    }
  }, [totalCost, loadingRates, metalRates])

  if (loadingRates) return <p>Loading metal rates...</p>
  if (errorRates) return <p className="error">{errorRates}</p>

  return (
    <div className="summary-view">
      <div className="summary-view-head">
        <h2>Jewelry Summary</h2>
        <p className="clarification">
          The following are the details of your new jewelry piece. The total
          price is estimated based on your production cost and the current
          prices of precious metals (if your piece includes any), uou may adjust
          the price according to your needs. The Submit button will remain disabled until all required information are provided.{" "}
        </p>
      </div>

      <section className="summary-description">
        <h3>Description</h3>
        <p>
          {formData.description ||
            "Providing a description enriches your customer expirence and speak of your work."}
        </p>
      </section>

      <section>
        {formData.preciousMaterials?.length > 0 ? (
          <>
            <h3>Precious Metals</h3>
            <ul>
              {formData.preciousMaterials.map((m, i) => {
                const karatPrice =
                  metalRates && m.karat
                    ? getKaratAdjustedPricePerGram(
                        m.name,
                        m.karat,
                        metalRates
                      ).toFixed(2)
                    : "N/A"

                return (
                  <li key={i}>
                    {m.name} - {m.karat} Karat - {m.weight}g — {karatPrice}{" "}
                    BHD/g
                  </li>
                )
              })}
            </ul>
          </>
        ) : null}
      </section>

      {diamonds.length > 0 && (
        <section>
          <h3>Diamonds</h3>
          <ul>
            {diamonds.map((d, i) => (
              <li key={i}>
                Weight: {d.weight}g, Clarity: {d.clarity || ""}
              </li>
            ))}
          </ul>
        </section>
      )}

      {pearls.length > 0 && (
        <section>
          <h3>Pearls</h3>
          <ul>
            {pearls.map((p, i) => (
              <li key={i}>
                Type: {p.type}, Color: {p.color}, Shape: {p.shape}, Number:{" "}
                {p.number}, Weight: {p.weight}g
              </li>
            ))}
          </ul>
        </section>
      )}

      {gemstones.length > 0 && (
        <section>
          <h3>Other Metals and Gemstones</h3>
          <ul>
            {gemstones.map((g, i) => (
              <li key={i}>
                Name: {g.name}, Weight: {g.weight}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="cost-section">
        <h3>Price Summary</h3>
        <div>
          <span className="inline">
            <p>Precious Metal Price:</p>
            <p className="price"> {preciousMaterialCost.toFixed(2)} BHD</p>
          </span>
          <span className="inline">
            {" "}
            <p>Production Cost: </p>
            <p className="price">
              {isNaN(parseFloat(formData?.productionCost))
                ? "0.00"
                : parseFloat(formData.productionCost).toFixed(2)}{" "}
              BHD
            </p>
          </span>
        </div>

        <label>Total Estimated Price</label>
        <input
          type="number"
          name="totalPrice"
          value={
            formData.totalPrice === undefined || formData.totalPrice === ""
              ? totalCost.toFixed(2)
              : parseFloat(formData.totalPrice) +parseFloat(formData.productionCost)
          }
          onChange={(e) => handleChange(e)}
          min="0"
          step="0.01"
        />
      </section>
    </div>
  )
}

export default SummaryView
