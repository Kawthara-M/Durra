import { useState, useRef } from "react"
import User from "../services/api"

export const useOrderWait = () => {
  const [waiting, setWaiting] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const [resultStatus, setResultStatus] = useState(null)
  const [resultOrder, setResultOrder] = useState(null)

  const pollRef = useRef(null)
  const lastStatusRef = useRef(null)

  const clearPoll = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  const waitForJeweler = (orderId) => {
    if (!orderId) return

    clearPoll()
    setWaiting(true)
    setTimedOut(false)
    setResultStatus(null)
    setResultOrder(null)
    lastStatusRef.current = "submitted" 

    pollRef.current = setInterval(async () => {
      try {
        const res = await User.get(`/orders/${orderId}`)
        const status = res.data.order.status

        const prev = lastStatusRef.current
        lastStatusRef.current = status

        if (status !== "submitted" && status !== "pending") {
          clearPoll()
          setWaiting(false)
          setResultStatus(status)
          setResultOrder(res.data.order)
          localStorage.removeItem("submittedOrder")
          return
        }

        if (prev === "submitted" && status === "pending") {

          clearPoll()
          setWaiting(false)
          setTimedOut(true)   
          localStorage.removeItem("submittedOrder")
          return
        }

      } catch (err) {
        console.error("[useOrderWait] poll error:", err)
      }
    }, 15000)
  }

  const cancelWait = async (orderId) => {
    clearPoll()

    try {
      if (orderId) {
        await User.put(`/orders/update-status/${orderId}`, {
          status: "pending",
        })
      }
    } catch (err) {
      console.error("[useOrderWait] cancelWait error:", err)
    } finally {
      setWaiting(false)
      setTimedOut(false)
      setResultStatus(null)
      setResultOrder(null)
      localStorage.removeItem("submittedOrder")
    }
  }

  const clearTimeoutFlag = () => {
    setTimedOut(false)
  }

  const clearResultStatus = () => {
    setResultStatus(null)
    setResultOrder(null)
  }

  return {
    waiting,
    timedOut,
    resultStatus,
    resultOrder,
    waitForJeweler,
    cancelWait,
    clearTimeoutFlag,
    clearResultStatus,
  }
}
