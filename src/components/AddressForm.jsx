import { useState } from "react"
import LocationMap from "./LocationMap"

const AddressForm = ({ onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    road: "",
    building: "",
    house: "",
    area: "",
    governorate: "",
    coordinates: [],
  })
  const [showMap, setShowMap] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleMapChange = (coords) => {
    setFormData((prev) => ({ ...prev, coordinates: coords }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="address-form">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Address name (e.g. Home, Work)"
          />
          <input
            type="text"
            name="road"
            value={formData.road}
            onChange={handleChange}
            placeholder="Road"
          />
          <input
            type="text"
            name="building"
            value={formData.building}
            onChange={handleChange}
            placeholder="Building"
          />
          <input
            type="text"
            name="house"
            value={formData.house}
            onChange={handleChange}
            placeholder="House"
          />
          <input
            type="text"
            name="area"
            value={formData.area}
            onChange={handleChange}
            placeholder="Area"
          />
          <input
            type="text"
            name="governorate"
            value={formData.governorate}
            onChange={handleChange}
            placeholder="Governorate"
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            {formData.coordinates.length > 0 ? (
              <p className="text-sm text-green-700">
                📍 Selected: {formData.coordinates[0].toFixed(5)},{" "}
                {formData.coordinates[1].toFixed(5)}
              </p>
            ) : (
              <p className="text-sm text-gray-500">No location selected</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowMap(true)}
            className="text-blue-600 hover:underline"
          >
            🗺️ Select on Map
          </button>
        </div>

        <button
          type="submit"
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Save Address
        </button>
      </form>

      {showMap && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-[90%] max-w-2xl relative">
            <button
              onClick={() => setShowMap(false)}
              className="absolute top-2 right-2 text-gray-600 text-xl"
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-3">Select your location</h2>
            <LocationMap
              position={formData.coordinates}
              onChange={handleMapChange}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default AddressForm
