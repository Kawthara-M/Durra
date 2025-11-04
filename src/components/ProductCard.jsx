import { useEffect, useState } from "react"
import placeholder from "../assets/placeholder.png"
import { useUser } from "../context/UserContext"
import { useOrder } from "../context/OrderContext"
import {
  calculatePreciousMaterialCost,
  calculateTotalCost,
  calculateCollectionPrice,
} from "../services/calculator.js"
import { createOrder, updateOrder } from "../services/order.js"
import User from "../services/api.js"

const ProductCard = ({ item, type, metalRates, inWishlistPage, onRemove }) => {
  const { user } = useUser()
  const { order, addJewelryToOrder, addServiceToOrder, setOrderId } = useOrder()
  const [collectionPrice, setCollectionPrice] = useState(null)

  useEffect(() => {
    if (type === "collection" && metalRates) {
      const price = calculateCollectionPrice(item, metalRates)
      setCollectionPrice(Number(price.toFixed(2)))
    }
  }, [type, item, metalRates])

  const getJewelryPrice = () => {
    const basePrice = item.originPrice || 0
    if (!metalRates) return Number(basePrice.toFixed(2))
    const metalCost = calculatePreciousMaterialCost(
      item.preciousMaterials,
      metalRates
    )
    const total = calculateTotalCost(metalCost, item.originPrice)
    return Number(total.toFixed(2))
  }

  const displayPrice = () => {
    if (type === "jewelry") return `${getJewelryPrice()} BD`
    if (type === "service") return `${item.price?.toFixed(2)} BD`
    if (type === "collection")
      return collectionPrice !== null ? `${collectionPrice} BD` : "—"
    return null
  }

  const handleAdd = async () => {
    if (!user) return

    const currentOrder = order
    const currentOrderId = order.orderId

    let price = 0
    let newItem = {}

    if (type === "jewelry") {
      price = getJewelryPrice()
      newItem = {
        item: item._id,
        itemModel: "Jewelry",
        quantity: 1,
        totalPrice: price,
        notes: "",
      }
    } else if (type === "collection") {
      price = collectionPrice
      newItem = {
        item: item._id,
        itemModel: "Collection",
        quantity: 1,
        totalPrice: price,
        notes: "",
      }
    } else if (type === "service") {
      price = item.price
      newItem = {
        service: item._id,
        jewelry: [],
        totalPrice: price,
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
                totalPrice: price,
                collectionMethod: "delivery",
              }
            : {
                jewelryOrder: [newItem],
                serviceOrder: [],
                totalPrice: price,
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

      if (type === "service") {
        updatedServiceOrder.push(newItem)
      } else {
        updatedJewelryOrder.push(newItem)
      }

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

  const handleWishlist = async () => {
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
          (typeof it.favouritedItem === "string"
            ? it.favouritedItem
            : it.favouritedItem._id) === item._id
      )

      let updatedItems

      if (exists) {
        updatedItems = wishlist.items.filter(
          (it) =>
            (typeof it.favouritedItem === "string"
              ? it.favouritedItem
              : it.favouritedItem._id) !== item._id
        )
        if (typeof onRemove === "function") onRemove(item._id)
      } else {
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
      }

      await User.put(`/wishlist/${wishlist._id}`, { items: updatedItems })
      window.dispatchEvent(new Event("wishlist-updated"))
    } catch (err) {
      if (err.response?.status === 404) {
        await User.post("/wishlist", { items: [newEntry] })
        window.dispatchEvent(new Event("wishlist-updated"))
      } else {
        console.error(err)
      }
    }
  }

  return (
    <div className="search-card">
      <div className="search-image-wrapper">
        <img
          src={item.images?.[0] || placeholder}
          alt={item.name}
          className="search-card-image"
        />
        <div className="add-actions">
          <h6
            className={!user ? "disabled-link" : null}
            title={!user ? "Sign in to add to Cart" : "Add to Cart"}
            onClick={() => user && handleAdd()}
          >
            Add to Cart
          </h6>

          <h6
            className={!user ? "disabled-link" : null}
            title={
              !user
                ? "Sign in to manage Wishlist"
                : inWishlistPage
                ? "Remove from Wishlist"
                : "Add to Wishlist"
            }
            onClick={() => user && handleWishlist()}
          >
            {inWishlistPage ? "Remove" : "Wishlist"}
          </h6>
        </div>
      </div>

      <div className="card-info">
        <h3 className="service-card__title">{item.name}</h3>
        <p className="price">{displayPrice()}</p>
      </div>
    </div>
  )
}

export default ProductCard
