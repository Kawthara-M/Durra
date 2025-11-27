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
  const { order, addJewelryToOrder, setOrderId, setFullOrder, resetOrder } =
    useOrder()

  const [totalPrice, setTotalPrice] = useState(0)
  const [preciousMaterialCost, setPreciousMaterialCost] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const [metalRates, setMetalRates] = useState()
  const [quantity, setQuantity] = useState(1)
  const [size, setSize] = useState("")
  const [showComparison, setShowComparison] = useState(false)
  const [showShopModal, setShowShopModal] = useState(false)
  const [shopModalMessage, setShopModalMessage] = useState("")

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
        setPreciousMaterialCost(parseFloat(preciousCost.toFixed(2)))
        setTotalPrice(parseFloat(total.toFixed(2)))
      } catch (err) {
        console.error("Failed to fetch metal rates or calculate price", err)
      }
    }
    getRates()
  }, [jewelry])

  const handleChange = (e) => setQuantity(parseInt(e.target.value))

  const handleAdd = async () => {
    if (!user) return
    if (!jewelry) return

    const currentOrder = order || {}
    const currentOrderId = currentOrder.orderId

    const currentShopId =
      typeof currentOrder.shop === "object"
        ? currentOrder.shop?._id
        : currentOrder.shop

    const itemShopId =
      typeof jewelry.shop === "object" ? jewelry.shop?._id : jewelry.shop

    // Prevent mixing items from different shops
    if (currentOrderId && currentShopId && itemShopId) {
      if (String(currentShopId) !== String(itemShopId)) {
        setShopModalMessage(
          "Your cart currently contains items from another shop. To add this item, you need to clear your existing cart."
        )
        setShowShopModal(true)
        return
      }
    }

    const quantityToUse = quantity || 1
    const newItem = {
      item: jewelry._id,
      itemModel: "Jewelry",
      quantity: quantityToUse,
      totalPrice: totalPrice * quantityToUse,
      size: size || undefined,
      notes: "",
    }

    try {
      // 🔹 NO existing order → create one (and send shop!)
      if (!currentOrderId) {
        const payload = {
          jewelryOrder: [newItem],
          serviceOrder: [],
          totalPrice: newItem.totalPrice,
          collectionMethod: "delivery",
          notes: "",
          shop: itemShopId || null, // ⭐ important to tie order to this shop
        }

        const createdOrder = await createOrder(payload) // returns order object
        const orderDoc = createdOrder.order || createdOrder

        setOrderId(orderDoc._id)
        setFullOrder(orderDoc)
        addJewelryToOrder({
          item: newItem.item,
          itemModel: newItem.itemModel,
          quantity: newItem.quantity,
          totalPrice: newItem.totalPrice,
        })
        return
      }

      // 🔹 Existing order → update jewelryOrder
      const updatedJewelryOrder = [
        ...(order.jewelryOrder || []).map((entry) => ({
          item: typeof entry.item === "object" ? entry.item._id : entry.item,
          itemModel: entry.itemModel,
          quantity: entry.quantity ?? 1,
          totalPrice: Number(entry.totalPrice ?? 0),
          size: entry.size || undefined,
        })),
        {
          item: jewelry._id,
          itemModel: "Jewelry",
          quantity: quantityToUse,
          totalPrice: totalPrice * quantityToUse,
          size: size || undefined,
        },
      ]

      const updatedOrder = await updateOrder(currentOrderId, {
        jewelryOrder: updatedJewelryOrder,
      })

      setFullOrder(updatedOrder)
      addJewelryToOrder({
        item: newItem.item,
        itemModel: newItem.itemModel,
        quantity: newItem.quantity,
        totalPrice: newItem.totalPrice,
      })
    } catch (err) {
      console.error("Failed to add to cart:", err)
    }
  }

  const handleClearCartAndAdd = async () => {
    try {
      if (!order?.orderId || !jewelry) return

      const qty = quantity || 1
      const total = totalPrice * qty

      const jewelryOrder = [
        {
          item: jewelry._id,
          itemModel: "Jewelry",
          quantity: qty,
          totalPrice: total,
          size: size || undefined,
        },
      ]

      const serviceOrder = []

      const updatedOrder = await updateOrder(order.orderId, {
        jewelryOrder,
        serviceOrder,
        shop:
          typeof jewelry.shop === "object" ? jewelry.shop._id : jewelry.shop,
      })

      setFullOrder(updatedOrder)
      setOrderId(updatedOrder._id)

      setShowShopModal(false)
    } catch (err) {
      console.error("Failed to clear cart and add:", err)
      setShowShopModal(false)
    }
  }

  const handleWishlist = async () => {
    if (!user) return
    if (!jewelry) return

    const newEntry = {
      favouritedItem: jewelry._id,
      favouritedItemType: "Jewelry",
    }

    try {
      const res = await User.get("/wishlist")
      const wishlist = res.data.wishlist
      const exists = wishlist.items.some((it) => {
        const id =
          typeof it.favouritedItem === "object"
            ? it.favouritedItem._id
            : it.favouritedItem
        return id === jewelry._id
      })

      let updatedItems
      if (exists) {
        updatedItems = wishlist.items.filter((it) => {
          const id =
            typeof it.favouritedItem === "object"
              ? it.favouritedItem._id
              : it.favouritedItem
          return id !== jewelry._id
        })
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
    } catch (err) {
      if (err.response?.status === 404) {
        await User.post("/wishlist", { items: [newEntry] })
        window.dispatchEvent(new Event("wishlist-updated"))
      } else {
        console.error("Failed to update wishlist:", err)
      }
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
                <h1>{jewelry.name}</h1>
                <h2 className="service-description">Description</h2>
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

                <div className="jeweler-service-details">
                  <h3 className="service-price">Price</h3>
                  <p id="jewelry-price">{totalPrice.toFixed(2)} BHD</p>
                </div>
              </div>

              <div className="jewelry-overview-wrapper">
                <div className="jewelry-inputs">
                  <div className="jewelry-inputs-select-and-size">
                    {jewelry.type?.toLowerCase() === "ring" && (
                      <select
                        className="ring-size-selector"
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
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
                      name="quantity"
                      onChange={handleChange}
                      value={quantity}
                      min="1"
                      max={jewelry.limitPerOrder}
                      placeholder={`Quantity${
                        jewelry.limitPerOrder != 1
                          ? `1 ....` + jewelry.limitPerOrder
                          : ""
                      }`}
                    />{" "}
                  </div>
                  <span className="add-or-wishlist">
                    <button
                      onClick={user ? handleAdd : undefined}
                      disabled={!user}
                      title={user ? "Add to Cart" : "Sign in to Add"}
                    >
                      Add to Cart
                    </button>

                    <img
                      src={heartIcon}
                      alt="Wishlist"
                      title={
                        user ? "Add to Wishlist" : "Sign in to Add to Wishlist"
                      }
                      className={`icon ${!user && "disabled"}`}
                      disabled={!user}
                      onClick={user && handleWishlist}
                    />
                    <img
                      src={comparsionIcon}
                      alt="Comparsion"
                      title={
                        user
                          ? "Compare with other pieces"
                          : "Sign in to Compare this piece with other pieces"
                      }
                      className={`icon ${!user && "disabled"}`}
                      onClick={() => setShowComparison(true)}
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
                          {diamond.weight}g<br />
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
              className="prevent-different-shops-modal"
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
          )}
        </div>
      )}
    </>
  )
}

export default JewelryPage
