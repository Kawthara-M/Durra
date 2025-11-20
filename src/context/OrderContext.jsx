import { createContext, useContext, useState } from "react"

const OrderContext = createContext()

export const OrderProvider = ({ children }) => {
  const [order, setOrder] = useState({
    jewelryOrder: [],
    serviceOrder: [],
    shop: null,
    orderId: null,
    notes: "",
    totalPrice: 0,
  })

  const setOrderId = (id) =>
    setOrder((prev) => ({ ...prev, orderId: id }))

  const setFullOrder = (pending) => {
    if (!pending) return

    const shop = pending.shop || null

    setOrder({
      orderId: pending._id,
      jewelryOrder: pending.jewelryOrder || [],
      serviceOrder: pending.serviceOrder || [],
      notes: pending.notes || "",
      shop,
      totalPrice: pending.totalPrice || 0,
    })
  }

  const addJewelryToOrder = ({ item, itemModel, quantity, totalPrice }) => {
    setOrder((prev) => ({
      ...prev,
      jewelryOrder: [
        ...prev.jewelryOrder,
        { item, itemModel, quantity, totalPrice },
      ],
      totalPrice: prev.totalPrice + totalPrice,
    }))
  }

  const addServiceToOrder = ({ service, totalPrice, jewelry }) => {
    setOrder((prev) => ({
      ...prev,
      serviceOrder: [
        ...prev.serviceOrder,
        { service, totalPrice, jewelry },
      ],
      totalPrice: prev.totalPrice + totalPrice,
    }))
  }

  const resetOrder = () => {
    setOrder({
      jewelryOrder: [],
      serviceOrder: [],
      shop: null,
      orderId: null,
      notes: "",
      totalPrice: 0,
    })
  }

  return (
    <OrderContext.Provider
      value={{
        order,
        setOrderId,
        setFullOrder,
        addJewelryToOrder,
        addServiceToOrder,
        resetOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}

export const useOrder = () => useContext(OrderContext)
