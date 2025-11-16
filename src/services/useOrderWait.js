import { useState, useRef } from "react"
import User from "../services/api"

export const useOrderWait = () => {
  const [waiting, setWaiting] = useState(false)
  const timeoutRef = useRef(null)

  const waitForJeweler = (orderId) => {
    setWaiting(true)

    timeoutRef.current = setTimeout(async () => {
      const res = await User.get(`/orders/${orderId}`)
      const status = res.data.order.status

      if (status === "submitted") {
        await User.put(`/orders/update-status/${orderId}`, {
          status: "pending",
        })
        alert("The shop might be busy. Please try again later.")
      }

      setWaiting(false)
      timeoutRef.current = null
    }, 5 * 60 * 1000)
  }

  const cancelWait = async (orderId) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    await User.put(`/orders/update-status/${orderId}`, { status: "pending" })

    setWaiting(false)
  }

  return { waiting, waitForJeweler, cancelWait }
}
