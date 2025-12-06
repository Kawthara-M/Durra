import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"

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
  const navigate = useNavigate()
  const { user } = useUser()

  const { order, addJewelryToOrder, setOrderId, setFullOrder } = useOrder()

  const [totalPrice, setTotalPrice] = useState(0)
  const [metalRates, setMetalRates] = useState()
  const [quantity, setQuantity] = useState(1)
  const [size, setSize] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)
  const [showComparison, setShowComparison] = useState(false)

  const [showShopModal, setShowShopModal] = useState(false)
  const [shopModalMessage, setShopModalMessage] = useState("")

  const [isAdding, setIsAdding] = useState(false)
  const [isWishlistUpdating, setIsWishlistUpdating] = useState(false)

  const [actionFeedback, setActionFeedback] = useState({
    show: false,
    type: "success",
    message: "",
    target: null,
  })

  const {
    currentIndex: currentImageIndex,
    handleNext,
    handlePrev,
  } = imageSlider(jewelry?.images)

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
    setQuantity(parseInt(e.target.value || 1, 10) || 1)

  const alreadyInCart = () => {
    if (!order || !jewelry) return false

    return (order.jewelryOrder || []).some((entry) => {
      const entryId =
        typeof entry.item === "object" ? entry.item._id : entry.item
      return (
        String(entryId) === String(jewelry._id) &&
        entry.itemModel === "Jewelry"
      )
    })
  }

  const handleAdd = async () => {
    if (!user || !jewelry) return

    if (alreadyInCart()) {
      setActionFeedback({
        show: true,
        type: "warning",
        message: "This item is already in your cart.",
        target: "cart",
      })
      return
    }

    const currentOrder = order || {}
    const currentOrderId = currentOrder.orderId

    const currentShopId =
      typeof currentOrder.shop === "object"
        ? currentOrder.shop?._id
        : currentOrder.shop

    const itemShopId =
      typeof jewelry.shop === "object" ? jewelry.shop?._id : jewelry.shop

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
        const normalizedJewelryOrder = (order.jewelryOrder || []).map(
          (entry) => ({
            item:
              typeof entry.item === "object" ? entry.item._id : entry.item,
            itemModel: entry.itemModel,
            quantity: entry.quantity ?? 1,
            totalPrice: Number(entry.totalPrice ?? 0),
            size: entry.size || undefined,
          })
        )

        const updatedJewelryOrder = [...normalizedJewelryOrder, newItem]

        const updated = await updateOrder(currentOrderId, {
          jewelryOrder: updatedJewelryOrder,
        })

        setFullOrder(updated)
        addJewelryToOrder(newItem)
      }

      setActionFeedback({
        show: true,
        type: "success",
        message: "This item has been added to your cart.",
        target: "cart",
      })
    } catch (err) {
      console.error("Failed to add to cart", err)
      setActionFeedback({
        show: true,
        type: "error",
        message: "An error occurred while adding to cart.",
        target: null,
      })
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
          typeof jewelry.shop === "object" ? jewelry.shop._id : jewelry.shop,
      })

      setFullOrder(updated)
      setOrderId(updated._id)

      setShowShopModal(false)

      setActionFeedback({
        show: true,
        type: "success",
        message: "Your cart was updated and the jewelry has been added.",
        target: "cart",
      })
    } catch (err) {
      console.error("Failed to replace cart", err)
      setShowShopModal(false)
    }
  }

  const handleWishlist = async () => {
    if (!user || !jewelry) return

    setIsWishlistUpdating(true)

    const newEntry = {
      favouritedItem: jewelry._id,
      favouritedItemType: "Jewelry",
    }

    try {
      const res = await User.get("/wishlist")
      const wishlist = res.data.wishlist

      const exists = wishlist.items.some(
        (i) =>
          (typeof i.favouritedItem === "object"
            ? i.favouritedItem._id
            : i.favouritedItem) === jewelry._id
      )

      let updatedItems
      let message

      if (exists) {
        updatedItems = wishlist.items.filter(
          (i) =>
            (typeof i.favouritedItem === "object"
              ? i.favouritedItem._id
              : i.favouritedItem) !== jewelry._id
        )
        message = "Removed from your wishlist."
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
        message = "Added to your wishlist."
      }

      await User.put(`/wishlist/${wishlist._id}`, {
        items: updatedItems,
      })

      window.dispatchEvent(new Event("wishlist-updated"))

      setActionFeedback({
        show: true,
        type: "success",
        message,
        target: "wishlist",
      })
    } catch (err) {
      if (err.response?.status === 404) {
        try {
          await User.post("/wishlist", { items: [newEntry] })
          window.dispatchEvent(new Event("wishlist-updated"))
          setActionFeedback({
            show: true,
            type: "success",
            message: "Added to your wishlist.",
            target: "wishlist",
          })
        } catch (innerErr) {
          console.error(innerErr)
          setActionFeedback({
            show: true,
            type: "error",
            message: "We couldn't update your wishlist. Please try again.",
            target: null,
          })
        }
      } else {
        console.error("Wishlist update failed", err)
        setActionFeedback({
          show: true,
          type: "error",
          message: "We couldn't update your wishlist. Please try again.",
          target: null,
        })
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
                  <button className="left-arrow" onClick={handlePrev}>
                    ←
                  </button>

                  <div className="image-box">
                    <img
                      src={jewelry.images[currentImageIndex]}
                      alt="Jewelry"
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
                <h1>{jewelry.name}</h1>
                <p id="jeweler-service-description">{jewelry.description}</p>

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

                <h3 className="service-price">{totalPrice.toFixed(2)} BHD</h3>
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
                      title={user ? "Add to Cart" : "Sign in to Add"}
                    >
                      {isAdding ? "Adding..." : "Add to Cart"}
                    </button>

                    <img
                      src={heartIcon}
                      className={`icon ${
                        (!user || isWishlistUpdating) && "disabled"
                      }`}
                      title={
                        user ? "Add to Wishlist" : "Sign in to Add to Wishlist"
                      }
                      onClick={
                        user && !isWishlistUpdating ? handleWishlist : undefined
                      }
                    />

                    <img
                      src={comparsionIcon}
                      className={`icon ${!user && "disabled"}`}
                      title={
                        user
                          ? "Compare with other pieces"
                          : "Sign in to compare pieces"
                      }
                      onClick={() => user && setShowComparison(true)}
                    />
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="jewelry-details-wrapper">
            <div
              className="jewelry-details"
              onClick={() => setIsExpanded((prev) => !prev)}
            >
              <h3 className="jewelry-details-heading">Details</h3>
              <p>{isExpanded ? "-" : "+"}</p>
            </div>
            {isExpanded && (
              <div className="jewelry-extra-details">
                <div className="extra-details-wrapper">
                  <span>
                    <h5>Main Material</h5>
                    {jewelry.mainMaterial}
                  </span>
                  <span>
                    <h5>Total Weight</h5>
                    {jewelry.totalWeight}g
                  </span>
                  <span>
                    <h5>Production Cost</h5>
                    {jewelry.productionCost} BHD
                  </span>
                </div>

                {jewelry.preciousMaterials?.length > 0 && (
                  <div>
                    <h4>Precious Metals</h4>
                    <ul className="list-details">
                      {jewelry.preciousMaterials.map((material, index) => (
                        <li key={index}>
                          {material.karat}K {material.name} - {material.weight}g
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {jewelry.pearls?.length > 0 && (
                  <div>
                    <h4>Pearls</h4>
                    <ul className="list-details">
                      {jewelry.pearls.map((pearl, index) => (
                        <li key={index}>
                          {pearl.number}x {pearl.type} {pearl.shape}{" "}
                          {pearl.color} Pearl - {pearl.weight}g
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {jewelry.diamonds?.length > 0 && (
                  <div>
                    <h4>Diamonds</h4>
                    <ul className="list-details">
                      {jewelry.diamonds.map((diamond, index) => (
                        <li key={index}>
                          {diamond.number}x {diamond.type} Diamond -{" "}
                          {diamond.weight}g
                          <br />
                          <span>
                            Color: {diamond.color}, Clarity: {diamond.clarity},
                            Cut: {diamond.cutGrade}, Shape: {diamond.shape}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {jewelry.otherMaterials?.length > 0 && (
                  <div>
                    <h4>Metals</h4>
                    <ul className="list-details">
                      {jewelry.otherMaterials.map((m, index) => (
                        <li key={index}>
                          {m.name}x - {m.weight}g
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {jewelry.certifications?.length > 0 && (
                  <div>
                    <h4>Certifications:</h4>
                    <ul className="list-details">
                      {jewelry.certifications.map((m, index) => (
                        <li key={index}>
                          {formatCertificationName(m.name)}: report{" "}
                          {m.reportNumber} issued on {m.reportDate}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <h3 className="reviews-heading">Reviews</h3>
            <Reviews reviewedItemId={jewelryId} reviewedItemType="Jewelry" />
          </div>

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
            type={actionFeedback.type}
            show={actionFeedback.show}
            message={actionFeedback.message}
            onClose={() =>
              setActionFeedback((prev) => ({
                ...prev,
                show: false,
              }))
            }
            actions={[
              {
                label: "OK",
                onClick: () =>
                  setActionFeedback((prev) => ({
                    ...prev,
                    show: false,
                  })),
              },
              ...(actionFeedback.target
                ? [
                    {
                      label:
                        actionFeedback.target === "cart"
                          ? "View Cart"
                          : "View Wishlist",
                      onClick: () => {
                        setActionFeedback((prev) => ({
                          ...prev,
                          show: false,
                        }))
                        navigate(
                          actionFeedback.target === "cart"
                            ? "/cart"
                            : "/wishlist"
                        )
                      },
                      primary: true,
                    },
                  ]
                : []),
            ]}
          />
        </div>
      )}
    </>
  )
}

export default JewelryPage
