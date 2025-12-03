import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"

import AddNavigation from "./AddNavigation"
import FeedbackModal from "./FeedbackModal"
import imageSlider from "../services/imageSliders"
import User from "../services/api"

import "../../public/stylesheets/jewelery-add.css"

const ServicesForm = () => {
  const { serviceId } = useParams()
  const navigate = useNavigate()
  const views = ["General", "Images", "Submit"]
  const [view, setView] = useState("General")

  const initialState = {
    name: "",
    price: "",
    limitPerOrder: 1,
    description: "",
    images: [],
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
    const fetchService = async () => {
      if (!serviceId) return

      try {
        const response = await User.get(`/services/${serviceId}`)
        const data = response.data.service

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
        })
      } catch (err) {
        console.error("Failed to load service", err)
      }
    }

    fetchService()
  }, [serviceId])

  const [feedback, setFeedback] = useState({
    show: false,
    type: "success",
    message: "",
  })

  const isEdit = serviceId // it means we're editing

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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  useEffect(() => {
    if (view === "Submit") {
      const missingFields = []
      if (!formData.name) missingFields.push("Name")
      if (!formData.price) missingFields.push("Price")
      if (!formData.description) missingFields.push("Description")
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
    data.append("price", formData.price)
    data.append("limitPerOrder", formData.limitPerOrder)
    data.append("description", formData.description)

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

      if (serviceId) {
        response = await User.put(`/services/${serviceId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      } else {
        response = await User.post("/services", data, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      }

      setFeedback({
        show: true,
        type: "success",
        message: serviceId
          ? "Service updated successfully!"
          : "Service created successfully!",
      })

      if (!serviceId) {
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

  const handleGoToServices = () => {
    if (isEdit) {
      navigate(`/show-service/${serviceId}`)
    } else {
      navigate("/jeweler-services")
    }
  }

  return (
    <>
      <div className="services-add-form">
        <AddNavigation
          type="Service"
          views={views}
          activeView={view}
          setView={setView}
        />
        <div className="service-main-content">
          {view === "General" && (
            <>
              <div>
                <h2 className="view-title">General Information</h2>
                <p className="clarification">
                  The following are the core information about the Service.
                  Please Provide name, limit per order, price, and description.
                  Limit Per Order is how many jewelry pieces do you accept to
                  service per order.
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
                    placeholder="Service Name"
                  />
                </div>
                <div>
                  <div className="label-with-icon">
                    <label htmlFor="limitPerOrder">
                      <span className="required">*</span> Limit Per Order
                    </label>
                    <span
                      className="tooltip-icon"
                      title="How many jewelry can be serviced per order?"
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
                <div>
                  <label htmlFor="price">
                    <span className="required">*</span> Price (BHD)
                  </label>
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
                      title="Jewelry Service description that will show up for customers"
                    >
                      ?
                    </span>
                  </div>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Service Description"
                    rows="10"
                  />
                </div>
              </div>
            </>
          )}

          {view === "Images" && (
            <>
              <div className="images-view">
                <h2 className="view-title">Service Images</h2>{" "}
                <p className="clarification">
                  Images of services provide customer of unspoken details and
                  speak of your work. Please provide at least 1 image, and at
                  most 5.
                </p>
                {formData?.images?.length < 5 && (
                  <>
                    <input
                      type="file"
                      id="service-images"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      disabled={formData.images.length >= 5}
                      className="image-input-hidden"
                    />

                    <label htmlFor="service-images" className="image-add">
                      Add Image
                    </label>
                  </>
                )}
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

              {errors?.imagesError && (
                <p className="error">{errors.imagesError}</p>
              )}
            </>
          )}

          {view === "Submit" && (
            <div className="summary-view">
              <div className="summary-head">
                <h2>Service Summary</h2>
                <p className="clarification">
                  Review your information before submitting.
                </p>
              </div>

              <section>
                <h3>Description of {formData.name || "Service"}</h3>
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
                  label: "View Service",
                  onClick: handleGoToServices,
                  primary: true,
                },
              ]
            : [{ label: "Close", onClick: handleStay }]
        }
      />
    </>
  )
}

export default ServicesForm
