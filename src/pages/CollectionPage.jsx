import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import User from "../services/api"
import Reviews from "../components/Reviews"
import heartIcon from "../assets/heart.png"
import imageSlider from "../services/imageSliders"
import { useUser } from "../context/UserContext"
import { useOrder } from "../context/OrderContext"
import { createOrder, updateOrder } from "../services/order"
import { calculateCollectionPrice } from "../services/calculator"
import { fetchMetalRates } from "../services/calculator"

import "../../public/stylesheets/customer-jewelry-page.css"

const CollectionPage = () => {
  const { collectionId } = useParams()
  const { user } = useUser()
  const { order, addJewelryToOrder, setOrderId } = useOrder()
  const [metalRates, setMetalRates] = useState()

  const [collection, setCollection] = useState()
  const [totalPrice, setTotalPrice] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isExpanded, setIsExpanded] = useState(false)
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
        if (price !== null) setTotalPrice(price.toFixed(2))
      } catch (err) {
        console.error("Failed to fetch collection price", err)
      }
    }
    getRates()
  }, [collection])

  const handleChange = (e) => setQuantity(parseInt(e.target.value))

  const handleAdd = async () => {
    if (!user) return
    if (!collection) return

    const newItem = {
      item: collection._id,
      itemModel: "Collection",
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
      console.error("Failed to add collection to cart:", err)
    }
  }

  const handleWishlist = async () => {
    if (!user) return
    if (!collection) return

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
      {collection && (
        <div className="customer-jewelry-page">
          <div className="service-page-content">
            <div className="service-images">
              {collection.jewelry?.[0]?.images?.length > 0 && (
                <div className="service-image-slider">
                  <button className="left-arrow" onClick={handlePrev}>
                    ←
                  </button>
                  <div className="image-box">
                    <img
                      src={collection.jewelry[0].images[currentImageIndex]}
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
                <h2 className="service-description">Description</h2>
                <p id="jeweler-service-description">{collection.description}</p>
                <div className="jeweler-service-details">
                  <h3 className="service-price">Price</h3>
                  <p id="jewelry-price">{totalPrice} BHD</p>
                </div>
              </div>

              <div className="jewelry-inputs">
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
                      user ? "Add to Wishlist" : "Sign in to Add to Wishlist"
                    }
                    className="icon"
                    onClick={user && handleWishlist}
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
            <Reviews collectionId={collectionId} />
          </div>
        </div>
      )}
    </>
  )
}

export default CollectionPage
