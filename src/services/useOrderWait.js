import { useState } from "react"
import User from "../services/api"

export const useOrderWait = () => {
  const [waiting, setWaiting] = useState(false)

  const waitForJeweler = (orderId) => {
    setWaiting(true)

    setTimeout(async () => {
      const res = await User.get(`/orders/${orderId}`)
      const status = res.data.order.status

      if (status === "submitted") {
        await User.put(`/ordersupdate-status/${orderId}`, { status: "pending" })
        alert("The shop might be busy. Please try again later.")
      }

      setWaiting(false)
    }, 5 * 60 * 1000)
  }

  return { waiting, waitForJeweler }
}
