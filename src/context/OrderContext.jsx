import { createContext, useContext, useState } from "react"

const OrderContext = createContext()

export const OrderProvider = ({ children }) => {
  const [order, setOrder] = useState({
    jewelryOrder: [],
    serviceOrder: [],
    shop: null,
    orderId: null,
  })

  const setOrderId = (id) => {
    setOrder((prev) => ({ ...prev, orderId: id }))
  }

  const setFullOrder = (pending) => {
    setOrder({
      orderId: pending._id,
      jewelryOrder: pending.jewelryOrder || [],
      serviceOrder: pending.serviceOrder || [],
      notes: pending.notes || "",
    })
  }

  const addJewelryToOrder = ({
    item,
    itemModel,
    quantity,
    totalPrice,
    shop,
  }) => {
    setOrder((prev) => ({
      ...prev,
      shop,
      jewelryOrder: [
        ...prev.jewelryOrder,
        { item, itemModel, quantity, totalPrice },
      ],
    }))
  }

  const addServiceToOrder = ({ service, price, jewelry }) => {
    setOrder((prev) => ({
      ...prev,
      serviceOrder: [
        ...prev.serviceOrder,
        { service, totalPrice: price, jewelry },
      ],
    }))
  }

  const resetOrder = () => {
    setOrder({ jewelryOrder: [], serviceOrder: [], shop: null, orderId: null })
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
