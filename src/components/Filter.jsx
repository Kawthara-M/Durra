import { useState, useEffect } from "react"
import "../../public/stylesheets/filter.css"

const Filter = ({ filters, onApply, fields }) => {
  const [localFilters, setLocalFilters] = useState(filters)

  useEffect(() => {
    setLocalFilters(filters) // keep in sync when parent changes
  }, [filters])

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target
    setLocalFilters({ ...localFilters, [name]: checked })
  }

  const handleSelectChange = (e) => {
    const { name, value } = e.target
    setLocalFilters({ ...localFilters, [name]: value })
  }

  const handleApply = () => {
    onApply(localFilters)
  }

  return (
    <div className="filter-sidebar">
      <h3 className="filter-title">Filters</h3>

      {fields.map((field) => {
        if (field.type === "checkbox") {
          return (
            <div className="filter-group" key={field.name}>
              <label>{field.label}</label>
              <input
                type="checkbox"
                name={field.name}
                checked={localFilters[field.name] || false}
                onChange={handleCheckboxChange}
              />
            </div>
          )
        }

        if (field.type === "select") {
          return (
            <div className="filter-group" key={field.name}>
              <label>{field.label}:</label>
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

      <button className="apply-filter-btn" onClick={handleApply}>
        View Results
      </button>
    </div>
  )
}

export default Filter
