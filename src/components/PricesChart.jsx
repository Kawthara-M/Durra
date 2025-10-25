import { useState, useEffect } from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js"

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
)

import User from "../services/api"

const PricesChart = ({ selectedMetal, selectedKarat }) => {
  const [priceHistory, setPriceHistory] = useState({
    gold: [],
    silver: [],
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await User.get("/metal-prices")
        console.log(res)

        const gold = Array.isArray(res.data.gold)
          ? res.data.gold.map((entry) => ({
              date: entry.date,
              prices: {
                24: entry.price24k,
                22: entry.price22k,
                21: entry.price21k,
                18: entry.price18k,
              },
            }))
          : []

        const silver = Array.isArray(res.data.silver)
          ? res.data.silver.map((entry) => {
              const purityMap = {
                950: 0.95,
                925: 0.925,
                830: 0.83,
              }

              const karatPrices = {}
              for (const k in purityMap) {
                karatPrices[k] = parseFloat(
                  ((purityMap[k] / 0.925) * entry.price925).toFixed(4)
                )
              }

              return {
                date: entry.date,
                prices: karatPrices,
              }
            })
          : []

        setPriceHistory({ gold, silver })
      } catch (err) {
        console.error("Error fetching price data from backend:", err)
      }
    }

    fetchData()
  }, [])

  const adjustPrices = (data, karat) => {
    return data
      .filter((entry) => entry.prices && entry.prices[karat])
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((entry) => ({
        date: entry.date,
        price: entry.prices[karat],
      }))
  }

  const silverAdjusted = adjustPrices(
    priceHistory.silver,
    selectedKarat || "925"
  )

  const goldAdjusted = adjustPrices(priceHistory.gold, selectedKarat)

  const chartLabels =
    selectedMetal === "silver"
      ? silverAdjusted.map((d) => d.date)
      : goldAdjusted.map((d) => d.date)

  const chartData = {
    labels: chartLabels,
    datasets: [
      selectedMetal === "gold" && selectedKarat
        ? {
            label: `Gold (${selectedKarat}K)`,
            data: goldAdjusted.map((d) => d.price),
            borderColor: "gold",
            backgroundColor: "rgba(255, 215, 0, 0.2)",
            tension: 0.4,
          }
        : selectedMetal === "silver" && selectedKarat
        ? {
            label: `Silver (${selectedKarat})`,
            data: silverAdjusted.map((d) => d.price),
            borderColor: "#000",
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            tension: 0.4,
          }
        : null,
    ].filter(Boolean),
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          pointStyle: "line",
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
      title: {
        display: true,
        position: "bottom",
        text: `Price Changes through the last 30 days (${new Date().getFullYear()})`,
        font: {
          size: 11,
        },
        color: "#333",
        padding: {
          top: 10,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          maxTicksLimit: 10,
          callback: function (value, index, ticks) {
            const date = new Date(chartLabels[index])
            return date.toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
            })
          },
        },
      },
      y: {
        title: {
          display: true,
          text: "Price (BHD)",
        },
      },
    },
  }

  return (
    <div className="prices-chart-container">
      <Line data={chartData} options={chartOptions} />
    </div>
  )
}

export default PricesChart
