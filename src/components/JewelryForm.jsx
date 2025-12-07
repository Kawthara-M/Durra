import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import AddNavigation from "./AddNavigation"
import SummaryView from "./SummaryView"
import FeedbackModal from "./FeedbackModal"
import {
  fetchMetalRates,
  calculatePreciousMaterialCost,
} from "../services/calculator"

import imageSlider from "../services/imageSliders"
import User from "../services/api"
import deleteIcon from "../assets/delete.png"
import "../../public/stylesheets/jewelery-add.css"

const JewelryForm = () => {
  const { jewelryId } = useParams()
  const navigate = useNavigate()
  const views = [
    "General",
    "Images",
    "Precious Metals",
    "Pearls",
    "Diamonds",
    "Other Materials",
    "Certifications",
    "Submit",
  ]

  const karatOptionsByMaterial = {
    gold: [
      { value: "24", label: "24K" },
      { value: "22", label: "22K" },
      { value: "21", label: "21K" },
      { value: "18", label: "18K" },
      { value: "14", label: "14K" },
    ],
    silver: [
      { value: "925", label: "925" },
      { value: "830", label: "830" },
      { value: "950", label: "950" },
    ],
    platinium: [{ value: "950", label: "950" }],
  }
  const initialFormData = {
    name: "",
    type: "",
    mainMaterial: "",
    totalWeight: "",
    originPrice: "",
    totalPrice: "",
    productionCost: "",
    limitPerOrder: 0,
    description: "",
    images: [],
    preciousMaterials: [],
    pearls: [],
    diamonds: [],
    otherMaterials: [],
    certifications: [],
  }

  const [formData, setFormData] = useState(initialFormData)
  const {
    currentIndex: currentImageIndex,
    setCurrentIndex,
    handleNext,
    handlePrev,
  } = imageSlider(formData.images)
  const [errors, setErrors] = useState({})
  const [view, setView] = useState("General")
  const [metalRates, setMetalRates] = useState({})
  const isEdit = jewelryId ? true : false

  useEffect(() => {
    const fetchJewelry = async () => {
      try {
        const response = await User.get(`/jewelry/${jewelryId}`)
        console.log(response)
        const data = response.data.jewelry

        const transformedData = {
          name: data.name || "",
          type: data.type || "",
          mainMaterial: data.mainMaterial || "",
          totalWeight: data.totalWeight || "",
          originPrice: data.originPrice || "",
          totalPrice: data.totalPrice || "",
          productionCost: data.productionCost || "",
          limitPerOrder: data.limitPerOrder || 0,
          description: data.description || "",
          images: (data.images || []).map((url, idx) => ({
            src: url,
            name: `Image-${idx + 1}`,
            file: null,
          })),
          preciousMaterials: data.preciousMaterials || [],
          pearls: data.pearls || [],
          diamonds: data.diamonds || [],
          otherMaterials: data.otherMaterials || [],
          certifications: data.certifications || [],
        }

        setFormData(transformedData)
      } catch (error) {
        setShowModal(true)
        setModalMessage("Failed to load jewelry for editing.")
        setModalActions([
          {
            label: "Go Back",
            onClick: () => navigate("/jeweler-jewelry"),
          },
        ])
      }
    }

    if (isEdit) {
      fetchJewelry()
    }
  }, [isEdit, jewelryId])

  const addEntry = (section, newEntry) => {
    setFormData((prev) => {
      const updatedSection = [...prev[section], newEntry]

      if (
        ["preciousMaterials", "pearls", "diamonds", "otherMaterials"].includes(
          section
        )
      ) {
        validateMaterialWeight(section, updatedSection)
      }

      return {
        ...prev,
        [section]: updatedSection,
      }
    })
  }

  const removeEntry = (section, index) => {
    setFormData((prev) => {
      const updatedSection = [...prev[section]].filter((_, i) => i !== index)

      if (
        ["preciousMaterials", "pearls", "diamonds", "otherMaterials"].includes(
          section
        )
      ) {
        validateMaterialWeight(section, updatedSection)
      }

      return {
        ...prev,
        [section]: updatedSection,
      }
    })
  }

  // image handling
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)

    if (formData.images.length + files.length > 5) {
      setErrors((prev) => ({
        ...prev,
        images: "Maximum 5 images allowed.",
      }))
      return
    }

    const validImages = files.filter((file) => file.type.startsWith("image/"))
    const imageObjects = validImages.map((file) => ({
      file,
      src: URL.createObjectURL(file), // for preview
      name: file.name,
    }))

    if (imageObjects.length === 0) {
      return
    }
    const updatedImages = [...formData.images, ...imageObjects]

    setFormData((prev) => {
      const updatedImages = [...prev.images, ...imageObjects]

      setCurrentIndex(updatedImages.length - 1)

      return {
        ...prev,
        images: updatedImages,
      }
    })

    e.target.value = ""
  }

  const handleImageRemove = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== indexToRemove),
    }))
  }

  const validateMaterialWeight = (section, updatedList) => {
    console.log("Validating weight for:", section, updatedList)
    const totalWeightLimit = parseFloat(formData.totalWeight || 0)

    const totalMaterialWeight = updatedList.reduce((acc, item) => {
      const weight = parseFloat(item.weight || 0)
      const number = parseFloat(item.number || 1)
      return acc + weight * number
    }, 0)

    const errorKey = `${section}`

    setErrors((prevErrors) => ({
      ...prevErrors,
      [errorKey]:
        totalMaterialWeight > totalWeightLimit
          ? `Total ${section
              .replace(/([A-Z])/g, " $1")
              .toLowerCase()} weight (${totalMaterialWeight.toFixed(
              2
            )}g) exceeds total jewelry weight (${totalWeightLimit}g).`
          : null,
    }))
  }

  const handleChange = (e, section, index) => {
    const { name, value } = e.target

    if (section && index !== null && index !== undefined) {
      setFormData((prev) => {
        const updatedSection = [...prev[section]]
        const updatedItem = { ...updatedSection[index], [name]: value }

        if (section === "preciousMaterials" && name === "name") {
          const karatOptions = karatOptionsByMaterial[value] || []
          updatedItem.karat =
            karatOptions.length > 0 ? karatOptions[0].value : ""
        }

        updatedSection[index] = updatedItem

        if (
          [
            "preciousMaterials",
            "pearls",
            "diamonds",
            "otherMaterials",
          ].includes(section)
        ) {
          validateMaterialWeight(section, updatedSection)
        }

        const requiredFieldsBySection = {
          preciousMaterials: ["name", "karat", "weight"],
          pearls: ["type", "shape", "color", "number", "weight"],
          diamonds: ["type", "clarity", "number", "weight"],
          otherMaterials: ["name", "weight"],
          certifications: ["name", "reportDate", "reportNumber"],
        }

        const requiredFields = requiredFieldsBySection[section] || []
        const isEntryValid = requiredFields.every(
          (field) => updatedItem[field] !== "" && updatedItem[field] !== null
        )

        const errorKey = `${section}Fields`
        setErrors((prevErrors) => ({
          ...prevErrors,
          [errorKey]: isEntryValid ? null : prevErrors[errorKey],
        }))

        return {
          ...prev,
          [section]: updatedSection,
        }
      })
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))

      const topLevelFieldErrorKeys = {
        name: "generalError",
        type: "generalError",
        mainMaterial: "generalError",
        totalWeight: "generalError",
        productionCost: "generalError",
      }

      const errorKey = topLevelFieldErrorKeys[name]
      if (errorKey) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [errorKey]: null,
        }))
      }
    }
  }

  const [showModal, setShowModal] = useState(false)
  const [modalActions, setModalActions] = useState([])
  const [modalMessage, setModalMessage] = useState("")
  const [modalType, setModalType] = useState("success")

  const validateForm = (form) => {
    const newErrors = {}

    if (!form.name) newErrors.name = "Name is required."
    if (!form.type) newErrors.type = "Type is required."
    if (!form.mainMaterial)
      newErrors.mainMaterial = "Main material is required."
    if (!form.totalWeight) newErrors.totalWeight = "Total weight is required."
    if (!form.productionCost)
      newErrors.productionCost = "Production cost is required."
    if (form.images.length === 0)
      newErrors.images = "At least one image is required."

    const hasNoMaterials =
      form.preciousMaterials.length === 0 &&
      form.pearls.length === 0 &&
      form.diamonds.length === 0 &&
      form.otherMaterials.length === 0

    if (hasNoMaterials) {
      newErrors.materials =
        "Add at least one material (precious, pearl, diamond, or other)."
    }

    if (form.preciousMaterials.length > 0) {
      const allValid = form.preciousMaterials.every(
        (m) => m.name && m.karat && m.weight
      )
      if (!allValid)
        newErrors.preciousMaterials =
          "Fill all required fields in precious metals."
    }

    if (form.pearls.length > 0) {
      const allValid = form.pearls.every(
        (p) => p.type && p.shape && p.color && p.number && p.weight
      )
      if (!allValid) newErrors.pearls = "Fill all required fields in pearls."
    }

    if (form.diamonds.length > 0) {
      const allValid = form.diamonds.every(
        (d) => d.type && d.clarity && d.number && d.weight
      )
      if (!allValid)
        newErrors.diamonds = "Fill all required fields in diamonds."
    }

    if (form.otherMaterials.length > 0) {
      const allValid = form.otherMaterials.every((m) => m.name && m.weight)
      if (!allValid)
        newErrors.otherMaterials = "Fill name and weight in other materials."
    }

    if (form.certifications.length > 0) {
      const allValid = form.certifications.every(
        (c) => c.name && c.reportDate && c.reportNumber
      )
      if (!allValid)
        newErrors.certifications = "Complete all certification fields."
    }

    const totalWeightLimit = parseFloat(form.totalWeight || 0)

    const sectionsToValidate = [
      "preciousMaterials",
      "pearls",
      "diamonds",
      "otherMaterials",
    ]

    sectionsToValidate.forEach((section) => {
      const totalMaterialWeight = form[section].reduce((acc, item) => {
        const weight = parseFloat(item.weight || 0)
        const number = parseFloat(item.number || 1)
        return acc + weight * number
      }, 0)

      if (totalMaterialWeight > totalWeightLimit) {
        newErrors[section] = `Total ${section
          .replace(/([A-Z])/g, " $1")
          .toLowerCase()} weight (${totalMaterialWeight.toFixed(
          2
        )}g) exceeds total allowed weight (${totalWeightLimit}g).`
      }
    })

    return newErrors
  }

  useEffect(() => {
    if (view === "Submit") {
      const validationErrors = validateForm(formData)

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        console.log(validationErrors)
        return
      } else {
        setErrors(null)
      }
    }
  }, [view])

  const handleSubmit = async () => {
    // validation
    const validationErrors = validateForm(formData)

    if (Object.keys(validationErrors).length > 0) {
      console.log("here")
      setErrors(validationErrors)
      return
    }

    try {
      const rates = await fetchMetalRates()

      setMetalRates(rates)

      const totalPrice = parseFloat(formData.totalPrice || 0)
      const preciousMaterialCost = calculatePreciousMaterialCost(
        formData.preciousMaterials,
        metalRates
      )

      const originPrice = totalPrice - preciousMaterialCost

      const finalFormData = {
        ...formData,
        originPrice: originPrice.toFixed(2),
      }

      const data = new FormData()

      data.append("name", formData.name)
      data.append("type", formData.type)
      data.append("mainMaterial", formData.mainMaterial)
      data.append("totalWeight", formData.totalWeight)
      data.append("originPrice", finalFormData.originPrice)
      data.append("productionCost", formData.productionCost)
      data.append("limitPerOrder", formData.limitPerOrder)
      data.append("description", formData.description)

      data.append(
        "preciousMaterials",
        JSON.stringify(formData.preciousMaterials)
      )
      data.append("pearls", JSON.stringify(formData.pearls))
      data.append("diamonds", JSON.stringify(formData.diamonds))
      data.append("otherMaterials", JSON.stringify(formData.otherMaterials))
      data.append("certifications", JSON.stringify(formData.certifications))

      const existingImages = formData.images
        .filter((img) => !img.file && img.src)
        .map((img) => img.src)

      data.append("existingImages", JSON.stringify(existingImages))

      formData.images
        .filter((img) => img.file)
        .forEach((imageObj) => {
          data.append("images", imageObj.file)
        })

      console.log("Submitting to backend...", data)

      const response = isEdit
        ? await User.put(`/jewelry/${jewelryId}`, data, {
            headers: { "Content-Type": "multipart/form-data" },
          })
        : await User.post(`/jewelry/`, data, {
            headers: { "Content-Type": "multipart/form-data" },
          })

      setShowModal(true)
      setModalMessage(
        isEdit
          ? "Jewelry updated successfully!"
          : "Jewelry created successfully!"
      )
      setModalActions(
        isEdit
          ? [
              {
                label: "Edit Again",
                onClick: () => setShowModal(false),
              },
              {
                label: "Show Jewelry",
                onClick: () => navigate(`/show-jewelry/${jewelryId}`),
                primary: true,
              },
            ]
          : [
              {
                label: "Add Another",
                onClick: () => {
                  setFormData(initialFormData)
                  setErrors({})
                  setShowModal(false)
                },
              },
              {
                label: "View Jewelry List",
                onClick: () => navigate("/jeweler-jewelry"),
              },
            ]
      )
    } catch (error) {
      setModalType("error")
      setShowModal(true)
      setModalMessage(
        error.response?.data?.error ||
          "Failed to create jewelry. Please try again."
      )
      setModalActions([])
    }
  }

  return (
    <>
      <div className="jewelry-add-form">
        <AddNavigation
          type="Jewelry"
          views={views}
          setView={setView}
          activeView={view}
        />
        <div className="main-content">
          {view === "General" ? (
            <>
              <div>
                <h2 className="view-title">General Information</h2>{" "}
                <p className="clarification">
                  The following are the core information about this jewelry
                  piece. Provide them and then provide the other information
                  relative to your piece, you may skip sections that do not
                  apply.
                </p>
              </div>
              <div className="general-inputs">
                <div className="label-and-input">
                  <label htmlFor="name">
                    <span className="required">*</span> Name{" "}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Jewelry Name"
                    required
                  />
                </div>

                <div className="label-and-input">
                  <label htmlFor="type">
                    <span className="required">*</span> Type
                  </label>
                  <input
                    type="text"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    placeholder="Necklace, bracelet, earring, ring..."
                    required
                  />
                </div>

                <div className="label-and-input">
                  <label htmlFor="mainMaterial">
                    <span className="required">*</span> Main Material
                  </label>
                  <input
                    type="text"
                    name="mainMaterial"
                    value={formData.mainMaterial}
                    onChange={handleChange}
                    placeholder="Gold, silver..."
                    required
                  />
                </div>

                <div className="label-and-input">
                  <label htmlFor="totalWeight">
                    <span className="required">*</span> Total Weight (in grams)
                  </label>
                  <input
                    type="number"
                    name="totalWeight"
                    value={formData.totalWeight}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    required
                  />
                </div>

                <div className="label-and-input">
                  <label htmlFor="productionCost">
                    Production Cost (in BHD)
                  </label>
                  <input
                    type="number"
                    name="productionCost"
                    value={formData.productionCost}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0.00"
                    required
                  />
                </div>

                <div className="label-and-input">
                  <div className="label-with-icon">
                    <label htmlFor="limitPerOrder">Limit Per Order</label>
                    <span
                      className={`tooltip-icon`}
                      title="How many of this item do you accept per each order?."
                    >
                      ?
                    </span>
                  </div>
                  <input
                    type="number"
                    name="limitPerOrder"
                    min="0"
                    value={formData.limitPerOrder}
                    onChange={handleChange}
                  />
                </div>

                <div className="label-and-input">
                  <div className="label-with-icon">
                    <label htmlFor="description">Description</label>
                    <span
                      className={`tooltip-icon`}
                      title="Jewelry piece description that will show up for customers"
                    >
                      ?
                    </span>
                  </div>
                  <textarea
                    name="description"
                    placeholder="Jewelry Description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="8"
                    maxLength={1000}
                  />
                </div>
              </div>
            </>
          ) : null}
          {view === "Precious Metals" ? (
            <>
              <div className="precious-material-form">
                <h2 className="view-title">Precious Metals</h2>{" "}
                <p className="clarification">
                  According to the{" "}
                  <span className="bold">
                    Ministry of Industry and Commerce
                  </span>
                  , Gold, Silver, and Platinium are the Precious Metals in the
                  Kingdom of Bahrain. Please specify the precious metals
                  composing this jewelry piece along with its karat and weight.
                  If the jewelry piece contains no precious metals, simply leave
                  this section empty.{" "}
                </p>
                {formData?.preciousMaterials?.length > 0 &&
                  formData.preciousMaterials.map((entry, index) => (
                    <div key={index} className="material-group">
                      <h4>Precious Metal {index + 1}</h4>
                      <div className="selection">
                        <div className="label-and-selector">
                          <label htmlFor="name">
                            <span className="required">*</span> Metal{" "}
                          </label>

                          <select
                            name="name"
                            value={entry.name}
                            onChange={(e) =>
                              handleChange(e, "preciousMaterials", index)
                            }
                            className="material-selector"
                          >
                            <option value="gold">Gold</option>
                            <option value="silver">Silver</option>
                            <option value="platinium">Platinium</option>
                          </select>
                        </div>
                        <div className="label-and-selector">
                          <label htmlFor="karat">
                            <span className="required">*</span> Karat{" "}
                          </label>
                          <select
                            name="karat"
                            value={entry.karat}
                            onChange={(e) =>
                              handleChange(e, "preciousMaterials", index)
                            }
                            className="karat-selector"
                          >
                            {karatOptionsByMaterial[entry.name].map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="label-and-selector">
                          {" "}
                          <label htmlFor="weight">
                            <span className="required">*</span> Weight
                          </label>{" "}
                          <input
                            type="number"
                            name="weight"
                            placeholder="0.00 (grams)"
                            value={entry.weight}
                            onChange={(e) =>
                              handleChange(e, "preciousMaterials", index)
                            }
                            min="0"
                            max={formData.totalWeight}
                            step="0.01"
                            className="material-weight"
                          />{" "}
                          g
                        </div>
                        <button
                          type="button"
                          className="icon-btn delete-material"
                          onClick={() =>
                            removeEntry("preciousMaterials", index)
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                <button
                  type="button"
                  className="add"
                  onClick={() =>
                    addEntry("preciousMaterials", {
                      name: "gold",
                      karat: "24",
                      weight: "",
                    })
                  }
                >
                  +
                </button>
              </div>
            </>
          ) : null}
          {view === "Pearls" ? (
            <>
              <div className="pearls-form">
                <h2 className="view-title">Pearls</h2>{" "}
                <p className="clarification">
                  According to the{" "}
                  <span className="bold">
                    Ministry of Industry and Commerce
                  </span>
                  , displaying uncertified pearls isn't an illegal act, but it
                  must be accompanied with a description of the pearl and its
                  nature. Please specify the details of each pearl type
                  composing this piece. If the jewelry piece conatins no pearls,
                  simply leave this section empty.
                </p>
                {formData?.pearls?.map((entry, index) => (
                  <div key={index} className="pearl-group">
                    <span className="inline">
                      {" "}
                      <h4>Pearl Type {index + 1}</h4>
                      <button
                        type="button"
                        className="icon-btn delete-material"
                        onClick={() => removeEntry("pearls", index)}
                      >
                        Remove
                      </button>
                    </span>
                    <div className="pearl-inputs">
                      <label htmlFor="type">
                        <span className="required">*</span> Type
                      </label>
                      <input
                        className="pearl-type"
                        type="text"
                        name="type"
                        placeholder="Type"
                        value={entry.type}
                        onChange={(e) => handleChange(e, "pearls", index)}
                      />
                      <div className="two-inputs">
                        <div>
                          {" "}
                          <label htmlFor="shape">
                            <span className="required">*</span> Shape
                          </label>
                          <input
                            type="text"
                            name="shape"
                            placeholder="Shape (e.g. round, baroque...)"
                            value={entry.shape}
                            onChange={(e) => handleChange(e, "pearls", index)}
                          />
                        </div>
                        <div>
                          {" "}
                          <label htmlFor="color">
                            <span className="required">*</span> Color
                          </label>
                          <input
                            type="text"
                            name="color"
                            placeholder="Color (e.g. white, pink...)"
                            value={entry.color}
                            onChange={(e) => handleChange(e, "pearls", index)}
                          />
                        </div>
                      </div>

                      <div className="two-inputs">
                        <div>
                          <label htmlFor="number">
                            <span className="required">*</span> Number
                          </label>
                          <input
                            type="number"
                            name="number"
                            placeholder="Number of Pearls of this type"
                            value={entry.number}
                            onChange={(e) => handleChange(e, "pearls", index)}
                            max={formData.totalWeight}
                          />
                        </div>
                        <div>
                          <label htmlFor="weight">
                            <span className="required">*</span> Weight
                          </label>
                          <input
                            type="number"
                            name="weight"
                            placeholder="Weight (grams)"
                            value={entry.weight}
                            onChange={(e) => handleChange(e, "pearls", index)}
                            min="0"
                            max={formData.totalWeight}
                            step="0.01"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="add"
                  onClick={() =>
                    addEntry("pearls", {
                      type: "",
                      weight: "",
                      shape: "",
                      color: "",
                      number: "",
                    })
                  }
                  title="Add Another Pearl"
                >
                  +
                </button>
              </div>
            </>
          ) : null}
          {view === "Diamonds" ? (
            <>
              <div className="diamonds-form">
                <h2 className="view-title">Diamonds</h2>{" "}
                <p className="clarification">
                  According to the{" "}
                  <span className="bold">
                    Ministry of Industry and Commerce
                  </span>
                  , Jewelry pieces that contain diamonds, must provide a
                  description of the weight and purity (clarity). The other
                  characteristics mentioned, provide your customers with a
                  better informed expirence. If the piece contains no diamonds,
                  simply leave this section empty.
                </p>
                {formData?.diamonds?.map((entry, index) => (
                  <div key={index} className="diamond-group">
                    <span className="inline">
                      {" "}
                      <h4>Diamond Type {index + 1}</h4>
                      <button
                        type="button"
                        className="icon-btn delete-material"
                        onClick={() => removeEntry("diamonds", index)}
                      >
                        Remove
                      </button>
                    </span>

                    <div className="diamond-inputs">
                      <label htmlFor="type">
                        <span className="required">*</span> Type
                      </label>
                      <input
                        type="text"
                        name="type"
                        placeholder="Type (e.g. natural, lab-grown)"
                        value={entry.type}
                        onChange={(e) => handleChange(e, "diamonds", index)}
                        required
                        className="diamond-type"
                      />

                      <div className="two-inputs">
                        <div>
                          <label htmlFor="shape">Shape</label>
                          <input
                            type="text"
                            name="shape"
                            placeholder="Shape (e.g. round, princess)"
                            value={entry.shape}
                            onChange={(e) => handleChange(e, "diamonds", index)}
                          />
                        </div>
                        <div>
                          <label htmlFor="color">Color</label>
                          <input
                            type="text"
                            name="color"
                            placeholder="Color"
                            value={entry.color}
                            onChange={(e) => handleChange(e, "diamonds", index)}
                          />
                        </div>
                      </div>

                      <div className="two-inputs">
                        <div>
                          <label htmlFor="clarity">
                            <span className="required">*</span> Clarity
                          </label>
                          <input
                            type="text"
                            name="clarity"
                            placeholder="Clarity"
                            value={entry.clarity}
                            onChange={(e) => handleChange(e, "diamonds", index)}
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="cutGrade">Cut Grade</label>
                          <input
                            type="text"
                            name="cutGrade"
                            placeholder="Cut Grade"
                            value={entry.cutGrade}
                            onChange={(e) => handleChange(e, "diamonds", index)}
                          />
                        </div>
                      </div>

                      <div className="two-inputs">
                        <div>
                          <label htmlFor="number">
                            <span className="required">*</span> Number
                          </label>
                          <input
                            type="number"
                            name="number"
                            placeholder="Number of diamonds of this type"
                            value={entry.number}
                            onChange={(e) => handleChange(e, "diamonds", index)}
                            min="1"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="weight">
                            <span className="required">*</span> Weight
                          </label>
                          <input
                            type="number"
                            name="weight"
                            placeholder="0.00 (carats)"
                            value={entry.weight}
                            onChange={(e) => handleChange(e, "diamonds", index)}
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>{" "}
              <button
                type="button"
                className="add"
                onClick={() =>
                  addEntry("diamonds", {
                    weight: "",
                    color: "",
                    clarity: "",
                    cutGrade: "",
                    type: "",
                    shape: "",
                    number: "",
                  })
                }
              >
                +
              </button>
            </>
          ) : null}

          {view === "Other Materials" ? (
            <>
              <div className="other-materials-form">
                <h2 className="view-title">Other Materials</h2>{" "}
                <p className="clarification">
                  Please list any other materials used in this jewelry piece
                  (e.g. gemstones, stainless steel). Include their names and
                  weights. If the piece doesn't include any other materials,
                  simply leave this section empty.
                </p>
                {formData?.otherMaterials?.map((entry, index) => (
                  <div key={index} className="other-material-group">
                    <span className="inline">
                      {" "}
                      <h4>Material {index + 1}</h4>
                      <button
                        type="button"
                        className="icon-btn delete-material"
                        onClick={() => removeEntry("otherMaterials", index)}
                      >
                        Remove
                      </button>
                    </span>
                    <div className="other-material-row">
                      <div className="label-and-input">
                        {" "}
                        <label htmlFor="name">
                          <span className="required">*</span> Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          placeholder="Material Name (e.g. rubby)"
                          value={entry.name}
                          onChange={(e) =>
                            handleChange(e, "otherMaterials", index)
                          }
                        />
                      </div>

                      <div className="label-and-input">
                        {" "}
                        <label htmlFor="weight">
                          <span className="required">*</span> Weight
                        </label>
                        <input
                          type="number"
                          name="weight"
                          placeholder="Weight (grams)"
                          value={entry.weight}
                          onChange={(e) =>
                            handleChange(e, "otherMaterials", index)
                          }
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="add"
                  onClick={() =>
                    addEntry("otherMaterials", {
                      name: "",
                      weight: "",
                    })
                  }
                >
                  +
                </button>
              </div>{" "}
            </>
          ) : null}
          {view === "Certifications" ? (
            <>
              <div className="certifications-form">
                <h2 className="view-title">Certifications</h2>{" "}
                <p className="clarification">
                  Provide certification details for any precious metals,
                  diamonds, or pearls in this jewelry. This adds trust and
                  traceability for your customers.
                </p>
                {formData?.certifications?.map((entry, index) => (
                  <>
                    <div key={index} className="certification-group">
                      <span className="inline">
                        {" "}
                        <h4>Certification {index + 1}</h4>
                        <button
                          type="button"
                          className="icon-btn delete-material"
                          onClick={() => removeEntry("certifications", index)}
                        >
                          Remove
                        </button>
                      </span>
                      <div className="certification-name">
                        <label htmlFor="name">
                          <span className="required">*</span> Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          placeholder="Certifier Name (e.g. GIA)"
                          value={entry.name}
                          onChange={(e) =>
                            handleChange(e, "certifications", index)
                          }
                        />
                      </div>
                      <div className="certifications-details">
                        {" "}
                        <div className="label-and-input">
                          {" "}
                          <label htmlFor="reportNumber">
                            <span className="required">*</span> Report Number
                          </label>
                          <input
                            type="text"
                            name="reportNumber"
                            placeholder="Report Number"
                            value={entry.reportNumber}
                            onChange={(e) =>
                              handleChange(e, "certifications", index)
                            }
                          />
                        </div>
                        <div className="label-and-input">
                          {" "}
                          <label htmlFor="reportDate">
                            <span className="required">*</span> Report Date
                          </label>
                          <input
                            type="date"
                            name="reportDate"
                            placeholder="Report Date"
                            value={entry.reportDate}
                            onChange={(e) =>
                              handleChange(e, "certifications", index)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </>
                ))}
                <button
                  type="button"
                  className="add"
                  onClick={() =>
                    addEntry("certifications", {
                      name: "",
                      weight: "",
                    })
                  }
                >
                  +
                </button>
                {/* <p className="error">
                  {errors?.certifications ? errors["certifications"] : null}
                </p> */}
              </div>{" "}
            </>
          ) : null}
          {view === "Images" ? (
            <>
              <div className="images-view">
                <h2 className="view-title">Jewelry Images</h2>{" "}
                <p className="clarification">
                  Images of jewelry provide customer of unspoken details and
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
              {/* {formData?.images?.length < 5 && (
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
              )} */}
              {/* {errors?.images && <p className="error">{errors.images}</p>} */}
            </>
          ) : null}
          {view === "Submit" && (
            <>
              <SummaryView formData={formData} handleChange={handleChange} />
              <div>
                <div className="errors-in-summary">
                  {errors?.generalError && (
                    <p className="error">{errors.generalError}</p>
                  )}{" "}
                  {errors?.images && <p className="error">{errors.images}</p>}{" "}
                  {errors?.materials && (
                    <p className="error">{errors.materials}</p>
                  )}
                  {errors?.preciousMaterials && (
                    <p className="error">{errors.preciousMaterials}</p>
                  )}
                  {errors?.preciousMaterialsFields && (
                    <p className="error">{errors.preciousMaterialsFields}</p>
                  )}
                  {errors?.pearls && <p className="error">{errors.pearls}</p>}
                  {errors?.diamonds && (
                    <p className="error">{errors.diamonds}</p>
                  )}
                  {errors?.otherMaterials && (
                    <p className="error">{errors.otherMaterials}</p>
                  )}
                  {errors?.certifications && (
                    <p className="error">{errors.certifications}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleSubmit()
                  }}
                  className={
                    errors && Object.values(errors).some((err) => err)
                      ? "disabled"
                      : ""
                  }
                  id="submit-jewelry"
                  disabled={errors && Object.values(errors).some((err) => err)}
                >
                  Submit Jewelry Info
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {showModal && (
        <FeedbackModal
          show={showModal}
          type={modalType}
          message={modalMessage}
          actions={modalActions}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}

export default JewelryForm
