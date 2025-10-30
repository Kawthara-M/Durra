import { createContext, useContext, useState, useEffect } from "react"
import User from "../services/api"

const CartContext = createContext()
export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children }) => {
  const [pendingOrder, setPendingOrder] = useState(null)

  // fetch existing pending order once user logs in
  useEffect(() => {
    const loadPendingOrder = async () => {
      const res = await User.get("/orders")
      const pending = res.data.find(o => o.status === "pending")
      setPendingOrder(pending || null)
    }
    loadPendingOrder()
  }, [])

  const addToCart = async (item) => {
    // if no pending order, create one
    if (!pendingOrder) {
      const newOrder = await User.post("/orders", { item })
      setPendingOrder(newOrder.data)
      return
    }

    // otherwise add item to existing order
    const updated = await User.put(`/orders/${pendingOrder._id}`, { item })
    setPendingOrder(updated.data)
  }

  return (
    <CartContext.Provider value={{ pendingOrder, addToCart }}>
      {children}
    </CartContext.Provider>
  )
}
