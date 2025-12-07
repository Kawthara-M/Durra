import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import User from "../services/api"
import Reviews from "../components/Reviews"
import heartIcon from "../assets/heart.png"
import imageSlider from "../services/imageSliders"
import { useUser } from "../context/UserContext"
import { useOrder } from "../context/OrderContext"
import { createOrder, updateOrder } from "../services/order"
import {
  calculateCollectionPrice,
  fetchMetalRates,
} from "../services/calculator"
import FeedbackModal from "../components/FeedbackModal"

import "../../public/stylesheets/customer-jewelry-page.css"

const CollectionPage = () => {
  const { collectionId } = useParams()
  const { user } = useUser()

  const { order, addJewelryToOrder, setOrderId, setShopId, setFullOrder } =
    useOrder()

  const [metalRates, setMetalRates] = useState(null)
  const [collection, setCollection] = useState(null)
  const [totalPrice, setTotalPrice] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isExpanded, setIsExpanded] = useState(false)

  const [showShopModal, setShowShopModal] = useState(false)
  const [shopModalMessage, setShopModalMessage] = useState("")

  const [showAddModal, setShowAddModal] = useState(false)
  const [addModalMessage, setAddModalMessage] = useState("")
  const [addModalType, setAddModalType] = useState("success") // NEW
  const [isAdding, setIsAdding] = useState(false)
  const [isWishlistUpdating, setIsWishlistUpdating] = useState(false)

  const {
    currentIndex: currentImageIndex,
    handleNext,
    handlePrev,
  } = imageSlider(collection?.jewelry?.[0]?.images)

  useEffect(() => {
    const getCollection = async () => {
      try {
        const response = await User.get(`/collections/${collectionId}`)
        setCollection(response.data.collection)
      } catch (err) {
        console.error("Failed to fetch collection", err)
      }
    }
    getCollection()
  }, [collectionId])

  useEffect(() => {
    const getRates = async () => {
      if (!collection) return
      try {
        const rates = await fetchMetalRates()
        setMetalRates(rates)
        const price = calculateCollectionPrice(collection, rates)
        if (price !== null) setTotalPrice(Number(price.toFixed(2)))
      } catch (err) {
        console.error("Failed to fetch collection price", err)
      }
    }
    getRates()
  }, [collection])

  const handleChange = (e) => {
    const val = parseInt(e.target.value, 10)
    setQuantity(Number.isNaN(val) ? 1 : val)
  }

  const alreadyInCart = () => {
    if (!order || !collection) return false

    return (order.jewelryOrder || []).some((entry) => {
      const entryId =
        typeof entry.item === "object" ? entry.item._id : entry.item
      return (
        String(entryId) === String(collection._id) &&
        entry.itemModel === "Collection"
      )
    })
  }

  const addItemToOrder = async () => {
    if (!user || !collection) return false

    const currentOrder = order || {}
    const currentOrderId = currentOrder.orderId

    const qty = quantity || 1
    const itemTotal = totalPrice * qty

    const newItem = {
      item: collection._id,
      itemModel: "Collection",
      quantity: qty,
      totalPrice: itemTotal,
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

      const existingIndex = updatedJewelryOrder.findIndex(
        (i) =>
          String(i.item) === String(newItem.item) &&
          i.itemModel === "Collection"
      )

      if (existingIndex !== -1) {
        const existing = updatedJewelryOrder[existingIndex]
        updatedJewelryOrder[existingIndex] = {
          ...existing,
          quantity: (existing.quantity || 0) + newItem.quantity,
          totalPrice:
            Number(existing.totalPrice || 0) + Number(newItem.totalPrice || 0),
        }
      } else {
        updatedJewelryOrder.push(newItem)
      }

      if (!currentOrderId) {
        const itemShopId =
          typeof collection.shop === "object"
            ? collection.shop?._id
            : collection.shop

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
          shop: itemShopId || null,
        }

        const createdOrder = await createOrder(payload)
        const orderDoc = createdOrder.order || createdOrder
        const finalOrderId = orderDoc._id

        setOrderId(finalOrderId)
        setFullOrder(orderDoc)

        const shopIdFromBackend =
          typeof orderDoc.shop === "object" ? orderDoc.shop?._id : orderDoc.shop

        if (shopIdFromBackend) {
          setShopId(shopIdFromBackend)
        }

        addJewelryToOrder({
          ...newItem,
          shop: orderDoc.shop,
        })

        return true
      }

      const updatedOrderDoc = await updateOrder(currentOrderId, {
        jewelryOrder: updatedJewelryOrder,
        serviceOrder: updatedServiceOrder,
      })

      setFullOrder(updatedOrderDoc)
      addJewelryToOrder({
        ...newItem,
        shop: updatedOrderDoc.shop,
      })

      return true
    } catch (err) {
      console.error(
        "Failed to add collection to cart:",
        err.response?.data || err
      )
      return false
    }
  }

  const handleAdd = async () => {
    if (!user || !collection) return

    if (alreadyInCart()) {
      setAddModalType("warning")
      setAddModalMessage("This collection is already in your cart.")
      setShowAddModal(true)
      return
    }

    const currentOrder = order || {}
    const currentOrderId = currentOrder.orderId

    const currentShopId =
      currentOrder.shopId ??
      (typeof currentOrder.shop === "object"
        ? currentOrder.shop?._id
        : currentOrder.shop)

    const itemShopId =
      typeof collection.shop === "object"
        ? collection.shop?._id
        : collection.shop

    if (currentOrderId && currentShopId && itemShopId) {
      if (String(itemShopId) !== String(currentShopId)) {
        setShopModalMessage(
          "Your cart currently contains items from another shop. To add this collection, you need to replace your existing cart."
        )
        setShowShopModal(true)
        return
      }
    }

    setIsAdding(true)
    const success = await addItemToOrder()
    if (success) {
      setAddModalType("success")
      setAddModalMessage("This collection has been added to your cart.")
    } else {
      setAddModalType("error")
      setAddModalMessage(
        "An error occurred while adding this collection to your cart."
      )
    }
    setShowAddModal(true)
    setIsAdding(false)
  }

  const handleClearCartAndAdd = async () => {
    try {
      if (!order.orderId || !collection) {
        setShowShopModal(false)
        return
      }

      const qty = quantity || 1
      const itemTotal = totalPrice * qty

      const jewelryOrder = [
        {
          item: collection._id,
          itemModel: "Collection",
          quantity: qty,
          totalPrice: itemTotal,
        },
      ]

      const serviceOrder = []

      const body = {
        jewelryOrder,
        serviceOrder,
      }

      const itemShopId =
        typeof collection.shop === "object"
          ? collection.shop?._id
          : collection.shop

      if (itemShopId) {
        body.shop = itemShopId
      }

      const updatedOrderDoc = await updateOrder(order.orderId, body)

      setFullOrder(updatedOrderDoc)
      setShopId(
        typeof updatedOrderDoc.shop === "object"
          ? updatedOrderDoc.shop?._id
          : updatedOrderDoc.shop
      )

      addJewelryToOrder({
        item: collection._id,
        itemModel: "Collection",
        quantity: qty,
        totalPrice: itemTotal,
        shop: updatedOrderDoc.shop,
      })

      setShowShopModal(false)
      setAddModalType("success")
      setAddModalMessage(
        "Your cart was updated and this collection has been added."
      )
      setShowAddModal(true)
    } catch (err) {
      console.error("Failed to clear cart and add:", err.response?.data || err)
      setShowShopModal(false)
    }
  }

  const handleWishlist = async () => {
    if (!user || !collection) return

    setIsWishlistUpdating(true)

    const newEntry = {
      favouritedItem: collection._id,
      favouritedItemType: "Collection",
    }

    try {
      const res = await User.get("/wishlist")
      const wishlist = res.data.wishlist

      const exists = wishlist.items.some((it) => {
        const id =
          typeof it.favouritedItem === "object"
            ? it.favouritedItem._id
            : it.favouritedItem
        return id === collection._id
      })

      let updatedItems
      if (exists) {
        updatedItems = wishlist.items.filter((it) => {
          const id =
            typeof it.favouritedItem === "object"
              ? it.favouritedItem._id
              : it.favouritedItem
          return id !== collection._id
        })
        setAddModalType("success")
        setAddModalMessage("Removed from your wishlist.")
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
        setAddModalType("success")
        setAddModalMessage("Added to your wishlist.")
      }

      await User.put(`/wishlist/${wishlist._id}`, { items: updatedItems })
      window.dispatchEvent(new Event("wishlist-updated"))
      setShowAddModal(true)
    } catch (err) {
      if (err.response?.status === 404) {
        await User.post("/wishlist", { items: [newEntry] })
        window.dispatchEvent(new Event("wishlist-updated"))
        setAddModalType("success")
        setAddModalMessage("Added to your wishlist.")
        setShowAddModal(true)
      } else {
        console.error("Failed to update wishlist:", err)
      }
    } finally {
      setIsWishlistUpdating(false)
    }
  }

  return (
    <>
      {collection && (
        <div className="customer-jewelry-page">
          <div className="service-page-content">
            <div className="service-images">
              {collection.images?.length > 0 && (
                <div className="service-image-slider">
                  <button className="left-arrow" onClick={handlePrev}>
                    ←
                  </button>
                  <div className="image-box">
                    <img
                      src={collection.images[currentImageIndex]}
                      alt={`Image ${currentImageIndex + 1}`}
                      className="box-image"
                    />
                  </div>
                  <button className="right-arrow" onClick={handleNext}>
                    →
                  </button>
                </div>
              )}
            </div>

            <div className="service-information">
              <div className="information-top-wrapper">
                <h1>{collection.name}</h1>
                <h2 className="shop-name-in-product-page">
                  {collection.shop.name}
                </h2>
                <h2 className="service-description">Description</h2>
                <p id="jeweler-service-description">{collection.description}</p>
              </div>

              <div className="jewelry-inputs">
                <div className="jeweler-service-details">
                  <h3 className="service-price">Price</h3>
                  <p id="jewelry-price">
                    {totalPrice.toFixed ? totalPrice.toFixed(2) : totalPrice}{" "}
                    BHD
                  </p>
                </div>
                <input
                  type="number"
                  name="quantity"
                  onChange={handleChange}
                  value={quantity}
                  min="1"
                  max={collection.limitPerOrder || 10}
                  placeholder="1"
                />
                <span className="add-or-wishlist">
                  <button
                    onClick={handleAdd}
                    disabled={!user || isAdding}
                    title={user ? "Add to Cart" : "Sign in to Add"}
                  >
                    {isAdding ? "Adding..." : "Add to Cart"}
                  </button>
                  <img
                    src={heartIcon}
                    alt="Wishlist"
                    title={
                      user ? "Add to Wishlist" : "Sign in to Add to Wishlist"
                    }
                    className={`icon ${
                      (!user || isWishlistUpdating) && "disabled"
                    }`}
                    onClick={
                      user && !isWishlistUpdating ? handleWishlist : undefined
                    }
                  />
                </span>
              </div>
            </div>
          </div>

          <div className="jewelry-details-wrapper">
            <div
              className="jewelry-details"
              onClick={() => setIsExpanded((prev) => !prev)}
            >
              <h3 className="jewelry-details-heading">Collection Content</h3>
              <p>{isExpanded ? "-" : "+"}</p>
            </div>
            {isExpanded && (
              <div className="jewelry-extra-details">
                <ul className="customer-collection-details">
                  {collection.jewelry?.map((item, index) => (
                    <li key={index}>{item.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div>
            <h3 className="reviews-heading">Reviews</h3>
            <Reviews
              reviewedItemId={collectionId}
              reviewedItemType="Collection"
            />
          </div>
        </div>
      )}

      <FeedbackModal
        show={showShopModal}
        type="confirm"
        message={shopModalMessage}
        onClose={() => {
          setShowShopModal(false)
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
            },
          },
        ]}
      />

      <FeedbackModal
        show={showAddModal}
        type={addModalType}  
        message={addModalMessage}
        onClose={() => setShowAddModal(false)}
        actions={[
          {
            label: "Close",
            onClick: () => setShowAddModal(false),
            primary: true,
          },
        ]}
      />
    </>
  )
}

export default CollectionPage
