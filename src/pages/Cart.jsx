import { useState, useEffect } from "react"
import { useOrder } from "../context/OrderContext"
import { getPendingOrder, updateOrder } from "../services/order"
import {
  fetchMetalRates,
  calculateCollectionPrice,
  calculatePreciousMaterialCost,
  calculateTotalCost,
} from "../services/calculator"

import "../../public/stylesheets/cart.css"

const Cart = () => {
  const { setOrderId } = useOrder()
  const [items, setItems] = useState([])
  const [metalRates, setMetalRates] = useState({})
  const [loading, setLoading] = useState(true)
  const [subtotal, setSubtotal] = useState(0)
  const [flatRate] = useState(2)
  const [vatRate] = useState(0.1)
  const [orderId, setOrderIdState] = useState(null)

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
            ...(pending.serviceOrder || []),
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
        updated.push(item)
      }
    }
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
        ? {
            ...i,
            quantity: q,
            totalPrice: (i.totalPrice / i.quantity) * q,
          }
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
    const allJewelryItems = items
      .filter((i) => i.itemModel === "Jewelry" || i.itemModel === "Collection")
      .map((i) => ({
        item: i.item._id,
        itemModel: i.itemModel,
        quantity: i.quantity,
        totalPrice: i.totalPrice,
        notes: i.notes || "",
      }))

    const jewelryOrder = allJewelryItems.map((i) => {
      const updated = updatedItems.find(
        (u) =>
          u.itemModel === i.itemModel &&
          (u.item._id || u.item).toString() ===
            (i.item._id || i.item).toString()
      )
      if (updated) return { ...updated }
      return { ...i, quantity: 0, totalPrice: 0 }
    })

    const serviceOrder = updatedItems
      .filter((i) => i.service)
      .map((i) => ({
        _id: i._id,
        service: i.service._id || i.service,
        jewelry: i.jewelry?.map((j) => j._id || j) || [],
        totalPrice: i.totalPrice,
        notes: i.notes || "",
      }))

    const body = { jewelryOrder, serviceOrder }

    await updateOrder(orderId, body)
  }

  const vat = subtotal * vatRate
  const estimatedTotal = subtotal + vat + flatRate

  if (loading) return <div className="cart-loading">Loading cart...</div>

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
                  <div className="item-left">
                    {item.item?.images?.[0] && (
                      <img
                        src={item.item.images[0]}
                        alt={item.item?.name || "Item image"}
                        className="item-image"
                      />
                    )}
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
                      {item.totalPrice.toLocaleString()} BHD
                    </div>

                    {item.quantity && (
                      <div className="quantity-controls">
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
                        <button
                          onClick={() => handleRemove(i)}
                          className="remove-btn"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
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
              <span>{subtotal.toLocaleString()} BHD</span>
            </div>
            <div className="summary-row">
              <span title="Delivery fee">Flat rate</span>
              <span>{flatRate.toLocaleString()} BHD</span>
            </div>
            <div className="summary-row">
              <span>VAT (10%)</span>
              <span>
                {vat.toLocaleString(undefined, { maximumFractionDigits: 3 })}{" "}
                BHD
              </span>
            </div>
            <hr className="summary-divider" />
            <div className="summary-total">
              <span>Estimated total</span>
              <span>
                {estimatedTotal.toLocaleString(undefined, {
                  maximumFractionDigits: 3,
                })}{" "}
                BHD
              </span>
            </div>
          </div>
          <button disabled={items.length == 0} className="proceed-to-checkout">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  )
}

export default Cart
