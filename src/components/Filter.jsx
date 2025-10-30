import { useState, useEffect } from "react"
import Slider from "@mui/material/Slider"
import Box from "@mui/material/Box"
import "../../public/stylesheets/filter.css"

const Filter = ({ filters, onApply, fields, showPrice = true }) => {
  const [localFilters, setLocalFilters] = useState(filters)
  const [minPrice, setMinPrice] = useState(filters.minPrice || 0)
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice || 5000)

  const minDistance = 10

  useEffect(() => {
    setLocalFilters(filters)
    setMinPrice(filters.minPrice || 0)
    setMaxPrice(filters.maxPrice || 5000)
  }, [filters])

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target
    setLocalFilters({ ...localFilters, [name]: checked })
  }

  const handleSelectChange = (e) => {
    const { name, value } = e.target
    setLocalFilters({ ...localFilters, [name]: value })
  }

  const handlePriceChange = (_, newValue, activeThumb) => {
    if (!Array.isArray(newValue)) return

    if (activeThumb === 0) {
      setMinPrice(Math.min(newValue[0], maxPrice - minDistance))
    } else {
      setMaxPrice(Math.max(newValue[1], minPrice + minDistance))
    }
  }

  const handleApply = () => {
    onApply({
      ...localFilters,
      minPrice,
      maxPrice,
    })
  }

  const priceRange = [minPrice, maxPrice]
  return (
    <div className="filter-sidebar">
      <h3 className="filter-title">Filters</h3>

      {fields.map((field) => {
        if (field.type === "checkbox") {
          return (
            <div key={field.name} className="filter-group">
              <input
                type="checkbox"
                name={field.name}
                checked={localFilters[field.name] || false}
                onChange={handleCheckboxChange}
              />
              <label>{field.label}</label>
            </div>
          )
        }

        if (field.type === "select") {
          return (
            <div key={field.name} className="filter-group select-group">
              <label>{field.label}</label>
              <select
                name={field.name}
                value={localFilters[field.name] || ""}
                onChange={handleSelectChange}
              >
                <option value="">All</option>
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )
        }

        return null
      })}

      {showPrice && (
        <div className="filter-section">
          <label className="filter-title">Price Range (BHD)</label>

          <Box sx={{ width: "90%", mt: "0.7rem", mb: "1rem" }}>
            <Slider
              value={priceRange}
              onChange={handlePriceChange}
              valueLabelDisplay="auto"
              min={0}
              max={5000}
              disableSwap
              sx={{
                color: "var(--accent-color)",
                height: 4,
                "& .MuiSlider-thumb": {
                  width: 18,
                  height: 18,
                  backgroundColor: "#fff",
                  border: "2px solid var(--accent-color)",
                },
                "& .MuiSlider-rail": {
                  opacity: 0.4,
                  backgroundColor: "#ccc",
                },
              }}
            />
          </Box>

          <div className="range-values">
            <div className="range-box">
              <span>From</span>
              <input
                type="number"
                value={minPrice}
                onChange={(e) =>
                  setMinPrice(Math.min(Number(e.target.value), maxPrice - 1))
                }
              />
            </div>

            <div className="range-box">
              <span>To</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) =>
                  setMaxPrice(Math.max(Number(e.target.value), minPrice + 1))
                }
              />
            </div>
          </div>
        </div>
      )}

      <button className="apply-filter-btn" onClick={handleApply}>
        Filter
      </button>
    </div>
  )
}

export default Filter
