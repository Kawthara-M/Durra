import { useState, useEffect } from "react"
import PricesChart from "../components/PricesChart"
import {
  fetchMetalRates,
  getKaratAdjustedPricePerGram,
} from "../services/calculator"
import "../../public/stylesheets/live-prices.css"

const LivePrices = () => {
  const karatOptions = {
    gold: ["24", "22", "21", "18"],
    silver: ["950", "925", "830"],
    platinum: ["950"],
  }
  const [metalRates, setMetalRates] = useState({})
  const [karats, setKarats] = useState({
    gold: "24",
    silver: "925",
    platinum: "950",
  })
  const [selectedMetal, setSelectedMetal] = useState("gold")

  useEffect(() => {
    let isMounted = true

    const fetchRates = async () => {
      try {
        const rates = await fetchMetalRates()
        if (isMounted) setMetalRates(rates)
      } catch (err) {
        console.error("Failed to fetch metal rates", err)
      }
    }

    fetchRates()

    const interval = setInterval(fetchRates, 10000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  // const handleKaratChange = (metal) => {
  //   setKarats((prev) => {
  //     const options = karatOptions[metal]
  //     const currentIndex = options.indexOf(prev[metal])
  //     const nextIndex = (currentIndex + 1) % options.length
  //     return {
  //       ...prev,
  //       [metal]: options[nextIndex],
  //     }
  //   })
  // }

  const getPrice = (metal) => {
    const karat = karats[metal]
    const price = getKaratAdjustedPricePerGram(metal, karat, metalRates)
    return price.toFixed(2)
  }

  const handleMetalClick = (metal) => {
    setSelectedMetal(metal)
  }

  const handleKaratSelectChange = (metal, value) => {
    setKarats((prev) => ({
      ...prev,
      [metal]: value,
    }))
  }

  return (
    <div className="live-prices-page">
      <div className="live-prices-title">
        <h1>Precious Metals Live Prices</h1>
        <span>Right Decisions are Informed</span>
      </div>

      <div className="precious-metals-prices">
        <div
          className={`metal-card silver-prices ${
            selectedMetal === "silver" ? "selected" : ""
          }`}
          onClick={() => handleMetalClick("silver")}
        >
          <h2>Silver</h2>

          <select
            className="karat-select"
            value={karats.silver}
            onChange={(e) => handleKaratSelectChange("silver", e.target.value)}
          >
            {karatOptions.silver.map((k) => (
              <option key={k} value={k}>
                {k} Karat
              </option>
            ))}
          </select>

          <p>{getPrice("silver")} BHD</p>
        </div>

        <div
          className={`metal-card gold-prices ${
            selectedMetal === "gold" ? "selected" : ""
          }`}
          onClick={() => handleMetalClick("gold")}
        >
          <h2>Gold</h2>

          <select
            className="karat-select"
            value={karats.gold}
            onChange={(e) => handleKaratSelectChange("gold", e.target.value)}
          >
            {karatOptions.gold.map((k) => (
              <option key={k} value={k}>
                {k} Karat
              </option>
            ))}
          </select>

          <p>{getPrice("gold")} BHD</p>
        </div>

        <div
          className={`metal-card platinium-prices ${
            selectedMetal === "platinum" ? "selected" : ""
          }`}
          onClick={() => handleMetalClick("platinum")}
        >
          <h2>Platinium</h2>

          <select
            className="karat-select"
            value={karats.platinum}
            onChange={(e) =>
              handleKaratSelectChange("platinum", e.target.value)
            }
          >
            {karatOptions.platinum.map((k) => (
              <option key={k} value={k}>
                {k} Karat
              </option>
            ))}
          </select>

          <p>{getPrice("platinum")} BHD</p>
        </div>
      </div>
      <PricesChart
        selectedMetal={selectedMetal}
        selectedKarat={karats[selectedMetal]}
      />
      <p
        style={{
          textAlign: "center",
          fontSize: ".9rem",
          color: "#666",
        }}
      >
        Last updated on{" "}
        {new Date().toLocaleDateString("en-US", {
          day: "numeric",
          month: "long",
        })}
      </p>
    </div>
  )
}

export default LivePrices
