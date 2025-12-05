import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"

import Reviews from "../components/Reviews"
import Comparsion from "../components/Comparsion"
import FeedbackModal from "../components/FeedbackModal"

import imageSlider from "../services/imageSliders"
import User from "../services/api"
import {
  fetchMetalRates,
  calculatePreciousMaterialCost,
  calculateTotalCost,
} from "../services/calculator"
import { createOrder, updateOrder } from "../services/order"
import { useUser } from "../context/UserContext"
import { useOrder } from "../context/OrderContext"

import heartIcon from "../assets/heart.png"
import comparsionIcon from "../assets/comparsion.png"
import "../../public/stylesheets/customer-jewelry-page.css"

const JewelryPage = () => {
  const [jewelry, setJewelry] = useState()
  const { jewelryId } = useParams()
  const { user } = useUser()

  const { order, addJewelryToOrder, setOrderId, setFullOrder } =
    useOrder()

  const [totalPrice, setTotalPrice] = useState(0)
  const [metalRates, setMetalRates] = useState()
  const [quantity, setQuantity] = useState(1)
  const [size, setSize] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)
  const [showComparison, setShowComparison] = useState(false)

  const [showShopModal, setShowShopModal] = useState(false)
  const [shopModalMessage, setShopModalMessage] = useState("")

  const [showAddModal, setShowAddModal] = useState(false)
  const [addModalMessage, setAddModalMessage] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [isWishlistUpdating, setIsWishlistUpdating] = useState(false)

  const {
    currentIndex: currentImageIndex,
    handleNext,
    handlePrev,
  } = imageSlider(jewelry?.images)

  // --------------------------
  // LOAD JEWELRY
  // --------------------------
  useEffect(() => {
    const getJewelry = async () => {
      try {
        const response = await User.get(`/jewelry/${jewelryId}`)
        setJewelry(response.data.jewelry)
      } catch (err) {
        console.error("Failed to fetch jewelry", err)
      }
    }

    getJewelry()
  }, [jewelryId])

  useEffect(() => {
    const getRates = async () => {
      if (!jewelry) return
      try {
        const rates = await fetchMetalRates()
        setMetalRates(rates)

        const preciousCost = calculatePreciousMaterialCost(
          jewelry.preciousMaterials,
          rates
        )
        const total = calculateTotalCost(preciousCost, jewelry.originPrice)

        setTotalPrice(parseFloat(total.toFixed(2)))
      } catch (err) {
        console.error("Rate calculation failed", err)
      }
    }

    getRates()
  }, [jewelry])

  const handleChange = (e) =>
    setQuantity(parseInt(e.target.value || 1))

  const handleAdd = async () => {
    if (!user || !jewelry) return

    const currentOrder = order || {}
    const currentOrderId = currentOrder.orderId

    const currentShopId =
      typeof currentOrder.shop === "object"
        ? currentOrder.shop?._id
        : currentOrder.shop

    const itemShopId =
      typeof jewelry.shop === "object"
        ? jewelry.shop?._id
        : jewelry.shop

    if (currentOrderId && currentShopId && itemShopId) {
      if (String(currentShopId) !== String(itemShopId)) {
        setShopModalMessage(
          "Your cart currently contains items from another shop. To add this item, you need to clear your existing cart."
        )
        setShowShopModal(true)
        return
      }
    }

    const qty = quantity || 1

    const newItem = {
      item: jewelry._id,
      itemModel: "Jewelry",
      quantity: qty,
      totalPrice: totalPrice * qty,
      size: size || undefined,
    }

    try {
      setIsAdding(true)

      if (!currentOrderId) {
        const payload = {
          jewelryOrder: [newItem],
          serviceOrder: [],
          totalPrice: newItem.totalPrice,
          collectionMethod: "delivery",
          notes: "",
          shop: itemShopId || null,
        }

        const created = await createOrder(payload)
        const orderDoc = created.order || created

        setOrderId(orderDoc._id)
        setFullOrder(orderDoc)
        addJewelryToOrder(newItem)

      } else {
        const updatedJewelryOrder = [
          ...(order.jewelryOrder || []).map((entry) => ({
            item:
              typeof entry.item === "object"
                ? entry.item._id
                : entry.item,
            itemModel: entry.itemModel,
            quantity: entry.quantity ?? 1,
            totalPrice: Number(entry.totalPrice ?? 0),
            size: entry.size || undefined,
          })),
          newItem,
        ]

        const updated = await updateOrder(currentOrderId, {
          jewelryOrder: updatedJewelryOrder,
        })

        setFullOrder(updated)
        addJewelryToOrder(newItem)
      }

      setAddModalMessage("This item has been added to your cart.")
      setShowAddModal(true)
    } catch (err) {
      console.error("Failed to add to cart", err)
      setAddModalMessage("An error occurred while adding to cart.")
      setShowAddModal(true)

    } finally {
      setIsAdding(false)
    }
  }

  const handleClearCartAndAdd = async () => {
    try {
      if (!order?.orderId || !jewelry) return

      const qty = quantity || 1

      const jewelryOrder = [
        {
          item: jewelry._id,
          itemModel: "Jewelry",
          quantity: qty,
          totalPrice: totalPrice * qty,
          size: size || undefined,
        },
      ]

      const updated = await updateOrder(order.orderId, {
        jewelryOrder,
        serviceOrder: [],
        shop:
          typeof jewelry.shop === "object"
            ? jewelry.shop._id
            : jewelry.shop,
      })

      setFullOrder(updated)
      setOrderId(updated._id)

      setShowShopModal(false)

      setAddModalMessage(
        "Your cart was updated and the jewelry has been added."
      )
      setShowAddModal(true)
    } catch (err) {
      console.error("Failed to replace cart", err)
      setShowShopModal(false)
    }
  }

  const handleWishlist = async () => {
    if (!user || !jewelry) return

    setIsWishlistUpdating(true)

    try {
      const newEntry = {
        favouritedItem: jewelry._id,
        favouritedItemType: "Jewelry",
      }

      const res = await User.get("/wishlist")
      const wishlist = res.data.wishlist

      const exists = wishlist.items.some(
        (i) =>
          (typeof i.favouritedItem === "object"
            ? i.favouritedItem._id
            : i.favouritedItem) === jewelry._id
      )

      let updatedItems

      if (exists) {
        updatedItems = wishlist.items.filter(
          (i) =>
            (typeof i.favouritedItem === "object"
              ? i.favouritedItem._id
              : i.favouritedItem) !== jewelry._id
        )

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

        setAddModalMessage("Added to your wishlist.")
      }

      await User.put(`/wishlist/${wishlist._id}`, {
        items: updatedItems,
      })

      window.dispatchEvent(new Event("wishlist-updated"))
      setShowAddModal(true)

    } catch (err) {
      if (err.response?.status === 404) {
        await User.post("/wishlist", { items: [newEntry] })

        window.dispatchEvent(new Event("wishlist-updated"))
        setAddModalMessage("Added to your wishlist.")
        setShowAddModal(true)
      } else {
        console.error("Wishlist update failed", err)
      }
    } finally {
      setIsWishlistUpdating(false)
    }
  }


  const formatCertificationName = (name) => {
    if (!name) return ""
    if (name.toUpperCase() === "GIA") {
      return "Gemological Institute of America (GIA)"
    }
    return name
  }

  return (
    <>
      {jewelry && (
        <div className="customer-jewelry-page">

          <div className="service-page-content">
            <div className="service-images">
              {jewelry.images.length > 0 && (
                <div className="service-image-slider">
                  <button className="left-arrow" onClick={handlePrev}>←</button>

                  <div className="image-box">
                    <img
                      src={jewelry.images[currentImageIndex]}
                      alt="Jewelry"
                      className="box-image"
                    />
                  </div>

                  <button className="right-arrow" onClick={handleNext}>→</button>
                </div>
              )}
            </div>

            <div className="service-information">

              <div className="information-top-wrapper">
                <h1>{jewelry.name}</h1>
                <p id="jeweler-service-description">
                  {jewelry.description}
                </p>

                <div className="jewelry-certifications">
                  {jewelry.certifications?.length > 0 && (
                    <>
                      <h3>Certified By</h3>
                      <p>
                        {jewelry.certifications
                          .map((c) => formatCertificationName(c.name))
                          .join(", ")}
                      </p>
                    </>
                  )}
                </div>

                <h3 className="service-price">
                  {totalPrice.toFixed(2)} BHD
                </h3>
              </div>

              <div className="jewelry-overview-wrapper">
                <div className="jewelry-inputs">

                  {jewelry.type?.toLowerCase() === "ring" && (
                    <select
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      className="ring-size-selector"
                    >
                      <option value="">Select Size</option>
                      <option value="US 5">US 5</option>
                      <option value="US 6">US 6</option>
                      <option value="US 7">US 7</option>
                      <option value="US 8">US 8</option>
                      <option value="US 9">US 9</option>
                    </select>
                  )}

                  <input
                    type="number"
                    min="1"
                    max={jewelry.limitPerOrder}
                    value={quantity}
                    onChange={handleChange}
                  />

                  <span className="add-or-wishlist">

                    <button
                      disabled={!user || isAdding}
                      onClick={user ? handleAdd : undefined}
                    >
                      {isAdding ? "Adding..." : "Add to Cart"}
                    </button>

                    <img
                      src={heartIcon}
                      className={`icon ${(!user || isWishlistUpdating) && "disabled"}`}
                      title={user ? "Wishlist" : "Sign in required"}
                      onClick={
                        user && !isWishlistUpdating
                          ? handleWishlist
                          : undefined
                      }
                    />

                    <img
                      src={comparsionIcon}
                      className={`icon ${!user && "disabled"}`}
                      onClick={() => user && setShowComparison(true)}
                    />

                  </span>
                </div>
              </div>

            </div>
          </div>

          <Reviews reviewedItemId={jewelryId} reviewedItemType="Jewelry" />

          {showComparison && (
            <Comparsion
              isOverlay
              currentJewelryId={jewelryId}
              onClose={() => setShowComparison(false)}
            />
          )}

          {showShopModal && (
            <FeedbackModal
              type="confirm"
              message={shopModalMessage}
              show={showShopModal}
              onClose={() => setShowShopModal(false)}
              actions={[
                { label: "Clear Cart & Add", onClick: handleClearCartAndAdd },
                { label: "Cancel", onClick: () => setShowShopModal(false) },
              ]}
            />
          )}

          <FeedbackModal
            type="success"
            show={showAddModal}
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

        </div>
      )}
    </>
  )
}

export default JewelryPage
