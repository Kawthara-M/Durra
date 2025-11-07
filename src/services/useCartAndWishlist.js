import { useUser } from "../context/UserContext"
import { useOrder } from "../context/OrderContext"
import User from "../services/api"
import { createOrder, updateOrder } from "../services/order"

export const useCartAndWishlist = (
  item,
  type,
  computedPrice,
  onRemove,
  quantity,
  setIsInWishlist
) => {
  const { user } = useUser()
  const { order, addJewelryToOrder, addServiceToOrder, setOrderId } = useOrder()

  const handleAdd = async () => {
    if (!user) return

    const currentOrder = order
    const currentOrderId = order?.orderId

    let price = 0
    let newItem = {}

    if (type === "jewelry") {
      newItem = {
        item: item._id,
        itemModel: "Jewelry",
        quantity: quantity ? quantity : 1,
        totalPrice: computedPrice,
        notes: "",
      }
    } else if (type === "collection") {
      newItem = {
        item: item._id,
        itemModel: "Collection",
        quantity: 1,
        totalPrice: computedPrice,
        notes: "",
      }
    } else if (type === "service") {
      newItem = {
        service: item._id,
        jewelry: [],
        totalPrice: computedPrice,
        notes: "",
      }
    }

    try {
      let finalOrderId = currentOrderId

      if (!currentOrderId) {
        const payload =
          type === "service"
            ? {
                jewelryOrder: [],
                serviceOrder: [newItem],
                totalPrice: computedPrice,
                collectionMethod: "delivery",
              }
            : {
                jewelryOrder: [newItem],
                serviceOrder: [],
                totalPrice: computedPrice,
                collectionMethod: "delivery",
              }

        const res = await createOrder(payload)
        finalOrderId = res._id || res.data?.order?._id
        setOrderId(finalOrderId)

        if (type === "service") addServiceToOrder(newItem)
        else addJewelryToOrder(newItem)
        return
      }

      let updatedJewelryOrder = [...currentOrder.jewelryOrder]
      let updatedServiceOrder = [...currentOrder.serviceOrder]

      if (type === "service") updatedServiceOrder.push(newItem)
      else updatedJewelryOrder.push(newItem)

      await updateOrder(currentOrderId, {
        jewelryOrder: updatedJewelryOrder,
        serviceOrder: updatedServiceOrder,
      })

      if (type === "service") addServiceToOrder(newItem)
      else addJewelryToOrder(newItem)
    } catch (err) {
      console.log(err)
    }
  }

 const handleWishlist = async (forceRemove = false) => {
    if (!user) return

    const newEntry = {
      favouritedItem: item._id,
      favouritedItemType:
        type === "jewelry"
          ? "Jewelry"
          : type === "service"
          ? "Service"
          : "Collection",
    }

    try {
      const response = await User.get("/wishlist")
      const wishlist = response.data.wishlist
      const exists = wishlist.items.some(
        (it) =>
          (typeof it.favouritedItem === "object"
            ? it.favouritedItem._id
            : it.favouritedItem) === item._id
      )

      let updatedItems
      if (exists || forceRemove) {
        // Remove item
        updatedItems = wishlist.items.filter(
          (it) =>
            (typeof it.favouritedItem === "string"
              ? it.favouritedItem
              : it.favouritedItem._id) !== item._id
        )
        setIsInWishlist(false)
        if (typeof onRemove === "function") onRemove(item._id)
      } else {
        // Add item
        updatedItems = [
          ...wishlist.items.map((it) => ({
            favouritedItem:
              typeof it.favouritedItem === "string"
                ? it.favouritedItem
                : it.favouritedItem._id,
            favouritedItemType: it.favouritedItemType,
          })),
          newEntry,
        ]
        setIsInWishlist(true)
      }

      await User.put(`/wishlist/${wishlist._id}`, { items: updatedItems })
      window.dispatchEvent(new Event("wishlist-updated"))
    } catch (err) {
      if (err.response?.status === 404 && !forceRemove) {
        await User.post("/wishlist", { items: [newEntry] })
        setIsInWishlist(true)
        window.dispatchEvent(new Event("wishlist-updated"))
      } else console.error(err)
    }
  }

  return { handleAdd, handleWishlist }
}
