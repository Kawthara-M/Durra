import { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"

const LocationMap = ({ position, onChange }) => {
  const [marker, setMarker] = useState(position)

  useEffect(() => {
    if (position) setMarker(position)
  }, [position])

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng
        const newPos = [lat, lng]
        setMarker(newPos)
        onChange && onChange(newPos)
      },
    })
    return null
  }

  return (
    <>
      <MapContainer
        center={marker || [26.0667, 50.5577]}
        zoom={marker ? 15 : 10}
        scrollWheelZoom={true}
        style={{ height: "400px", width: "100%" }} 
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler />
        {marker && <Marker position={marker} />}
      </MapContainer>
      {marker && (
        <div className="selected-coordinates">
          <p>
            Selected location:{" "}
            <strong>
              {marker[0].toFixed(6)}, {marker[1].toFixed(6)}
            </strong>
          </p>
        </div>
      )}
    </>
  )
}

export default LocationMap
