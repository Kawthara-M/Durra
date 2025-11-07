import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import Reviews from "../components/Reviews"
import heartIcon from "../assets/heart.png"
import User from "../services/api"
import { createOrder, updateOrder } from "../services/order"
import { useUser } from "../context/UserContext"
import { useOrder } from "../context/OrderContext"
import imageSlider from "../services/imageSliders"

import "../../public/stylesheets/customer-jewelry-page.css"

const ServicePage = () => {
  const [service, setService] = useState()
  const { serviceId } = useParams()
  const { user } = useUser()
  const { order, addJewelryToOrder, setOrderId } = useOrder()

  const [totalPrice, setTotalPrice] = useState(0)
  const [quantity, setQuantity] = useState(1)

  const {
    currentIndex: currentImageIndex,
    handleNext,
    handlePrev,
  } = imageSlider(service?.images)

  useEffect(() => {
    const getService = async () => {
      try {
        const res = await User.get(`/services/${serviceId}`)
        setService(res.data.service)
        setTotalPrice(parseFloat(res.data.service.price.toFixed(2)))
      } catch (err) {
        console.error("Failed to fetch service", err)
      }
    }
    getService()
  }, [serviceId])

  const handleAdd = async () => {
    if (!user) if (!service) return

    const newItem = {
      service: service._id,
      jewelry: [],
      totalPrice: totalPrice * (quantity || 1),
      notes: "",
    }

    try {
      let currentOrderId = order?.orderId
      if (!currentOrderId) {
        const payload = {
          jewelryOrder: [],
          serviceOrder: [newItem],
          totalPrice: newItem.totalPrice,
          collectionMethod: "delivery",
        }
        const res = await createOrder(payload)
        const finalOrderId = res._id || res.data?.order?._id
        setOrderId(finalOrderId)
        addJewelryToOrder(newItem)
        return
      }

      const updatedServiceOrder = [...(order.serviceOrder || []), newItem]
      await updateOrder(currentOrderId, {
        jewelryOrder: order.jewelryOrder,
        serviceOrder: updatedServiceOrder,
      })
      addJewelryToOrder(newItem)
    } catch (err) {
      console.error("Failed to add to cart:", err)
    }
  }

  const handleWishlist = async () => {
    if (!user) return
    if (!service) return

    const newEntry = {
      favouritedItem: service._id,
      favouritedItemType: "Service",
    }

    try {
      const res = await User.get("/wishlist")
      const wishlist = res.data.wishlist
      const exists = wishlist.items.some((it) => {
        const id =
          typeof it.favouritedItem === "object"
            ? it.favouritedItem._id
            : it.favouritedItem
        return id === service._id
      })

      let updatedItems
      if (exists) {
        updatedItems = wishlist.items.filter((it) => {
          const id =
            typeof it.favouritedItem === "object"
              ? it.favouritedItem._id
              : it.favouritedItem
          return id !== service._id
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
      {service && (
        <div className="customer-jewelry-page">
          <div className="service-page-content">
            <div className="service-images">
              {service.images?.length > 0 && (
                <div className="service-image-slider">
                  <button className="left-arrow" onClick={handlePrev}>
                    ←
                  </button>
                  <div className="image-box">
                    <img
                      src={service.images[currentImageIndex]}
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
                <h1>{service.name}</h1>
                <h2 className="service-description">Description</h2>
                <p id="jeweler-service-description">{service.description}</p>

                <div className="jeweler-service-details">
                  <h3 className="service-price">Price</h3>
                  <p id="jewelry-price">{totalPrice.toFixed(2)} BHD</p>
                </div>
              </div>

              <div className="jewelry-inputs">
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
                    title={user ? "Add to Cart" : "Sign in to Add to Wishlist"}
                    className="icon"
                    onClick={user && handleWishlist}
                  />
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="reviews-heading">Reviews</h3>
            <Reviews serviceId={serviceId} />
          </div>
        </div>
      )}
    </>
  )
}

export default ServicePage
