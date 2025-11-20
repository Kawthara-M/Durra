import User from "./api"

export const getPendingOrder = async () => {
  const res = await User.get("/orders/pending")
  return res.data
}

export const createOrder = async (body) => {
  const res = await User.post("/orders", body)
  window.dispatchEvent(new Event("order-updated"))
  return res.data.order
}

export const updateOrder = async (orderId, body) => {
  const res = await User.put(`/orders/${orderId}`, body)
  window.dispatchEvent(new Event("order-updated"))
  return res.data.order
}

export const cancelOrder = async (orderId) => {
  const res = await User.delete(`/orders/${orderId}`)
  return res.data
}

export const payForOrder = (orderId, payload) =>
  User.put(`/orders/${orderId}/pay`, payload)
