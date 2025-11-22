import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { updateOrder, payForOrder } from "../services/order"
import User from "../services/api"
import { COLLECTION_DISPLAY_MAP } from "../services/statusMap"
import FeedbackModal from "../components/FeedbackModal"

import "../../public/stylesheets/payment.css"

const VAT_RATE = 0.1
const DELIVERY_FLAT_RATE = 2

const Payment = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()

  const [order, setOrder] = useState(null)
  const [subtotal, setSubtotal] = useState(0)
  const [vat, setVat] = useState(0)
  const [deliveryFee, setDeliveryFee] = useState(0)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const [paymentDetails, setPaymentDetails] = useState({
    name: "",
    number: "",
    expiry: "",
    pin: "",
  })

  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return
      try {
        const response = await User.get(`/orders/${orderId}`)
        const fetchedOrder = response.data.order
        setOrder(fetchedOrder)

        const jewelrySubtotal = (fetchedOrder.jewelryOrder || []).reduce(
          (sum, j) => sum + (j.totalPrice || 0),
          0
        )
        const serviceSubtotal = (fetchedOrder.serviceOrder || []).reduce(
          (sum, s) => sum + (s.totalPrice || 0),
          0
        )
        const baseSubtotal = jewelrySubtotal + serviceSubtotal

        const fee =
          fetchedOrder.collectionMethod === "delivery" ? DELIVERY_FLAT_RATE : 0
        const vatAmount = baseSubtotal * VAT_RATE
        const totalAmount = baseSubtotal + vatAmount + fee

        setSubtotal(baseSubtotal)
        setVat(vatAmount)
        setDeliveryFee(fee)
        setTotal(totalAmount)
      } catch (err) {
        console.error("Failed to load order for payment:", err)
        setLoadError("Could not load order. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  const handleChange = (e) => {
    const { name, value } = e.target

    setPaymentDetails((prev) => {
      let v = value

      if (name === "number") {
        v = value.replace(/[^\d]/g, "").slice(0, 16)
        v = v.replace(/(.{4})/g, "$1 ").trim()
      }

      if (name === "pin") {
        v = value.replace(/[^\d]/g, "").slice(0, 4)
      }

      return { ...prev, [name]: v }
    })
  }

  const validate = () => {
    const newErrors = {}

    if (!paymentDetails.name.trim()) {
      newErrors.name = "Cardholder name is required."
    }

    const cardDigits = paymentDetails.number.replace(/\s+/g, "")
    if (!/^\d{16}$/.test(cardDigits)) {
      newErrors.number = "Please enter a valid 16-digit card number."
    }

    if (!paymentDetails.expiry) {
      newErrors.expiry = "Expiry date is required."
    } else {
      const today = new Date()
      const exp = new Date(paymentDetails.expiry)
      if (exp < new Date(today.getFullYear(), today.getMonth(), 1)) {
        newErrors.expiry = "This card is expired."
      }
    }

    if (!/^\d{3,4}$/.test(paymentDetails.pin)) {
      newErrors.pin = "PIN / CVV must be 3–4 digits."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    if (!orderId) return

    try {
      setSubmitting(true)

      await payForOrder(orderId, {
        paymentMethod: "Card",
        amount: total,
      })

      setShowSuccessModal(true)
    } catch (err) {
      console.error("Payment failed:", err)
      setErrors((prev) => ({
        ...prev,
        form: "Payment failed. Please try again.",
      }))
    } finally {
      setSubmitting(false)
    }
  }

  const formatItemName = (item) => {
    if (!item) return "Item"
    if (typeof item === "string") return "Item"
    return item.name || "Item"
  }

  if (loading) {
    return (
      <div className="payment-page loading-state">
        <div className="loader"></div>
      </div>
    )
  }

  if (loadError || !order) {
    return (
      <div className="payment-page error-state">
        <p>{loadError || "Order not found."}</p>
        <div className="loader"></div>
      </div>
    )
  }

  return (
    <div className="payment-page">
      <div className="payment-layout">
        <h2 className="payment-title">Payment</h2>
        <div className="payment-content">
          <div className="payment-summary">
            <h2 className="summary-title">Order Summary</h2>

            <div className="summary-row">
              <span>Order ID</span>
              <span>{order._id}</span>
            </div>

            <div className="summary-row">
              <span>Collection Method</span>
              <span>
                {COLLECTION_DISPLAY_MAP[order.collectionMethod] ||
                  order.collectionMethod}
              </span>
            </div>

            <hr className="summary-divider" />

            <div className="summary-row">
              <span>VAT (10%)</span>
              <span>{vat.toFixed(3)} BHD</span>
            </div>
            {deliveryFee > 0 && (
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span>{deliveryFee.toFixed(3)} BHD</span>
              </div>
            )}

            <div className="summary-row">
              <span className="summary-subtotal">Subtotal</span>
              <span>{subtotal.toFixed(3)} BHD</span>
            </div>

            <hr className="summary-divider" />

            <div className="summary-items">
              <h3>Items</h3>

              {(order.jewelryOrder || []).map((j, idx) => (
                <div key={`j-${idx}`} className="summary-item-row">
                  <span className="summary-item-name">
                    {formatItemName(j.item)}
                    <span className="quantity-in-payment">
                      x{j.quantity || 1}
                    </span>
                    {j.size ? ` (Size: ${j.size})` : ""}
                  </span>
                  <span className="summary-item-meta">
                    {(j.totalPrice || 0).toFixed(3)} BHD
                  </span>
                </div>
              ))}

              {(order.serviceOrder || []).map((s, idx) => (
                <div key={`s-${idx}`} className="summary-item-row">
                  <span className="summary-item-name">
                    {formatItemName(s.service)}
                    <span className="quantity-in-payment">
                      {s.jewelry?.length || 0} item(s)
                    </span>
                  </span>
                  <span className="summary-item-meta">
                    {(s.totalPrice || 0).toFixed(3)} BHD
                  </span>
                </div>
              ))}

              <div className="summary-total">
                <span>Total Amount</span>
                <span>{total.toFixed(3)} BHD</span>
              </div>
            </div>
          </div>
          <div className="payment-left">
            <form className="payment-form" onSubmit={handleSubmit} noValidate>
              {errors.form && (
                <p className="payment-error global">{errors.form}</p>
              )}
              <div>
                <label htmlFor="name">Cardholder Name</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  placeholder="Full name on Card"
                  value={paymentDetails.name}
                  onChange={handleChange}
                />
                {errors.name && <p className="payment-error">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="number">Card Number</label>
                <input
                  type="text"
                  name="number"
                  id="number"
                  placeholder="0000 0000 0000 0000"
                  value={paymentDetails.number}
                  onChange={handleChange}
                  inputMode="numeric"
                />
                {errors.number && (
                  <p className="payment-error">{errors.number}</p>
                )}
              </div>

              <div className="payment-row">
                <div className="payment-field">
                  <label htmlFor="expiry">Expiry Date</label>
                  <input
                    placeholder="MM/YY"
                    type="month"
                    name="expiry"
                    id="expiry"
                    value={paymentDetails.expiry}
                    onChange={handleChange}
                  />
                  {errors.expiry && (
                    <p className="payment-error">{errors.expiry}</p>
                  )}
                </div>

                <div className="payment-field">
                  <label htmlFor="pin">CVV / PIN</label>
                  <input
                    type="password"
                    name="pin"
                    id="pin"
                    placeholder="***"
                    value={paymentDetails.pin}
                    onChange={handleChange}
                    inputMode="numeric"
                  />
                  {errors.pin && <p className="payment-error">{errors.pin}</p>}
                </div>
              </div>

              <button
                type="submit"
                className="payment-submit-btn"
                disabled={
                  submitting ||
                  !paymentDetails.name.trim() ||
                  !paymentDetails.number.trim() ||
                  !paymentDetails.expiry ||
                  !paymentDetails.pin.trim()
                }
              >
                {submitting ? "Processing..." : "Pay Now"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <FeedbackModal
          show={showSuccessModal}
          type="success"
          message="Your payment was successful!"
          actions={[
            {
              label: "OK",
              onClick: () => {
                setShowSuccessModal(false)
                navigate("/")
              },
            },
          ]}
          onClose={() => {
            setShowSuccessModal(false)
            navigate("/")
          }}
        />
      )}
    </div>
  )
}

export default Payment
