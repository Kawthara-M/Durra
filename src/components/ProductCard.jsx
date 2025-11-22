import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import FeedbackModal from "./FeedbackModal"
import placeholder from "../assets/placeholder.png"
import { useUser } from "../context/UserContext"
import { useOrder } from "../context/OrderContext"
import {
  calculatePreciousMaterialCost,
  calculateTotalCost,
  calculateCollectionPrice,
} from "../services/calculator.js"
import { createOrder, updateOrder, cancelOrder } from "../services/order.js"
import User from "../services/api.js"

const ProductCard = ({
  item,
  type,
  metalRates,
  inWishlistPage,
  onRemove,
  showActions,
  showShopName = false,
}) => {
  const { user } = useUser()
  const {
    order,
    addJewelryToOrder,
    addServiceToOrder,
    setOrderId,
    setShopId,
    setFullOrder,
    resetOrder,
  } = useOrder()
  const [collectionPrice, setCollectionPrice] = useState(null)

  const [showShopModal, setShowShopModal] = useState(false)
  const [shopModalMessage, setShopModalMessage] = useState("")
  const [pendingAddType, setPendingAddType] = useState(null)

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
    return total.toFixed(2)
  }

  const displayPrice = () => {
    if (type === "jewelry") return `${getJewelryPrice()} BHD`
    if (type === "service") return `${item.price?.toFixed(2)} BHD`
    if (type === "collection")
      return collectionPrice !== null
        ? `${collectionPrice.toFixed(2)} BHD`
        : "—"
    return null
  }
  const handleAdd = async () => {
    if (!user) return

    const currentOrder = order || {}

    const currentOrderId = currentOrder.orderId

    const currentShopId =
      currentOrder.shopId ??
      (typeof currentOrder.shop === "object"
        ? currentOrder.shop?._id
        : currentOrder.shop)

    const itemShopId =
      (typeof item.shop === "object" ? item.shop?._id : item.shop) ||
      (typeof item.service === "object"
        ? item.service?.shop
        : item.service?.shop)

    if (currentOrderId && currentShopId && itemShopId) {
      if (String(itemShopId) !== String(currentShopId)) {
        setShopModalMessage(
          "Your cart currently contains items from another shop. To add this item, you need to clear your existing cart."
        )
        setPendingAddType(type)
        setShowShopModal(true)
        return
      }
    }

    await addItemToOrder(type)
  }

  const addItemToOrder = async (forcedType) => {
    const effectiveType = forcedType || type

    if (!user) return

    const currentOrder = order
    const currentOrderId = currentOrder?.orderId

    let price = 0
    let newItem = {}

    if (effectiveType === "jewelry") {
      price = Number(getJewelryPrice())
      newItem = {
        item: item._id,
        itemModel: "Jewelry",
        quantity: 1,
        totalPrice: price,
        shop: item.shop,
      }
    } else if (effectiveType === "collection") {
      price = Number(collectionPrice)
      newItem = {
        item: item._id,
        itemModel: "Collection",
        quantity: 1,
        totalPrice: price,
      }
    } else if (effectiveType === "service") {
      price = Number(item.price || 0)
      newItem = {
        service: item._id,
        jewelry: [{}],
        totalPrice: price,
      }
    }

    try {
      let updatedJewelryOrder = (currentOrder?.jewelryOrder || []).map(
        (entry) => ({
          item: typeof entry.item === "object" ? entry.item._id : entry.item,
          itemModel: entry.itemModel,
          quantity: entry.quantity ?? 1,
          totalPrice: Number(entry.totalPrice ?? 0),
        })
      )

      let updatedServiceOrder = [...(currentOrder?.serviceOrder || [])]

      if (effectiveType === "jewelry" || effectiveType === "collection") {
        const existingIndex = updatedJewelryOrder.findIndex(
          (i) =>
            String(i.item) === String(newItem.item) &&
            i.itemModel === newItem.itemModel
        )

        if (existingIndex !== -1) {
          return
        } else {
          updatedJewelryOrder.push(newItem)
          console.log("jewelry order after pushing", updatedJewelryOrder)
        }
      } else if (effectiveType === "service") {
        const existingServiceIndex = updatedServiceOrder.findIndex(
          (s) => String(s.service) === String(newItem.service)
        )

        if (existingServiceIndex !== -1) {
          const existing = updatedServiceOrder[existingServiceIndex]
          updatedServiceOrder[existingServiceIndex] = {
            ...existing,
            totalPrice:
              Number(existing.totalPrice || 0) +
              Number(newItem.totalPrice || 0),
          }
        } else {
          updatedServiceOrder.push(newItem)
        }
      }
      if (!currentOrderId) {
        const payload = {
          jewelryOrder: updatedJewelryOrder,
          serviceOrder: updatedServiceOrder,
          totalPrice:
            updatedJewelryOrder.reduce(
              (a, i) => a + Number(i.totalPrice || 0),
              0
            ) +
            updatedServiceOrder.reduce(
              (a, i) => a + Number(i.totalPrice || 0),
              0
            ),
          collectionMethod: "delivery",
          notes: "",
        }

        const createdOrder = await createOrder(payload)

        const orderDoc = createdOrder.order || createdOrder

        const finalOrderId = orderDoc._id
        setOrderId(finalOrderId)
        setFullOrder(orderDoc)

        const shopIdFromBackend =
          typeof orderDoc.shop === "object" ? orderDoc.shop?._id : orderDoc.shop

        setShopId(shopIdFromBackend)

        if (effectiveType === "service") {
          addServiceToOrder(newItem)
        } else {
          addJewelryToOrder({ ...newItem, shop: orderDoc.shop })
        }

        return
      }

      if (effectiveType === "service") {
        const updated = await updateOrder(currentOrderId, {
          serviceOrder: updatedServiceOrder,
        })
        setFullOrder(updated)
        addServiceToOrder(newItem)
      } else {
        const updated = await updateOrder(currentOrderId, {
          jewelryOrder: updatedJewelryOrder,
        })
        setFullOrder(updated)
        addJewelryToOrder(newItem)
      }
    } catch (err) {
      console.error("Failed to add to order:", err.response?.data || err)
    }
  }

  const handleClearCartAndAdd = async () => {
    try {
      if (!order.orderId) return

      const effectiveType = pendingAddType || type

      let jewelryOrder = []
      let serviceOrder = []

      if (effectiveType === "jewelry") {
        jewelryOrder = [
          {
            item: item._id,
            itemModel: "Jewelry",
            quantity: 1,
            totalPrice: Number(getJewelryPrice()),
          },
        ]
      } else if (effectiveType === "collection") {
        jewelryOrder = [
          {
            item: item._id,
            itemModel: "Collection",
            quantity: 1,
            totalPrice: Number(collectionPrice),
          },
        ]
      } else if (effectiveType === "service") {
        serviceOrder = [
          {
            service: item._id,
            jewelry: [],
            totalPrice: Number(item.price || 0),
          },
        ]
      }

      const res = await updateOrder(order.orderId, {
        jewelryOrder,
        serviceOrder,
        shop: typeof item.shop === "object" ? item.shop._id : item.shop,
      })

      setFullOrder(res)
      setShowShopModal(false)
      setPendingAddType(null)
    } catch (err) {
      console.error("Failed to clear cart and add:", err.response?.data || err)
      setShowShopModal(false)
      setPendingAddType(null)
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

  const url =
    user?.role === "Jeweler"
      ? type === "collection"
        ? `/jeweler-collections/${item._id}`
        : type === "service"
        ? `/jeweler-services/${item._id}`
        : `/jeweler-jewelry/${item._id}`
      : type === "collection"
      ? `/collections/${item._id}`
      : type === "service"
      ? `/services/${item._id}`
      : `/jewelry/${item._id}`

  return (
    <>
      <div className="search-card">
        <div className="search-image-wrapper">
          <Link to={url}>
            <img
              src={item.images?.[0] || placeholder}
              alt={item.name}
              className="search-card-image"
            />
          </Link>
          {showActions && (
            <>
              <div className="add-actions">
                <h6
                  className={!user ? "disabled-link" : null}
                  title={!user ? "Sign in to add to Cart" : "Add to Cart"}
                  onClick={(e) => {
                    if (!user) return

                    e.preventDefault()
                    e.stopPropagation()

                    handleAdd()
                  }}
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
                  onClick={(e) => {
                    if (!user) return

                    e.preventDefault()
                    e.stopPropagation()

                    handleWishlist()

                    if (inWishlistPage && typeof onRemove === "function") {
                      onRemove(item._id)
                    }
                  }}
                >
                  {inWishlistPage ? "Remove" : "Wishlist"}
                </h6>
              </div>
            </>
          )}
        </div>

        <div className="card-info">
          <Link to={url}>
            <h3 className="service-card__title">{item.name}</h3>
          </Link>
          {showShopName && (
            <p className="shop-name">
              {typeof item.shop === "object"
                ? item.shop?.name || "Shop"
                : item.shopName || "Shop"}
            </p>
          )}
          <p className="price">{displayPrice()}</p>
        </div>
      </div>
      <FeedbackModal
        show={showShopModal}
        type="confirm"
        message={shopModalMessage}
        onClose={() => {
          setShowShopModal(false)
          setPendingAddType(null)
        }}
        actions={[
          {
            label: "Clear Cart and Add",
            onClick: handleClearCartAndAdd,
          },
          {
            label: "Cancel",
            onClick: () => {
              setShowShopModal(false)
              setPendingAddType(null)
            },
          },
        ]}
      />
    </>
  )
}

ProductCard.defaultProps = {
  inWishlistPage: false,
  onRemove: null,
}

export default ProductCard
