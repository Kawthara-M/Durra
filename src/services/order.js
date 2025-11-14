import User from "./api"

export const getPendingOrder = async () => {
  const res = await User.get("/orders")
  const pending = res.data.orders.find((o) => o.status === "pending")

  return pending || null
}

export const createOrder = async (body) => {
  const res = await User.post("/orders", body)
  vwindow.dispatchEvent(new Event("order-updated"))
  return res.data.order
}

export const updateOrder = async (orderId, body) => {
  const res = await User.put(`/orders/${orderId}`, body)
  window.dispatchEvent(new Event("order-updated"))
  return res.data.order
}
