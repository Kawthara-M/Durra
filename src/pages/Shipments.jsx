import { useState, useEffect } from "react"
import User from "../services/api"
import { useUser } from "../context/UserContext"
import FeedbackModal from "../components/FeedbackModal"
import LocationMap from "../components/LocationMap"
import "../../public/stylesheets/shipments.css"

const Shipments = () => {
  const { user } = useUser()

  const [shipments, setShipments] = useState([])
  const [search, setSearch] = useState("")

  const [showShipmentModal, setShowShipmentModal] = useState(false)
  const [selectedShipment, setSelectedShipment] = useState(null)

  const [secretKey, setSecretKey] = useState("")
  const [submittingKey, setSubmittingKey] = useState(false)

  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackType, setFeedbackType] = useState("success")
  const [feedbackMessage, setFeedbackMessage] = useState("")

  const STATUS_LABELS = {
    atShop: "At Shop",
    atCustomer: "At Customer",
    "out-for-shipping": "Out for Shipping",
    "received-by-shop":"Received by Shop",
    delivered: "Delivered",
  }

  const STATUS_PRIORITY = {
    atShop: 0,
    "out-for-shipping": 1,
    delivered: 2,
  }

  const formatStatus = (status) =>
    STATUS_LABELS[status] ||
    (status ? status.charAt(0).toUpperCase() + status.slice(1) : "")

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const response = await User.get("/shipments")
        setShipments(response.data.shipments || [])
      } catch (error) {
        console.error("Error fetching shipments:", error)
        setFeedbackType("error")
        setFeedbackMessage("Failed to load shipments.")
        setShowFeedbackModal(true)
      }
    }

    if (user?.role === "Driver") fetchShipments()
  }, [user])

  const filteredShipments = shipments.filter((s) =>
    s?._id?.toLowerCase().includes(search.toLowerCase())
  )

  const sortedShipments = [...filteredShipments].sort((a, b) => {
    const pa =
      STATUS_PRIORITY[a.status] !== undefined
        ? STATUS_PRIORITY[a.status]
        : Number.MAX_SAFE_INTEGER
    const pb =
      STATUS_PRIORITY[b.status] !== undefined
        ? STATUS_PRIORITY[b.status]
        : Number.MAX_SAFE_INTEGER
    return pa - pb
  })

  const openShipmentModal = (shipment) => {
    setSelectedShipment(shipment)
    setSecretKey("")
    setShowShipmentModal(true)
  }

  const closeShipmentModal = () => {
    setSelectedShipment(null)
    setShowShipmentModal(false)
    setSecretKey("")
  }

  const formatAddress = (addr) => {
    if (!addr) return "Address not available"

    const parts = []
    if (addr.road) parts.push(`Road: ${addr.road}`)
    if (addr.area) parts.push(addr.area)
    if (addr.block) parts.push(`Block: ${addr.block}`)
    if (addr.house) parts.push(`House: ${addr.house}`)
    if (addr.governorate || addr.governante)
      parts.push(`Governorate: ${addr.governorate || addr.governante}`)

    return parts.join(", ") || "Address not available"
  }

  const getPickupAddress = (shipment) => {
    if (!shipment?.order) return null

    const { order } = shipment

    if (shipment.status === "atCustomer") {
      return order.address || null
    }

    return order.shop?.user?.defaultAddress || null
  }

  const getDeliveryAddress = (shipment) => {
    if (!shipment?.order) return null

    const { order } = shipment

    if (shipment.status === "atCustomer") {
      return order.shop?.user?.defaultAddress || null
    }

    return order.address || null
  }

  const getCoords = (addr) => {
    if (
      addr &&
      Array.isArray(addr.coordinates) &&
      addr.coordinates.length === 2 &&
      addr.coordinates[0] != null &&
      addr.coordinates[1] != null
    ) {
      return addr.coordinates
    }
    return null
  }

  const canEnterSecretKey =
    selectedShipment && selectedShipment.status === "out-for-shipping"

  const handleSubmitSecretKey = async (e) => {
    e.preventDefault()
    if (!selectedShipment || !secretKey.trim()) return

    setSubmittingKey(true)
    try {
      const res = await User.put(`/shipments/${selectedShipment._id}`, {
        securityKey: secretKey.trim(),
      })

      const updated = res.data.shipment || res.data

      setShipments((prev) =>
        prev.map((s) => (s._id === updated._id ? updated : s))
      )
      setSelectedShipment(updated)

      setFeedbackType("success")
      setFeedbackMessage("Shipment marked as delivered successfully.")
      setShowFeedbackModal(true)
      setSecretKey("")
      setShowShipmentModal(false)
    } catch (error) {
      const msg =
        error.response?.data?.msg ||
        error.response?.data?.error ||
        "Failed to verify secret key."
      setFeedbackType("error")
      setFeedbackMessage(msg)
      setShowFeedbackModal(true)
    } finally {
      setSubmittingKey(false)
    }
  }

  if (user?.role !== "Driver") return null

  return (
    <div className="shipments-page">
      <div className="shipments-header">
        <h1>Shipments</h1>

        <div className="shipments-header-actions">
          <input
            type="text"
            placeholder="Search by Shipment ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="shipments-body">
        {sortedShipments.length === 0 ? (
          <p>No matching shipments.</p>
        ) : (
          <div className="shipments-list">
            {sortedShipments.map((s) => (
              <div
                key={s._id}
                className="shipment-item"
                onClick={() => openShipmentModal(s)}
              >
                <div className="shipment-item-left-side">
                  <h3>{formatStatus(s.status)}</h3>
                  <p>{s._id}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showShipmentModal && selectedShipment && (
        <div className="shipments-overlay" onClick={closeShipmentModal}>
          <div className="shipments-modal" onClick={(e) => e.stopPropagation()}>
            <div className="add-user-modal-header">
              <h2>Shipment Details</h2>
              <button className="close-modal-btn" onClick={closeShipmentModal}>
                ✕
              </button>
            </div>

            <div className="shipment-info-modal-body">
              <span className="shipment-info-field">
                <h6>Shipment ID</h6>
                <p>{selectedShipment._id}</p>
              </span>

              <span className="shipment-info-field">
                <h6>Status</h6>
                <p>{formatStatus(selectedShipment.status)}</p>
              </span>

              {(() => {
                const pickupAddr = getPickupAddress(selectedShipment)
                const deliveryAddr = getDeliveryAddress(selectedShipment)
                const pickupCoords = getCoords(pickupAddr)
                const deliveryCoords = getCoords(deliveryAddr)

                return (
                  <>
                    <div className="shipment-address-section">
                      <h5>Pickup Location 📍</h5>
                      <p>{formatAddress(pickupAddr)}</p>
                      {pickupCoords && (
                        <div className="shipment-map-wrapper">
                          <LocationMap position={pickupCoords} />
                        </div>
                      )}
                    </div>

                    <div className="shipment-address-section">
                      <h5>Delivery Location 📍</h5>
                      <p>{formatAddress(deliveryAddr)}</p>
                      {deliveryCoords && (
                        <div className="shipment-map-wrapper">
                          <LocationMap position={deliveryCoords} />
                        </div>
                      )}
                    </div>
                  </>
                )
              })()}

              {canEnterSecretKey && (
                <form
                  className="shipment-secret-key-form"
                  onSubmit={handleSubmitSecretKey}
                >
                  <h5>Enter Delivery Secret Key</h5>
                  <p className="shipment-secret-key-hint">
                    Ask the customer for their code and enter it below to
                    confirm delivery.
                  </p>
                  <input
                    type="text"
                    placeholder="Enter secret key"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="confirm-add-user-btn"
                    disabled={submittingKey || !secretKey.trim()}
                  >
                    {submittingKey ? "Submitting..." : "Mark as Delivered"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      <FeedbackModal
        show={showFeedbackModal}
        type={feedbackType}
        message={feedbackMessage}
        onClose={() => setShowFeedbackModal(false)}
        actions={[
          {
            label: "OK",
            onClick: () => setShowFeedbackModal(false),
          },
        ]}
      />
    </div>
  )
}

export default Shipments
