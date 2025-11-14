import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useOrder } from "../context/OrderContext"
import { getPendingOrder, updateOrder } from "../services/order"
import {
  fetchMetalRates,
  calculateCollectionPrice,
  calculatePreciousMaterialCost,
  calculateTotalCost,
} from "../services/calculator"
import placeholder from "../assets/placeholder.png"
import "../../public/stylesheets/cart.css"

const Cart = () => {
  const navigate = useNavigate()
  const { setOrderId } = useOrder()
  const [items, setItems] = useState([])
  const [metalRates, setMetalRates] = useState({})
  const [loading, setLoading] = useState(true)
  const [subtotal, setSubtotal] = useState(0)
  const [flatRate] = useState(2)
  const [vatRate] = useState(0.1)
  const [orderId, setOrderIdState] = useState(null)
  const [expandedServices, setExpandedServices] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        const [pending, rates] = await Promise.all([
          getPendingOrder(),
          fetchMetalRates(),
        ])

        setMetalRates(rates)
        if (pending) {
          setOrderIdState(pending._id)
          setOrderId(pending._id)
          const allItems = [
            ...(pending.jewelryOrder || []),
            ...(pending.serviceOrder || []).map((s) => ({
              ...s,
              jewelry:
                s.jewelry?.length > 0
                  ? s.jewelry
                  : [{ name: "", material: "", type: "", details: "" }],
            })),
          ]

          const recalculated = await recalcJewelryPrices(allItems, rates)
          setItems(recalculated)
          calcSubtotal(recalculated)
        }
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
    try {
      await updateOrderInDB(filtered)
    } catch (err) {
      console.error("Failed to update order after remove:", err)
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

  const updateOrderInDB = async (updatedItems) => {
    if (!orderId) return

    const jewelryOrder = updatedItems
      .filter((i) => i.itemModel)
      .map((i) => ({
        item: i.item._id,
        itemModel: i.itemModel,
        quantity: i.quantity,
        totalPrice: i.totalPrice,
      }))

    const serviceOrder = updatedItems
      .filter((i) => i.service)
      .map((i) => {
        const totalPrice = (i.service.price || 0) * (i.jewelry?.length || 0)
        return {
          _id: i._id,
          service: i.service._id,
          jewelry: (i.jewelry || []).map((j) => ({
            name: j.name || "",
            material: j.material || "",
            type: j.type || "",
            details: j.details || "",
          })),
          totalPrice,
        }
      })

    await updateOrder(orderId, { jewelryOrder, serviceOrder })
  }

  const isServiceInfoComplete = () => {
    for (const item of items) {
      if (item.service) {
        if (!item.jewelry || item.jewelry.length === 0) return false

        for (const j of item.jewelry) {
          if (!j.name || !j.material || !j.type || !j.details) return false
        }
      }
    }
    return true
  }

  const canProceed = items.length > 0 && isServiceInfoComplete()
  const proceedTitle = !canProceed
    ? "Please fill all required jewelry information for your service order."
    : "Proceed to Checkout"

  const vat = subtotal * vatRate
  const estimatedTotal = subtotal + vat + flatRate

  if (loading) return  <div class="loader"></div> 


  return (
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
                          item.service.images[0] ||
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
                        {item.itemModel ? (
                          <button
                            onClick={() => handleRemove(i)}
                            className="remove-btn"
                          >
                            Remove
                          </button>
                        ) : null}
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
                                <span>
                                  <label>Name</label>
                                  <input
                                    placeholder="Jewelry Name"
                                    type="text"
                                    value={j.name}
                                    onChange={(e) => {
                                      const newItems = [...items]
                                      newItems.forEach((itm) => {
                                        if (
                                          itm.service &&
                                          itm.service._id === item.service._id
                                        ) {
                                          itm.jewelry[idx].name = e.target.value
                                        }
                                      })
                                      const updatedItems =
                                        recalcServicePrices(newItems)
                                      setItems(updatedItems)
                                      updateOrderInDB(updatedItems)
                                    }}
                                  />
                                </span>
                                <span>
                                  <label>Material</label>
                                  <input
                                    placeholder="Jewelry Material (e.g. Gold)"
                                    type="text"
                                    value={j.material}
                                    onChange={(e) => {
                                      const newItems = [...items]
                                      newItems.forEach((itm) => {
                                        if (
                                          itm.service &&
                                          itm.service._id === item.service._id
                                        ) {
                                          itm.jewelry[idx].material =
                                            e.target.value
                                        }
                                      })
                                      const updatedItems =
                                        recalcServicePrices(newItems)
                                      setItems(updatedItems)
                                      updateOrderInDB(updatedItems)
                                    }}
                                  />
                                </span>
                                <span>
                                  <label>Type</label>
                                  <input
                                    placeholder="Jewelry Type (e.g. Ring)"
                                    type="text"
                                    value={j.type}
                                    onChange={(e) => {
                                      const newItems = [...items]
                                      newItems.forEach((itm) => {
                                        if (
                                          itm.service &&
                                          itm.service._id === item.service._id
                                        ) {
                                          itm.jewelry[idx].type = e.target.value
                                        }
                                      })
                                      const updatedItems =
                                        recalcServicePrices(newItems)
                                      setItems(updatedItems)
                                      updateOrderInDB(updatedItems)
                                    }}
                                  />
                                </span>
                                <span className="details-input">
                                  <label>Details</label>
                                  <textarea
                                    rows="5"
                                    placeholder="Jewelry Details (e.g. Polish the diamond in ring ... )"
                                    value={j.details}
                                    onChange={(e) => {
                                      const newItems = [...items]
                                      newItems.forEach((itm) => {
                                        if (
                                          itm.service &&
                                          itm.service._id === item.service._id
                                        ) {
                                          itm.jewelry[idx].details =
                                            e.target.value
                                        }
                                      })
                                      const updatedItems =
                                        recalcServicePrices(newItems)
                                      setItems(updatedItems)
                                      updateOrderInDB(updatedItems)
                                    }}
                                  />
                                </span>
                                <button
                                  className="remove-btn"
                                  onClick={() => {
                                    const newItems = [...items]
                                    newItems.forEach((itm) => {
                                      if (
                                        itm.service &&
                                        itm.service._id === item.service._id
                                      ) {
                                        itm.jewelry.splice(idx, 1)
                                      }
                                    })
                                    const updatedItems =
                                      recalcServicePrices(newItems)
                                    setItems(updatedItems)
                                    updateOrderInDB(updatedItems)
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
                                const newItems = [...items]
                                newItems.forEach((itm) => {
                                  if (
                                    itm.service &&
                                    itm.service._id === item.service._id
                                  ) {
                                    itm.jewelry.push({
                                      name: "",
                                      material: "",
                                      type: "",
                                      details: "",
                                    })
                                  }
                                })
                                const updatedItems =
                                  recalcServicePrices(newItems)
                                setItems(updatedItems)
                                updateOrderInDB(updatedItems)
                              }}
                            >
                              Add more
                            </button>
                          )}
                        </div>
                      )}

                      <button
                        onClick={() => handleRemove(i)}
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
              <span>{(subtotal * vatRate).toFixed(3)} BHD</span>
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
  )
}

export default Cart
