import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useOrder } from "../context/OrderContext"
import { getPendingOrder, updateOrder, cancelOrder } from "../services/order"
import {
  calculateCollectionPrice,
  calculatePreciousMaterialCost,
  calculateTotalCost,
  fetchMetalRates,
} from "../services/calculator"
import User from "../services/api"
import { useOrderWait } from "../services/useOrderWait"
import FeedbackModal from "../components/FeedbackModal"
import placeholder from "../assets/placeholder.png"
import "../../public/stylesheets/cart.css"

const Cart = () => {
  const navigate = useNavigate()
  const { setOrderId, order, resetOrder } = useOrder()

  const [items, setItems] = useState([])
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(true)
  const [subtotal, setSubtotal] = useState(0)
  const [flatRate] = useState(2)
  const [vatRate] = useState(0.1)
  const [orderId, setOrderIdState] = useState(null)
  const [expandedServices, setExpandedServices] = useState(true)

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

  const loadCartFromOrder = async (orderDoc) => {
    setOrderIdState(orderDoc._id)
    setOrderId(orderDoc._id)
    setNotes(orderDoc.notes || "")

    const serviceItems = (orderDoc.serviceOrder || []).map((s) => ({
      ...s,
      jewelry: s.jewelry && s.jewelry.length > 0 ? s.jewelry : [{}],
    }))

    const rates = await fetchMetalRates()

    const recalculatedJewelry = await recalcJewelryPrices(
      [...orderDoc.jewelryOrder],
      rates
    )

    const combined = [...recalculatedJewelry, ...serviceItems]
    setItems(combined)
    calcSubtotal(combined)
  }

  useEffect(() => {
    const init = async () => {
      try {
        const pending = await getPendingOrder()
        if (pending) {
          await loadCartFromOrder(pending)
          return
        }

        const stored = JSON.parse(localStorage.getItem("submittedOrder"))
        if (stored && stored.status === "submitted" && stored.orderId) {
          waitForJeweler(stored.orderId)

          try {
            const res = await User.get(`/orders/${stored.orderId}`)
            if (res.data.order) {
              await loadCartFromOrder(res.data.order)
            }
          } catch (err) {
            console.error("Failed to fetch submitted order for cart:", err)
          }
          return
        }

        setItems([])
      } catch (err) {
        console.error("Error loading cart:", err)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  const recalcJewelryPrices = async (arr, rates) => {
    const updated = []
    for (const item of arr) {
      if (item.itemModel === "Jewelry") {
        console.log("here")
        const jewel = item.item
        const preciousCost = calculatePreciousMaterialCost(
          jewel.preciousMaterials,
          rates
        )
        const total = calculateTotalCost(preciousCost, jewel.originPrice)
        updated.push({ ...item, totalPrice: total * (item.quantity || 1) })
      } else if (item.itemModel === "Collection") {
        const collection = item.item
        const collectionPrice = calculateCollectionPrice(collection, rates)
        updated.push({
          ...item,
          totalPrice: collectionPrice * (item.quantity || 1),
        })
      } else if (item.service) {
        const totalPrice =
          (item.service.price || 0) * (item.jewelry?.length || 0)
        updated.push({ ...item, totalPrice })
      }
    }
    return updated
  }

  const recalcServicePrices = (cartItems) => {
    const updated = cartItems.map((item) => {
      if (item.service) {
        const totalPrice =
          (item.service.price || 0) * (item.jewelry?.length || 0)
        return { ...item, totalPrice }
      }
      return item
    })
    calcSubtotal(updated)
    return updated
  }

  const calcSubtotal = (arr) => {
    const total = arr.reduce((sum, i) => sum + (i.totalPrice || 0), 0)
    setSubtotal(total)
  }

  const handleRemove = async (index) => {
    const filtered = items.filter((_, i) => i !== index)
    setItems(filtered)
    calcSubtotal(filtered)

    if (filtered.length === 0) {
      try {
        if (orderId) {
          await cancelOrder(orderId)
        }
      } catch (err) {
        console.error("Failed to cancel order after last item removed:", err)
      }

      setOrderIdState(null)
      setOrderId(null)
      resetOrder()
      return
    }

    try {
      await updateOrderInDB(
        items.map((i, idx) => (idx === index ? { ...i, quantity: 0 } : i))
      )
    } catch (err) {
      console.error("Failed to update order after remove:", err)
    }
  }

  const handleRemoveService = async (index) => {
    const filtered = items.filter((_, i) => i !== index)
    setItems(filtered)
    calcSubtotal(filtered)

    if (filtered.length === 0) {
      try {
        if (orderId) {
          await cancelOrder(orderId)
        }
      } catch (err) {
        console.error("Failed to cancel order after last service removed:", err)
      }

      setOrderIdState(null)
      setOrderId(null)
      resetOrder()
      return
    }

    try {
      await updateOrderInDB(filtered)
    } catch (err) {
      console.error("Failed to update order after removing service:", err)
    }
  }

  const handleQuantityChange = async (index, q) => {
    const updated = items.map((i, idx) =>
      idx === index
        ? { ...i, quantity: q, totalPrice: (i.totalPrice / i.quantity) * q }
        : i
    )
    setItems(updated)
    calcSubtotal(updated)
    try {
      await updateOrderInDB(updated)
    } catch (err) {
      console.error("Failed to update order after quantity change:", err)
    }
  }

  const debounce = (fn, delay) => {
    let timer
    return (...args) => {
      clearTimeout(timer)
      timer = setTimeout(() => fn(...args), delay)
    }
  }

  const updateOrderInDB = async (updatedItems) => {
    if (!orderId) return

    const jewelryOrder = updatedItems
      .filter((i) => i.itemModel)
      .map((i) => ({
        item: i.item._id,
        itemModel: i.itemModel,
        quantity: i.quantity,
        totalPrice: i.totalPrice,
        ...(i.size ? { size: i.size } : {}),
      }))

    const serviceOrder = updatedItems
      .filter((i) => i.service)
      .map((i) => ({
        _id: i._id,
        service: i.service._id,
        jewelry: i.jewelry?.map((j) => ({ ...j })) || [],
        totalPrice: i.totalPrice || 0,
      }))

    await updateOrder(orderId, {
      jewelryOrder,
      serviceOrder,
      notes,
      shop: order.shop,
    })
  }

  const debouncedUpdateOrderInDB = useMemo(
    () => debounce(updateOrderInDB, 2000),
    [orderId]
  )

  const isServiceInfoComplete = () => {
    for (const item of items) {
      if (item.service) {
        if (!item.jewelry || item.jewelry.length === 0) return false
        for (const j of item.jewelry) {
          if (!j.name || !j.material || !j.type) return false
        }
      }
    }
    return true
  }

  const handleCancelSubmission = async () => {
    try {
      const stored = JSON.parse(localStorage.getItem("submittedOrder"))
      const id = stored?.orderId

      await cancelWait(id)

      const pending = await getPendingOrder()
      if (pending) {
        await loadCartFromOrder(pending)
      } else {
        setItems([])
        setOrderIdState(null)
        setOrderId(null)
        resetOrder()
      }
    } catch (err) {
      console.error("Failed to cancel submission", err)
    }
  }

  const canProceed = items.length > 0 && isServiceInfoComplete()
  const proceedTitle = !canProceed
    ? "Please fill all required jewelry information for your service order."
    : "Proceed to Checkout"

  const vat = subtotal * vatRate
  const estimatedTotal = subtotal + vat + flatRate

  if (loading) return <div className="loader"></div>

  return (
    <div className="cart-wrapper">
      <div className="cart-page">
        <h2 className="cart-title">Shopping Cart</h2>
        <div className="cart-details">
          <div className="cart-items">
            {items.length === 0 ? (
              <p className="cart-empty">No items in your cart.</p>
            ) : (
              <ul className="cart-item-list">
                {items.map((item, i) => (
                  <li key={i} className="item-row">
                    <div className="item-row-without-expand">
                      <div className="item-left">
                        <img
                          src={
                            item.item?.images?.[0] ||
                            item.service?.images?.[0] ||
                            placeholder
                          }
                          alt={item.item?.name || item.service?.name || "Item"}
                          className="item-image"
                        />
                        <div className="item-info">
                          <h3 className="item-name">
                            {item.item?.name || item.service?.name}
                          </h3>
                          <p className="item-type">
                            {item.itemModel === "Jewelry" && "Jewelry"}
                            {item.itemModel === "Collection" && "Collection"}
                            {item.service && "Service"}
                          </p>
                        </div>
                      </div>

                      <div className="item-actions">
                        <div className="item-total">
                          {item.totalPrice.toFixed(2)} BHD
                        </div>

                        <div className="quantity-controls">
                          {item.itemModel && (
                            <div className="quantity-buttons">
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    i,
                                    Math.max(item.quantity - 1, 1)
                                  )
                                }
                              >
                                -
                              </button>
                              <span>{item.quantity}</span>
                              <button
                                onClick={() =>
                                  handleQuantityChange(i, item.quantity + 1)
                                }
                              >
                                +
                              </button>
                            </div>
                          )}
                          {item.itemModel && (
                            <button
                              onClick={() => handleRemove(i)}
                              className="remove-btn"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {item.service && (
                      <div className="service-extra">
                        <div className="cart-clarification-and-add">
                          <span className="cart-service-clarification">
                            <a
                              onClick={() =>
                                setExpandedServices(!expandedServices)
                              }
                            >
                              * Please fill the required information of the
                              jewelry to be collected.
                            </a>
                          </span>
                        </div>

                        {expandedServices && (
                          <div className="jewelry-list">
                            {(item.jewelry || []).map((j, idx) => (
                              <div key={idx} className="jewelry-entry">
                                <div className="jewelry-entry-inputs">
                                  {["name", "material", "type", "details"].map(
                                    (field) => (
                                      <span
                                        key={field}
                                        className={
                                          field === "details"
                                            ? "details-input"
                                            : ""
                                        }
                                      >
                                        <label>
                                          {field.charAt(0).toUpperCase() +
                                            field.slice(1)}
                                        </label>
                                        {field !== "details" ? (
                                          <input
                                            type="text"
                                            placeholder={`Jewelry ${
                                              field.charAt(0).toUpperCase() +
                                              field.slice(1)
                                            }`}
                                            value={j[field]}
                                            onChange={(e) => {
                                              const newItems = items.map(
                                                (itm) =>
                                                  itm.service &&
                                                  itm.service._id ===
                                                    item.service._id
                                                    ? {
                                                        ...itm,
                                                        jewelry:
                                                          itm.jewelry.map(
                                                            (jj, jIdx) =>
                                                              jIdx === idx
                                                                ? {
                                                                    ...jj,
                                                                    [field]:
                                                                      e.target
                                                                        .value,
                                                                  }
                                                                : jj
                                                          ),
                                                      }
                                                    : itm
                                              )
                                              const updatedItems =
                                                recalcServicePrices(newItems)
                                              setItems(updatedItems)
                                              debouncedUpdateOrderInDB(
                                                updatedItems
                                              )
                                            }}
                                          />
                                        ) : (
                                          <textarea
                                            rows="5"
                                            placeholder="Jewelry Details"
                                            value={j.details}
                                            onChange={(e) => {
                                              const newItems = items.map(
                                                (itm) =>
                                                  itm.service &&
                                                  itm.service._id ===
                                                    item.service._id
                                                    ? {
                                                        ...itm,
                                                        jewelry:
                                                          itm.jewelry.map(
                                                            (jj, jIdx) =>
                                                              jIdx === idx
                                                                ? {
                                                                    ...jj,
                                                                    details:
                                                                      e.target
                                                                        .value,
                                                                  }
                                                                : jj
                                                          ),
                                                      }
                                                    : itm
                                              )
                                              const updatedItems =
                                                recalcServicePrices(newItems)
                                              setItems(updatedItems)
                                              debouncedUpdateOrderInDB(
                                                updatedItems
                                              )
                                            }}
                                          />
                                        )}
                                      </span>
                                    )
                                  )}

                                  <button
                                    className="remove-btn"
                                    onClick={() => {
                                      const newItems = items.map((itm) =>
                                        itm.service &&
                                        itm.service._id === item.service._id
                                          ? {
                                              ...itm,
                                              jewelry: itm.jewelry.filter(
                                                (_, jIdx) => jIdx !== idx
                                              ),
                                            }
                                          : itm
                                      )
                                      const updatedItems =
                                        recalcServicePrices(newItems)
                                      setItems(updatedItems)
                                      debouncedUpdateOrderInDB(updatedItems)
                                    }}
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}

                            {item.jewelry.length <
                              (item.service.limitPerOrder || 1) && (
                              <button
                                className="add-jewelry-btn"
                                onClick={() => {
                                  const newItems = items.map((itm) =>
                                    itm.service &&
                                    itm.service._id === item.service._id
                                      ? {
                                          ...itm,
                                          jewelry: [
                                            ...itm.jewelry,
                                            {
                                              name: "",
                                              material: "",
                                              type: "",
                                              details: "",
                                            },
                                          ],
                                        }
                                      : itm
                                  )
                                  const updatedItems =
                                    recalcServicePrices(newItems)
                                  setItems(updatedItems)
                                  debouncedUpdateOrderInDB(updatedItems)
                                }}
                              >
                                Add more
                              </button>
                            )}
                          </div>
                        )}

                        <button
                          onClick={() => handleRemoveService(i)}
                          className="remove-btn"
                        >
                          Remove Service
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="summary-wrapper">
            {items.length > 0 && (
              <div className="cart-notes">
                <label htmlFor="order-notes" className="cart-notes-label">
                  Order Notes
                </label>
                <textarea
                  id="order-notes"
                  className="cart-notes-textarea"
                  placeholder="Add any special instructions, preferences, or details here..."
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value)
                    debouncedUpdateOrderInDB(items)
                  }}
                />
              </div>
            )}

            <div className="cart-summary">
              <h2 className="summary-title">Cart Summary</h2>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{subtotal.toFixed(2)} BHD</span>
              </div>
              <div className="summary-row">
                <span>Flat rate</span>
                <span>{flatRate.toFixed(2)} BHD</span>
              </div>
              <div className="summary-row">
                <span>VAT (10%)</span>
                <span>{vat.toFixed(3)} BHD</span>
              </div>
              <hr className="summary-divider" />
              <div className="summary-total">
                <span>Estimated total</span>
                <span>{estimatedTotal.toFixed(3)} BHD</span>
              </div>
            </div>
            <button
              disabled={!canProceed}
              title={proceedTitle}
              onClick={() => navigate("/checkout")}
              className="proceed-to-checkout"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>

      {waiting && (
        <div className="waiting-overlay">
          <div className="waiting-box">
            <div className="waiting-loader"></div>
            <h4>Waiting for jeweler’s response...</h4>
            <p>You can continue browsing or cancel your submission.</p>

            <button className="cancel-btn" onClick={() => cancelWait(orderId)}>
              Cancel Order
            </button>
          </div>
        </div>
      )}

      {timedOut && (
        <FeedbackModal
          show={timedOut}
          type="Confirmation"
          message="The shop did not respond in time. Your order has been moved back to pending. You can try submitting again later."
          onClose={() => {
            clearTimeoutFlag()
          }}
          actions={[
            {
              label: "OK",
              onClick: () => {
                clearTimeoutFlag()
              },
            },
          ]}
        />
      )}

      {resultStatus && (
        <FeedbackModal
          show={!!resultStatus}
          type={
            resultStatus === "accepted"
              ? "success"
              : resultStatus === "rejected"
              ? "error"
              : "info"
          }
          message={
            resultStatus === "accepted"
              ? "Good news! The jeweler has accepted your order."
              : resultStatus === "rejected"
              ? "Unfortunately, the jeweler has rejected your order."
              : `The order status was updated to "${resultStatus}".`
          }
          onClose={() => {
            clearResultStatus()
            // navigate("/profile")
          }}
          actions={[
            {
              label: "OK",
              onClick: () => {
                clearResultStatus()
                // navigate("/profile")
              },
            },
          ]}
        />
      )}
    </div>
  )
}

export default Cart
