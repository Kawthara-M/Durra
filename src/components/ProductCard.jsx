import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import FeedbackModal from "./FeedbackModal"
import placeholder from "../assets/placeholder.png"

import { useUser } from "../context/UserContext"
import { useOrder } from "../context/OrderContext"

import {
  calculatePreciousMaterialCost,
  calculateTotalCost,
  calculateCollectionPrice,
} from "../services/calculator"

import { createOrder, updateOrder } from "../services/order"
import User from "../services/api"

const ProductCard = ({
  item,
  type,
  metalRates,
  inWishlistPage = false,
  onRemove = null,
  showActions = true,
  showShopName = false,
}) => {
  const { user } = useUser()
  const navigate = useNavigate()

  const { order, setOrderId, setFullOrder } = useOrder()

  const [collectionPrice, setCollectionPrice] = useState(null)

  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isWishlistUpdating, setIsWishlistUpdating] = useState(false)

  const [showShopModal, setShowShopModal] = useState(false)
  const [shopModalMessage, setShopModalMessage] = useState("")
  const [pendingAddType, setPendingAddType] = useState(null)

  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginModalMessage, setLoginModalMessage] = useState("")

  const [actionFeedback, setActionFeedback] = useState({
    show: false,
    type: "success",
    message: "",
    target: null,
  })

  useEffect(() => {
    if (type === "collection" && metalRates) {
      const price = calculateCollectionPrice(item, metalRates)
      setCollectionPrice(Number(price.toFixed(2)))
    }
  }, [type, item, metalRates])

  const getJewelryPrice = () => {
    const basePrice = item?.originPrice || 0

    if (!metalRates) return Number(basePrice.toFixed(2))

    const metalCost = calculatePreciousMaterialCost(
      item.preciousMaterials,
      metalRates
    )

    const total = calculateTotalCost(metalCost, basePrice)
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

  const alreadyInCart = () => {
    if (!order) return false

    if (type === "jewelry" || type === "collection") {
      return (order.jewelryOrder || []).some((entry) => {
        const entryId =
          typeof entry.item === "object" ? entry.item._id : entry.item

        return (
          String(entryId) === String(item._id) &&
          entry.itemModel === (type === "jewelry" ? "Jewelry" : "Collection")
        )
      })
    }

    if (type === "service") {
      return (order.serviceOrder || []).some((entry) => {
        const serviceId =
          typeof entry.service === "object" ? entry.service._id : entry.service

        return String(serviceId) === String(item._id)
      })
    }

    return false
  }

  const handleAdd = async () => {
    if (!user) {
      setLoginModalMessage("Please sign in to add items to your cart.")
      setShowLoginModal(true)
      return
    }

    if (alreadyInCart()) {
      setActionFeedback({
        show: true,
        type: "warning",
        message: "This item is already in your cart.",
        target: "cart",
      })
      return
    }

    setIsAddingToCart(true)

    try {
      const currentOrder = order || {}
      const currentOrderId = currentOrder.orderId

      const currentShopId =
        typeof currentOrder.shop === "object"
          ? currentOrder.shop?._id
          : currentOrder.shop

      const itemShopId =
        typeof item.shop === "object" ? item.shop?._id : item.shop

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

      setActionFeedback({
        show: true,
        type: "success",
        message: "Item has been added to your cart.",
        target: "cart",
      })
    } catch (err) {
      console.error(err)

      setActionFeedback({
        show: true,
        type: "error",
        message: "We couldn't add this item to your cart.",
        target: null,
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  const addItemToOrder = async (forcedType) => {
    const effectiveType = forcedType || type

    const currentOrder = order || {}
    const currentOrderId = currentOrder.orderId

    let jewelryOrder = [...(currentOrder.jewelryOrder || [])]
    let serviceOrder = [...(currentOrder.serviceOrder || [])]

    if (effectiveType === "jewelry") {
      const newItem = {
        item: item._id,
        itemModel: "Jewelry",
        quantity: 1,
        totalPrice: Number(getJewelryPrice()),
      }
      jewelryOrder = [...jewelryOrder, newItem]
    } else if (effectiveType === "collection") {
      const newItem = {
        item: item._id,
        itemModel: "Collection",
        quantity: 1,
        totalPrice: Number(collectionPrice),
      }
      jewelryOrder = [...jewelryOrder, newItem]
    } else {
      const newItem = {
        service: item._id,
        jewelry: [],
        totalPrice: Number(item.price || 0),
      }
      serviceOrder = [...serviceOrder, newItem]
    }

    const normalizedJewelryOrder = jewelryOrder.map((entry) => ({
      item: typeof entry.item === "object" ? entry.item._id : entry.item,
      itemModel: entry.itemModel,
      quantity: entry.quantity ?? 1,
      totalPrice: Number(entry.totalPrice ?? 0),
      size: entry.size || undefined,
    }))

    const normalizedServiceOrder = serviceOrder.map((entry) => ({
      service:
        typeof entry.service === "object" ? entry.service._id : entry.service,
      jewelry: entry.jewelry || [],
      totalPrice: Number(entry.totalPrice ?? 0),
    }))

    const payload = {
      jewelryOrder: normalizedJewelryOrder,
      serviceOrder: normalizedServiceOrder,
      shop: typeof item.shop === "object" ? item.shop._id : item.shop,
      collectionMethod: "delivery",
      notes: "",
      totalPrice:
        normalizedJewelryOrder.reduce(
          (a, i) => a + Number(i.totalPrice || 0),
          0
        ) +
        normalizedServiceOrder.reduce(
          (a, i) => a + Number(i.totalPrice || 0),
          0
        ),
    }

    if (!currentOrderId) {
      const res = await createOrder(payload)
      const orderDoc = res.order || res
      setOrderId(orderDoc._id)
      setFullOrder(orderDoc)
    } else {
      const updated = await updateOrder(currentOrderId, payload)
      setFullOrder(updated)
    }
  }

  const handleClearCartAndAdd = async () => {
    if (!order?.orderId) return

    const effectiveType = pendingAddType || type

    let jewelryOrder = []
    let serviceOrder = []

    if (effectiveType === "service") {
      serviceOrder = [
        { service: item._id, jewelry: [], totalPrice: Number(item.price || 0) },
      ]
    } else {
      jewelryOrder = [
        {
          item: item._id,
          itemModel: effectiveType === "collection" ? "Collection" : "Jewelry",
          quantity: 1,
          totalPrice:
            effectiveType === "collection"
              ? Number(collectionPrice)
              : Number(getJewelryPrice()),
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

    setActionFeedback({
      show: true,
      type: "success",
      message: "Item has been added to your cart.",
      target: "cart",
    })
  }

  const handleWishlist = async () => {
    if (!user) {
      setLoginModalMessage("Please sign in to manage your wishlist.")
      setShowLoginModal(true)
      return
    }

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
      setIsWishlistUpdating(true)

      const res = await User.get("/wishlist")
      const wishlist = res.data.wishlist

      const exists = wishlist.items.some(
        (i) =>
          String(
            typeof i.favouritedItem === "object"
              ? i.favouritedItem._id
              : i.favouritedItem
          ) === String(item._id)
      )

      let updatedItems

      if (exists) {
        updatedItems = wishlist.items.filter(
          (i) =>
            String(
              typeof i.favouritedItem === "object"
                ? i.favouritedItem._id
                : i.favouritedItem
            ) !== String(item._id)
        )
        if (onRemove) onRemove(item._id)
      } else {
        updatedItems = [
          ...wishlist.items.map((it) => ({
            favouritedItem:
              typeof it.favouritedItem === "object"
                ? it.favouritedItem._id
                : it.favouritedItem,
            favouritedItemType: it.favouritedItemType,
          })),
          newEntry,
        ]
      }

      await User.put(`/wishlist/${wishlist._id}`, { items: updatedItems })
      window.dispatchEvent(new Event("wishlist-updated"))

      setActionFeedback({
        show: true,
        type: "success",
        message: exists ? "Removed from wishlist." : "Added to wishlist.",
        target: "wishlist",
      })
    } catch (err) {
      console.error(err)
    } finally {
      setIsWishlistUpdating(false)
    }
  }

  const isJeweler = user?.role === "Jeweler"

  const url =
    type === "collection"
      ? isJeweler
        ? `/show-collection/${item._id}`
        : `/collections/${item._id}`
      : type === "service"
      ? isJeweler
        ? `/show-service/${item._id}`
        : `/services/${item._id}`
      : isJeweler
      ? `/show-jewelry/${item._id}`
      : `/jewelry/${item._id}`

  return (
    <>
      <div className="search-card">
        <div className="search-image-wrapper">
          <Link to={url}>
            <img
              src={item?.images?.[0] || placeholder}
              alt={item?.name}
              className="search-card-image"
            />
          </Link>

          {showActions && (
            <div className="add-actions">
              <h6
                onClick={handleAdd}
                className={!user || isAddingToCart ? "disabled-link" : ""}
                title={!user ? "Sign in to add" : "Add to cart"}
              >
                {isAddingToCart ? "Adding..." : "Add to Cart"}
              </h6>

              <h6
                onClick={handleWishlist}
                className={!user || isWishlistUpdating ? "disabled-link" : ""}
                title={
                  !user
                    ? "Sign in to manage wishlist"
                    : inWishlistPage
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
              >
                {isWishlistUpdating
                  ? "Updating..."
                  : inWishlistPage
                  ? "Remove"
                  : "Wishlist"}
              </h6>
            </div>
          )}
        </div>

        <div className="card-info">
          <Link to={url}>
            <h3>{item.name}</h3>
          </Link>

          {showShopName && (
            <p className="shop-name">
              {typeof item.shop === "object" ? item.shop?.name : item.shop}
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
          { label: "Clear Cart and Add", onClick: handleClearCartAndAdd },
          { label: "Cancel", onClick: () => setShowShopModal(false) },
        ]}
      />

      <FeedbackModal
        show={showLoginModal}
        type="warning"
        message={loginModalMessage}
        onClose={() => setShowLoginModal(false)}
        actions={[
          {
            label: "Sign in",
            onClick: () => {
              setShowLoginModal(false)
              navigate("/sign-in")
            },
          },
          { label: "Cancel", onClick: () => setShowLoginModal(false) },
        ]}
      />

      <FeedbackModal
        show={actionFeedback.show}
        type={actionFeedback.type}
        message={actionFeedback.message}
        onClose={() => setActionFeedback((p) => ({ ...p, show: false }))}
        actions={[
          {
            label: "OK",
            onClick: () => setActionFeedback((p) => ({ ...p, show: false })),
          },
          ...(actionFeedback.target
            ? [
                {
                  label:
                    actionFeedback.target === "cart"
                      ? "View Cart"
                      : "View Wishlist",
                  primary: true,
                  onClick: () => {
                    const dest =
                      actionFeedback.target === "cart" ? "/cart" : "/wishlist"
                    setActionFeedback((p) => ({ ...p, show: false }))
                    navigate(dest)
                  },
                },
              ]
            : []),
        ]}
      />
    </>
  )
}

export default ProductCard
