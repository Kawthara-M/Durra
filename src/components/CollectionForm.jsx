import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import AddNavigation from "./AddNavigation"
import JewelryDropdown from "./JewelryDropDown"
import FeedbackModal from "./FeedbackModal"
import User from "../services/api"
import imageSlider from "../services/imageSliders"
import {
  calculatePreciousMaterialCost,
  calculateTotalCost,
  fetchMetalRates,
} from "../services/calculator"

import "../../public/stylesheets/collection-form.css"

const CollectionForm = () => {
  const { collectionId } = useParams()
  const navigate = useNavigate()
  const views = ["General", "Images", "Upload"]
  const [view, setView] = useState("General")
  const [jewelry, setJewelry] = useState()
  const [originPrice, setOriginPrice] = useState(0) // the difference set by jeweler
  const [calculatedTotalPrice, setCalculatedTotalPrice] = useState(0)

  const initialState = {
    name: "",
    price: "",
    limitPerOrder: 1,
    description: "",
    images: [],
    jewelry: [],
  }

  const [formData, setFormData] = useState(initialState)
  const {
    currentIndex: currentImageIndex,
    setCurrentIndex,
    handleNext,
    handlePrev,
    resetIndex,
  } = imageSlider(formData.images)

  const [errors, setErrors] = useState({})

  useEffect(() => {
    const getJewelry = async () => {
      const response = await User.get("/jewelry")
      setJewelry(response.data.jewelry)
    }
    getJewelry()
  }, [])

  useEffect(() => {
    const fetchCollection = async () => {
      if (!collectionId) return

      try {
        const response = await User.get(`/collections/${collectionId}`)
        const data = response.data.collection

        const imageObjects = data.images.map((imgUrl, idx) => ({
          src: imgUrl,
          file: null,
          name: `Image-${idx + 1}`,
          existing: true,
        }))

        setFormData({
          name: data.name || "",
          price: data.price || "",
          limitPerOrder: data.limitPerOrder || 1,
          description: data.description || "",
          images: imageObjects || [],
          jewelry: data.jewelry || [],
        })
        setOriginPrice(data.originPrice || 0)
      } catch (err) {
        console.error("Failed to load collection", err)
      }
    }

    fetchCollection()
  }, [collectionId])

  useEffect(() => {
    const updatePriceFromJewelry = async () => {
      if (!jewelry || !formData.jewelry.length) return

      try {
        const metalRates = await fetchMetalRates()

        let total = 0

        formData.jewelry.forEach((jewelryId) => {
          const item = jewelry.find((j) => j._id === jewelryId)
          if (!item) return

          const preciousCost = calculatePreciousMaterialCost(
            item.preciousMaterials,
            metalRates
          )
          const totalCost = calculateTotalCost(preciousCost, item.originPrice)

          total += totalCost
        })

        const rounded = parseFloat(total.toFixed(2))
        setCalculatedTotalPrice(rounded)

        const finalPrice = parseFloat((originPrice + rounded).toFixed(2))
        setFormData((prev) => ({
          ...prev,
          price: finalPrice,
        }))
      } catch (err) {
        console.error("Failed to calculate jewelry price", err)
      }
    }

    updatePriceFromJewelry()
  }, [formData.jewelry, jewelry])

  const [feedback, setFeedback] = useState({
    show: false,
    type: "success",
    message: "",
  })

  const isEdit = collectionId

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    const validImages = files.filter((file) => file.type.startsWith("image/"))

    if (formData.images.length + validImages.length > 5) {
      setErrors((prev) => ({
        ...prev,
        imagesError: "You can upload a maximum of 5 images.",
      }))
      return
    }

    const imageObjects = validImages.map((file) => ({
      file,
      src: URL.createObjectURL(file),
      name: file.name,
    }))
    const updatedImages = [...formData.images, ...imageObjects]

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...imageObjects],
    }))

    setCurrentIndex(updatedImages.length - 1)

    setErrors((prev) => ({
      ...prev,
      imagesError: null,
    }))

    e.target.value = ""
  }

  const handleImageRemove = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== indexToRemove),
    }))
    resetIndex()
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === "price") {
      const newPrice = parseFloat(value)
      const preciousCost = calculatedTotalPrice

      if (!isNaN(newPrice) && !isNaN(preciousCost)) {
        const newOriginPrice = newPrice - preciousCost
        setOriginPrice(newOriginPrice)

        setFormData((prev) => ({
          ...prev,
          price: newPrice,
        }))
      }
      return
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  useEffect(() => {
    if (view === "Upload") {
      const missingFields = []
      if (!formData.name) missingFields.push("Name")
      if (!formData.price) missingFields.push("Price")
      if (!formData.description) missingFields.push("Description")
      if (formData.jewelry.length === 0) missingFields.push("Jewelry")
      if (formData.images.length === 0) missingFields.push("Images")

      if (missingFields.length > 0) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          uploadError: `Please fill out all required fields: ${missingFields.join(
            ", "
          )}`,
        }))
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          uploadError: null,
        }))
      }
    }
  }, [view, formData])

  const handleSubmit = async () => {
    if (errors.uploadError) return

    const data = new FormData()

    data.append("name", formData.name)
    data.append("limitPerOrder", formData.limitPerOrder)
    data.append("description", formData.description)
    data.append("jewelry", JSON.stringify(formData.jewelry))

    if (originPrice !== null) {
      data.append("originPrice", originPrice)
    }

    const existingImages = formData.images
      .filter((img) => !img.file && img.src)
      .map((img) => img.src)

    const newImages = formData.images
      .filter((img) => img.file)
      .map((img) => img.file)

    data.append("existingImages", JSON.stringify(existingImages))

    newImages.forEach((file) => {
      data.append("images", file)
    })

    try {
      let response

      if (collectionId) {
        response = await User.put(`/collections/${collectionId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      } else {
        console.log(data)
        response = await User.post("/collections", data, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      }

      setFeedback({
        show: true,
        type: "success",
        message: collectionId
          ? "Collection updated successfully!"
          : "Collection created successfully!",
      })

      if (!collectionId) {
        setFormData(initialState)
      }
    } catch (err) {
      console.error("Submission error:", err)

      let errMsg = "Unexpected error occurred."
      if (err.response) {
        errMsg = err.response.data.error || errMsg
      }

      setFeedback({
        show: true,
        type: "error",
        message: errMsg,
      })
    }
  }

  const handleStay = () => {
    setFeedback((prev) => ({
      ...prev,
      show: false,
    }))
  }

  const handleGoToCollections = () => {
    if (isEdit) {
      navigate(`/show-collection/${collectionId}`)
    } else {
      navigate("/jeweler-collections")
    }
  }

  return (
    <>
      <div className="collection-add-form">
        <AddNavigation views={views} activeView={view} setView={setView} />
        <div className="service-main-content">
          {view === "General" && (
            <>
              <div>
                <h2 className="view-title">General Information</h2>
                <p className="clarification">
                  The following are the core information about this jewelry
                  collection.
                </p>
              </div>
              <div className="service-form">
                <div>
                  <label htmlFor="name">
                    <span className="required">*</span> Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Collection Name"
                  />
                </div>
                <div>
                  <div className="label-with-icon">
                    <label htmlFor="limitPerOrder">
                      <span className="required">*</span> Limit Per Order
                    </label>
                    <span
                      className="tooltip-icon"
                      title="How many of this collection can be purchased in one order?"
                    >
                      ?
                    </span>
                  </div>
                  <input
                    type="number"
                    name="limitPerOrder"
                    min="1"
                    value={formData.limitPerOrder}
                    onChange={handleChange}
                  />
                </div>

                {jewelry && (
                  <div>
                    <label htmlFor="jewelry"></label>
                    <JewelryDropdown
                      jewelry={jewelry}
                      formData={formData}
                      setFormData={setFormData}
                    />
                  </div>
                )}
                <div>
                  <div className="label-with-icon">
                    <label htmlFor="price">
                      <span className="required">*</span> Price
                    </label>
                    <span
                      className="tooltip-icon"
                      title="The initial price of this collection, it will constantly be affected by the karat cost if it includes any precious metals"
                    >
                      ?
                    </span>
                  </div>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <div className="label-with-icon">
                    <label htmlFor="description">Description</label>
                    <span
                      className="tooltip-icon"
                      title="Collection description that will show up for customers"
                    >
                      ?
                    </span>
                  </div>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Provide a description"
                    rows="10"
                  />
                </div>
              </div>
            </>
          )}

          {view === "Images" && (
            <>
              <div className="images-view">
                <h2 className="view-title">Images</h2>{" "}
                <p className="clarification">
                  Images of collection provide customer of unspoken details and
                  speak of your work. Please provide at least 1 image, and at
                  most 5.
                </p>
                {formData.images.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleImageRemove(currentImageIndex)}
                      className="delete-image"
                    >
                      &times;
                    </button>
                    <div className="jewelry-image-container">
                      <img
                        src={formData.images[currentImageIndex]?.src}
                        alt={`${
                          formData.name
                            ? formData.name + "Image"
                            : "Jewelry Image"
                        } `}
                        className="slider-image"
                      />
                      <div className="jewelry-image-overlay" />

                      <button
                        className="image-nav-button nav-left"
                        onClick={handlePrev}
                      >
                        &#8592;
                      </button>

                      <button
                        className="image-nav-button nav-right"
                        onClick={handleNext}
                      >
                        &#8594;
                      </button>
                    </div>
                  </>
                )}
              </div>
              {formData?.images?.length < 5 && (
                <label className="image-add-label" title="Add Image">
                  +
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    disabled={formData.images.length >= 5}
                    className="image-add"
                  />
                </label>
              )}
              {errors?.imagesError && (
                <p className="error">{errors.imagesError}</p>
              )}
            </>
          )}

          {view === "Upload" && (
            <div className="summary-view">
              <div className="summary-head">
                <h2>Collection Summary</h2>
                <p className="clarification">
                  Review your information before submitting.
                </p>
              </div>

              <section>
                <h3>Description of {formData.name || "Collection"}</h3>
                <p>{formData.description || "No description provided."}</p>
              </section>

              <section className="cost-section">
                <h3>Price</h3>
                <input
                  type="number"
                  name="price"
                  value={formData.price || 0}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </section>
              <div className="jeweler-submit">
                {" "}
                <div className="errors-in-summary">
                  {errors.uploadError && (
                    <p className="error">{errors.uploadError}</p>
                  )}
                </div>
                <button onClick={handleSubmit} disabled={!!errors.uploadError}>
                  Submit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <FeedbackModal
        show={feedback.show}
        type={feedback.type}
        message={feedback.message}
        onClose={handleStay}
        actions={
          feedback.type === "success"
            ? [
                {
                  label: isEdit ? "Edit Again" : "Add Another",
                  onClick: handleStay,
                },
                {
                  label: "View Collection",
                  onClick: handleGoToCollections,
                  primary: true,
                },
              ]
            : [{ label: "Close", onClick: handleStay }]
        }
      />
    </>
  )
}

export default CollectionForm
