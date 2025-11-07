import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"

import Reviews from "../components/Reviews"
import FeedbackModal from "../components/FeedbackModal"

import imageSlider from "../services/imageSliders"
import heartIcon from "../assets/heart.png"
import User from "../services/api"
import {
  fetchMetalRates,
  calculatePreciousMaterialCost,
  calculateTotalCost,
} from "../services/calculator"
import { createOrder, updateOrder } from "../services/order"
import { useUser } from "../context/UserContext"
import { useOrder } from "../context/OrderContext"

import "../../public/stylesheets/customer-jewelry-page.css"

const JewelryPage = () => {
  const [jewelry, setJewelry] = useState()
  const { jewelryId } = useParams()
  const { user } = useUser()
  const { order, addJewelryToOrder, setOrderId } = useOrder()

  const [totalPrice, setTotalPrice] = useState(0)
  const [preciousMaterialCost, setPreciousMaterialCost] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const [metalRates, setMetalRates] = useState()
  const [quantity, setQuantity] = useState(1)

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

    const newItem = {
      item: jewelry._id,
      itemModel: "Jewelry",
      quantity: quantity || 1,
      totalPrice: totalPrice * (quantity || 1),
      notes: "",
    }

    try {
      let currentOrderId = order?.orderId
      if (!currentOrderId) {
        const payload = {
          jewelryOrder: [newItem],
          serviceOrder: [],
          totalPrice: newItem.totalPrice,
          collectionMethod: "delivery",
        }
        const res = await createOrder(payload)
        const finalOrderId = res._id || res.data?.order?._id
        setOrderId(finalOrderId)
        addJewelryToOrder(newItem)
        return
      }

      const updatedJewelryOrder = [...(order.jewelryOrder || []), newItem]
      await updateOrder(currentOrderId, {
        jewelryOrder: updatedJewelryOrder,
        serviceOrder: order.serviceOrder,
      })
      addJewelryToOrder(newItem)
    } catch (err) {
      console.error("Failed to add to cart:", err)
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

                <div className="jeweler-service-details">
                  <h3 className="service-price">Price</h3>
                  <p id="jewelry-price">{totalPrice.toFixed(2)} BHD</p>
                </div>
              </div>

              <div className="jewelry-overview-wrapper">
                <div className="jewelry-inputs">
                  <input
                    type="number"
                    name="quantity"
                    onChange={handleChange}
                    value={quantity}
                    min="1"
                    max={jewelry.limitPerOrder}
                    placeholder="1"
                  />
                  <span className="add-or-wishlist">
                    <button
                      onClick={user && handleAdd}
                      disabled={!user}
                      title={user ? "Add to Cart" : "Sign in to Add"}
                    >
                      Add to Cart
                    </button>
                    <img
                      src={heartIcon}
                      alt="Wishlist"
                      title={
                        user
                          ? (title = "Add to Wishlist")
                          : "Sign in to Add to Wishlist"
                      }
                      className="icon"
                      onClick={user && handleWishlist}
                    />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Jewelry Details */}
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
                          {m.name} - {m.reportNumber} - {m.reportDate}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Reviews */}
          <div>
            <h3 className="reviews-heading">Reviews</h3>
            <Reviews jewelryId={jewelryId} />
          </div>
        </div>
      )}
    </>
  )
}

export default JewelryPage
