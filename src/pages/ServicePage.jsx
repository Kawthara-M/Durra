import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import Reviews from "../components/Reviews"
import FeedbackModal from "../components/FeedbackModal"
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

  const { order, addServiceToOrder, setOrderId, setFullOrder } = useOrder()

  const [totalPrice, setTotalPrice] = useState(0)

  const [showShopModal, setShowShopModal] = useState(false)
  const [shopModalMessage, setShopModalMessage] = useState("")

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
    if (!user) return
    if (!service) return

    const currentOrder = order || {}
    const currentOrderId = currentOrder.orderId

    const currentShopId =
      typeof currentOrder.shop === "object"
        ? currentOrder.shop?._id
        : currentOrder.shop

    const itemShopId =
      typeof service.shop === "object" ? service.shop?._id : service.shop

    if (currentOrderId && currentShopId && itemShopId) {
      if (String(currentShopId) !== String(itemShopId)) {
        setShopModalMessage(
          "Your cart currently contains items from another shop. To add this service, you need to clear your existing cart."
        )
        setShowShopModal(true)
        return
      }
    }

    const newItem = {
      service: service._id,
      jewelry: [{}],
      totalPrice: totalPrice,
    }

    try {
      if (!currentOrderId) {
        const payload = {
          jewelryOrder: [],
          serviceOrder: [newItem],
          totalPrice: newItem.totalPrice,
          collectionMethod: "delivery",
          notes: "",
        }

        const createdOrder = await createOrder(payload) 
        setOrderId(createdOrder._id)
        setFullOrder(createdOrder)
        addServiceToOrder(newItem)
        return
      }

      const updatedServiceOrder = [
        ...(order.serviceOrder || []).map((entry) => ({
          service:
            typeof entry.service === "object"
              ? entry.service._id
              : entry.service,
          jewelry: entry.jewelry || [],
          totalPrice: Number(entry.totalPrice || 0),
        })),
        newItem,
      ]

      const updatedOrder = await updateOrder(currentOrderId, {
        serviceOrder: updatedServiceOrder,
      })

      setFullOrder(updatedOrder)
      addServiceToOrder(newItem)
    } catch (err) {
      console.error("Failed to add to cart:", err)
    }
  }

  const handleClearCartAndAdd = async () => {
    try {
      if (!order?.orderId || !service) return

      const serviceOrder = [
        {
          service: service._id,
          jewelry: [{}],
          totalPrice: totalPrice,
        },
      ]

      const jewelryOrder = []

      const updatedOrder = await updateOrder(order.orderId, {
        jewelryOrder,
        serviceOrder,
        shop:
          typeof service.shop === "object" ? service.shop._id : service.shop,
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
                      user
                        ? "Add to Wishlist"
                        : "Sign in to Add to Wishlist"
                    }
                    className={`icon ${!user && "disabled"}`}
                    onClick={user ? handleWishlist : undefined}
                  />
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="reviews-heading">Reviews</h3>
            <Reviews reviewedItemId={serviceId} reviewedItemType="Service" />
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
    </>
  )
}

export default ServicePage
