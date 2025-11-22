import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useUser } from "../context/UserContext"
import { useOrder } from "../context/OrderContext"
import { getPendingOrder, updateOrder } from "../services/order"
import LocationMap from "../components/LocationMap"
import FeedbackModal from "../components/FeedbackModal"

import User from "../services/api"
import { useOrderWait } from "../services/useOrderWait"

import mapIcon from "../assets/map.png"
import "../../public/stylesheets/checkout.css"

const Checkout = () => {
  const { user } = useUser()
  const { order, setFullOrder } = useOrder()
  const orderId = order?.orderId
  const navigate = useNavigate()

  const [fullUser, setFullUser] = useState(null)
  const [shop, setShop] = useState(null)
  const [deliveryMethod, setDeliveryMethod] = useState("delivery")
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("Cash")
  const [flatRate] = useState(2)
  const [subtotal, setSubtotal] = useState(0)
  const [vatRate] = useState(0.1)
  const [loading, setLoading] = useState(true)

  const [showAddressForm, setShowAddressForm] = useState(false)
  const [newAddress, setNewAddress] = useState({
    name: "",
    road: "",
    block: "",
    house: "",
    area: "",
    governorate: "",
    coordinates: [],
  })
  const [showMap, setShowMap] = useState(false)
  const {
    waiting,
    timedOut,
    resultStatus,
    resultOrder,
    waitForJeweler,
    cancelWait,
    clearTimeoutFlag,
    clearResultStatus,
  } = useOrderWait()

  const fetchProfile = async () => {
    try {
      const res = await User.get("/profile/")
      setFullUser(res.data.user)
    } catch (err) {
      console.error("Error fetching profile:", err)
    }
  }

  const fetchAddresses = async () => {
    try {
      const res = await User.get("/addresses")
      if (res.data.addresses?.length) {
        setAddresses(res.data.addresses)
        setSelectedAddress(res.data.addresses[0]._id)
      }
    } catch (err) {
      console.error("Failed to fetch addresses:", err)
    }
  }

  const fetchShop = async (shopId) => {
    try {
      const res = await User.get(`/shops/${shopId}`)
      setShop(res.data.shop)
    } catch (err) {
      console.error("Failed to fetch shop:", err)
    }
  }

  useEffect(() => {
    const init = async () => {
      try {
        const pending = await getPendingOrder()
        if (pending) {
          setFullOrder(pending)
          setSubtotal(pending.totalPrice || 0)
          if (pending.shop) await fetchShop(pending.shop._id || pending.shop)
        }

        await fetchProfile()
        await fetchAddresses()
      } catch (err) {
        console.error("Error loading checkout:", err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [user])

  const vat = subtotal * vatRate
  const deliveryFee = deliveryMethod === "pickup" ? 0 : flatRate
  const total = subtotal + vat + deliveryFee

  const formatAddress = (addr) => {
    if (!addr) return ""
    const parts = []
    if (addr.road) parts.push(`Road: ${addr.road}`)
    if (addr.area) parts.push(`Area: ${addr.area}`)
    if (addr.block) parts.push(`Block: ${addr.block}`)
    if (addr.house) parts.push(`House: ${addr.house}`)
    if (addr.governorate) parts.push(`Governorate: ${addr.governorate}`)
    return parts.join(", ")
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    try {
      const res = await User.post("/addresses", newAddress)
      const added = res.data.address
      setAddresses([...addresses, added])
      setSelectedAddress(added._id)
      setShowAddressForm(false)
      setNewAddress({
        name: "",
        road: "",
        block: "",
        house: "",
        area: "",
        governorate: "",
        coordinates: [],
      })
    } catch (err) {
      console.error("Add address error:", err)
      alert("Could not add address.")
    }
  }

  const isOrderValid = () => {
    if (!user) return false
    if (!order || subtotal === 0) return false
    if (!paymentMethod) return false

    if (deliveryMethod === "delivery") {
      const addr = addresses.find((a) => a._id === selectedAddress)
      if (!addr) return false

      const requiredFields = ["block", "house"]
      for (const field of requiredFields) {
        if (
          !addr[field] ||
          (Array.isArray(addr[field]) && addr[field].length === 0)
        ) {
          return false
        }
      }
    }

    return true
  }

  const handlePlaceOrder = async () => {
    try {
      const idToUse = orderId || order?._id
      if (!idToUse || !order) return

      const addressToUse =
        deliveryMethod === "pickup"
          ? shop?.user?.defaultAddress
          : selectedAddress

      const cleanedJewelryOrder = []
      const seen = new Set()

      for (const item of order.jewelryOrder || []) {
        const itemId = typeof item.item === "object" ? item.item._id : item.item

        const key = `${itemId}-${item.itemModel}`
        if (seen.has(key)) continue
        seen.add(key)

        cleanedJewelryOrder.push({
          item: itemId,
          itemModel: item.itemModel,
          quantity: item.quantity || 1,
          totalPrice: item.totalPrice || 0,
          ...(item.size ? { size: item.size } : {}),
        })
      }

      const cleanedServiceOrder = (order.serviceOrder || []).map((s) => ({
        _id: s._id,
        service: typeof s.service === "object" ? s.service._id : s.service,
        jewelry: (s.jewelry || []).map((j) => ({
          name: j.name || "",
          material: j.material || "",
          type: j.type || "",
          details: j.details || "",
        })),
        totalPrice: s.totalPrice || 0,
      }))

      const body = {
        collectionMethod:
          deliveryMethod === "pickup" ? "at-shop-collection" : "delivery",
        paymentMethod,
        address: addressToUse,
        totalPrice: total,
        jewelryOrder: cleanedJewelryOrder,
        serviceOrder: cleanedServiceOrder,
        notes: order.notes || "",
      }

      await updateOrder(idToUse, body)

      await User.put(`/orders/update-status/${idToUse}`, {
        status: "submitted",
      })

      localStorage.setItem(
        "submittedOrder",
        JSON.stringify({
          orderId: idToUse,
          status: "submitted",
        })
      )

      waitForJeweler(idToUse)
    } catch (err) {
      console.error("Failed to place order:", err)
      alert("Error placing order. Try again later.")
    }
  }

  const orderDisabled = !isOrderValid()
  const orderTitle = orderDisabled
    ? "Please fill all required information before placing the order."
    : "Place your order"

  if (loading) return <div className="loader"></div>

  return (
    <div className="checkout-wrapper" style={{ position: "relative" }}>
      <div className="checkout-page">
        <div>
          <h2>Checkout</h2>
        </div>

        <div className="checkout-details">
          <div className="checkout-left">
            <section className="checkout-section">
              <h3>Contact Information</h3>
              <div className="contact-row">
                <div className="email-field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    readOnly
                    className="readonly-input"
                  />
                </div>
                <div className="phone-field">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={fullUser?.phone || ""}
                    readOnly
                    className="readonly-input"
                  />
                </div>
              </div>
            </section>

            <section className="checkout-section">
              <h3>Delivery Method</h3>
              <div className="delivery-toggle">
                <button
                  className={deliveryMethod === "delivery" ? "selected" : ""}
                  onClick={() => setDeliveryMethod("delivery")}
                >
                  Delivery
                </button>
                <button
                  className={deliveryMethod === "pickup" ? "selected" : ""}
                  onClick={() => setDeliveryMethod("pickup")}
                >
                  Pickup
                </button>
              </div>

              {deliveryMethod === "pickup" && shop && (
                <div className="pickup-info">
                  <p>
                    <strong>Pickup From:</strong>
                  </p>
                  <p>{shop.name}</p>
                  <p>
                    {formatAddress(shop.user?.defaultAddress) ||
                      "Shop address unavailable"}
                  </p>
                </div>
              )}
            </section>

            {deliveryMethod === "delivery" && (
              <section className="checkout-section">
                <h3>Delivery Address</h3>
                <span className="checkout-address-span">
                  {addresses.length > 0 ? (
                    <>
                      <div className="checkout-address-span-select">
                        <label className="customer-select-address">
                          Select Address
                        </label>
                        <select
                          value={selectedAddress}
                          onChange={(e) => setSelectedAddress(e.target.value)}
                          className="customer-select-address"
                        >
                          {addresses.map((addr) => (
                            <option key={addr._id} value={addr._id}>
                              {addr.name ? `${addr.name} - ` : ""}
                              {formatAddress(addr)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  ) : (
                    <p>No saved addresses yet.</p>
                  )}
                  <div className="checkout-new-address-div">
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(!showAddressForm)}
                      className={`checkout-add-new-address ${
                        showAddressForm ? "selected-btn" : ""
                      }`}
                    >
                      New Address
                    </button>
                  </div>
                </span>
                {showAddressForm && (
                  <form
                    onSubmit={handleAddAddress}
                    className="checkout-address-form"
                  >
                    <label htmlFor="name">Address Name</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Address Name (e.g., Home)"
                      value={newAddress.name}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, name: e.target.value })
                      }
                    />
                    <div className="address-row">
                      <select
                        value={newAddress.governorate}
                        className="customer-select-address"
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            governorate: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Governorate</option>
                        <option value="Capital">Capital</option>
                        <option value="Muharraq">Muharraq</option>
                        <option value="Northern">Northern</option>
                        <option value="Southern">Southern</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Area"
                        value={newAddress.area}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, area: e.target.value })
                        }
                      />
                    </div>

                    <label>Address Details</label>
                    <div className="address-row">
                      <input
                        type="text"
                        name="road"
                        placeholder="Road No."
                        value={newAddress.road}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, road: e.target.value })
                        }
                      />
                      <input
                        type="text"
                        name="block"
                        placeholder="Block"
                        value={newAddress.block}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            block: e.target.value,
                          })
                        }
                      />
                      <input
                        type="text"
                        name="house"
                        placeholder="House / Apartment"
                        value={newAddress.house}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            house: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label>Coordinates</label>

                      <div className="address-buttons">
                        <span className="map-and-coordinates">
                          <button
                            type="button"
                            onClick={() => setShowMap(true)}
                            className="checkout-map-button"
                          >
                            <img src={mapIcon} alt="Map" className="icon" />
                          </button>
                          {newAddress.coordinates.length ? (
                            <span className="coordinates-span form-group">
                              📍 {newAddress.coordinates[0].toFixed(5)},{" "}
                              {newAddress.coordinates[1].toFixed(5)}
                            </span>
                          ) : null}
                        </span>
                        <button type="submit" className="checkout-save-address">
                          Save Address
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </section>
            )}

            <section className="checkout-section">
              <h3>Payment Method</h3>
              <div className="option-group" id="payment-group">
                <span className="payment-option">
                  <input
                    type="radio"
                    id="payment-cash"
                    value="Cash"
                    checked={paymentMethod === "Cash"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label htmlFor="payment-cash"> Cash on Delivery</label>
                </span>
                <span className="payment-option">
                  <input
                    type="radio"
                    id="payment-card"
                    value="Card"
                    checked={paymentMethod === "Card"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label htmlFor="payment-card"> Card Payment</label>
                </span>
              </div>
            </section>
          </div>

          <div className="checkout-summary">
            <h2 className="summary-title">Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{subtotal.toFixed(2)} BHD</span>
            </div>
            <div className="summary-row">
              <span>VAT (10%)</span>
              <span>{vat.toFixed(2)} BHD</span>
            </div>
            {deliveryMethod === "pickup" ? null : (
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span>{deliveryFee.toFixed(2)} BHD</span>
              </div>
            )}
            <hr className="summary-divider" />
            <div className="summary-total">
              <span>Total</span>
              <span>{total.toFixed(3)} BHD</span>
            </div>

            <button
              className="place-order-btn"
              onClick={handlePlaceOrder}
              disabled={orderDisabled}
              title={orderTitle}
            >
              Place Order
            </button>
          </div>
        </div>

        {showMap && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: "#fff",
                padding: "1rem",
                borderRadius: "8px",
                width: "80%",
                maxWidth: "700px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                  color: "var(--text-color)",
                }}
              >
                <h3 style={{ margin: 0 }}>Select Address on Map</h3>
                <button
                  onClick={() => setShowMap(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    fontSize: "1.2rem",
                    cursor: "pointer",
                    color: "var(--text-color)",
                    width: "fit-content",
                    textAlign: "right",
                  }}
                >
                  ✖
                </button>
              </div>

              <LocationMap
                position={
                  Array.isArray(newAddress.coordinates) &&
                  newAddress.coordinates.length === 2
                    ? newAddress.coordinates
                    : null
                }
                onChange={(coords) =>
                  setNewAddress({ ...newAddress, coordinates: coords })
                }
              />
            </div>
          </div>
        )}
      </div>

      {waiting && (
        <div className="waiting-overlay">
          <div className="waiting-box">
            <div className="waiting-loader"></div>
            <h4>Waiting for jeweler’s response...</h4>
            <p>This may take a moment.</p>
            <button className="cancel-btn" onClick={() => cancelWait(orderId)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {timedOut && (
        <FeedbackModal
          show={timedOut}
          type="info"
          message="The shop did not respond in time. You can try submitting again later."
          onClose={() => {
            clearTimeoutFlag()
            navigate("/cart")
          }}
          actions={[
            {
              label: "OK",
              onClick: () => {
                clearTimeoutFlag()
                navigate("/cart")
              },
            },
          ]}
        />
      )}

      {resultStatus && resultOrder && (
        <FeedbackModal
          show={!!resultStatus}
          type={resultStatus === "accepted" ? "success" : "error"}
          message={
            resultStatus === "accepted"
              ? "Good news! The jeweler has accepted your order."
              : resultStatus === "rejected"
              ? "Unfortunately, the jeweler has rejected your order."
              : `The order status was updated to "${resultStatus}".`
          }
          onClose={() => {
            clearResultStatus()
          }}
          actions={
            resultStatus === "accepted" &&
            resultOrder.paymentMethod === "Card" &&
            resultOrder.paymentStatus !== "Paid"
              ? [
                  {
                    label: "Go to Payment",
                    onClick: () => {
                      const totalPrice = resultOrder.totalPrice || 0
                      clearResultStatus()
                      navigate(`/payment/${resultOrder._id}`, {
                        state: { totalPrice },
                      })
                    },
                  },
                  {
                    label: "Later",
                    onClick: () => {
                      clearResultStatus()
                    },
                  },
                ]
              : [
                  {
                    label: "OK",
                    onClick: () => {
                      clearResultStatus()
                    },
                  },
                ]
          }
        />
      )}
    </div>
  )
}

export default Checkout
