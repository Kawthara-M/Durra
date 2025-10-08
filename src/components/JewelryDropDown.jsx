import { useState, useRef, useEffect } from "react"
import "../../public/stylesheets/collection-form.css"

const JewelryDropdown = ({ jewelry, formData, setFormData }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef()

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleToggle = () => {
    setIsOpen((prev) => !prev)
  }

  const handleSelect = (id) => {
    setFormData((prev) => {
      const current = new Set(prev.jewelry)
      if (current.has(id)) {
        current.delete(id)
      } else {
        current.add(id)
      }
      return {
        ...prev,
        jewelry: Array.from(current),
      }
    })
  }

  const selectedJewelry = jewelry?.filter((j) =>
    (formData.jewelry || []).includes(j._id)
  )
  return (
    <div className="jewelry-dropdown" ref={dropdownRef}>
      <label>
        <span className="required">*</span> Select Jewelry in Collection
      </label>
      <div className="dropdown-header" onClick={handleToggle}>
        {selectedJewelry.length > 0
          ? selectedJewelry.map((j) => j.name).join(", ")
          : "Select one or more items"}
        <span className="dropdown-arrow">{isOpen ? "▲" : "▼"}</span>
      </div>
      {isOpen && (
        <ul className="dropdown-options">
          {jewelry.map((item) => {
            const isSelected = formData.jewelry.includes(item._id)
            return (
              <li
                key={item._id}
                className={`dropdown-option ${isSelected ? "selected" : ""}`}
                onClick={() => handleSelect(item._id)}
              >
                {item.name}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default JewelryDropdown
