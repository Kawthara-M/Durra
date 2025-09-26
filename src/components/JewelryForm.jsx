import { useState } from "react"
import AddNavigation from "./AddNavigation"
import SummaryView from "./SummaryView"

import placeholder from "../assets/placeholder.png"
import deleteIcon from "../assets/delete.png"
import "../../public/stylesheets/jewelery-add.css"

const JewelryForm = () => {
  const views = [
    "General",
    "Images",
    "Precious Metals",
    "Pearls",
    "Diamonds",
    "Other Materials",
    "Certifications",
    "Launch",
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
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    mainMaterial: "",
    totalWeight: "",
    totalPrice: "",
    productionCost: "",
    limitPerOrder: 1,
    description: "",
    images: [],
    preciousMaterials: [],
    pearls: [],
    diamonds: [],
    otherMaterials: [],
    certifications: [],
  })
  const [errors, setErrors] = useState({})
  const [view, setView] = useState("General")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

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
      setErrors()
    }

    const validImages = files.filter((file) => file.type.startsWith("image/"))
    const imageObjects = validImages.map((file) => ({
      file,
      src: URL.createObjectURL(file), // for preview
      name: file.name,
    }))

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...imageObjects],
    }))

    e.target.value = ""
  }

  const handleImageRemove = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== indexToRemove),
    }))
  }
  const handlePrev = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? formData.images.length - 1 : prev - 1
    )
  }

  const handleNext = () => {
    setCurrentImageIndex((prev) =>
      prev === formData.images.length - 1 ? 0 : prev + 1
    )
  }

  const validateMaterialWeight = (section, updatedList) => {
    const totalWeightLimit = parseFloat(formData.totalWeight || 0)

    const totalMaterialWeight = updatedList.reduce((acc, item) => {
      const weight = parseFloat(item.weight || 0)
      const number = parseFloat(item.number || 1)
      return acc + weight * number
    }, 0)

    const errorKey = `${section}Error`

    setErrors((prevErrors) => ({
      ...prevErrors,
      [errorKey]:
        totalMaterialWeight > totalWeightLimit
          ? `Total ${section
              .replace(/([A-Z])/g, " $1")
              .toLowerCase()} weight (${totalMaterialWeight.toFixed(
              2
            )}g) exceeds total allowed weight (${totalWeightLimit}g).`
          : null,
    }))
  }

  const handleChange = (e, section, index) => {
    const { name, value } = e.target

    if (section && index !== null) {
      setFormData((prev) => {
        const updatedSection = [...prev[section]]
        updatedSection[index] = { ...updatedSection[index], [name]: value }

        if (section === "preciousMaterials" && name === "name") {
          const karatOptions = karatOptionsByMaterial[value] || []
          updatedSection[index].karat =
            karatOptions.length > 0 ? karatOptions[0].value : ""
        }

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
    }
  }

  const handleSubmit = () => {
    if (
      !formData.name ||
      !formData.type ||
      !formData.mainMaterial ||
      !formData.totalWeight ||
      !formData.productionCost ||
      formData.images.length === 0 ||
      (formData.preciousMaterials.length === 0 &&
        formData.pearls.length === 0 &&
        formData.diamonds.length === 0 &&
        formData.otherMaterials.length === 0)
    ) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        launchError: "Please fill out all required fields.",
      }))
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        generalError: null,
      }))
    }

    if (formData.preciousMaterials.length > 0) {
      const allValid = formData.preciousMaterials.every((material) => {
        return material.name && material.karat && material.weight
      })
      setErrors((prevErrors) => ({
        ...prevErrors,
        preciousMaterialsError: allValid
          ? null
          : "Please fill out all required fields for precious materials.",
      }))
    }
    if (formData.pearls.length > 0) {
      const allValid = formData.pearls.every((pearl) => {
        return (
          pearl.type &&
          pearl.shape &&
          pearl.color &&
          pearl.number &&
          pearl.weight
        )
      })
      setErrors((prevErrors) => ({
        ...prevErrors,
        pearlsError: allValid
          ? null
          : "Please fill out all required fields for pearls.",
      }))
    }
  }

  return (
    <>
      <div className="jewelry-add-form">
        <AddNavigation views={views} setView={setView} activeView={view} />
        <div className="main-content">
          {view === "General" ? (
            <>
              <h2 className="view-title">General Information</h2>{" "}
              <p className="clarification">
                The following are the core information about this jewelry piece.
                Provide them and then provide the other information relative to
                your piece, you may skip sections that do not apply.
              </p>
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
              <label htmlFor="type">
                <span className="required">*</span> Type
              </label>
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleChange}
                placeholder="necklace, bracelet, earring..."
                required
              />
              <label htmlFor="mainMaterial">
                <span className="required">*</span> Main Material
              </label>
              <input
                type="text"
                name="mainMaterial"
                value={formData.mainMaterial}
                onChange={handleChange}
                placeholder="gold, silver..."
                required
              />
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
              <label htmlFor="productionCost">Production Cost (in BHD)</label>
              <input
                type="number"
                name="productionCost"
                value={formData.productionCost}
                onChange={handleChange}
                placeholder="0.00"
                min="0.00"
                required
              />
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
                min="1"
                value={formData.limitPerOrder}
                onChange={handleChange}
              />
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
                value={formData.description}
                onChange={handleChange}
                rows="10"
              />
              {errors.generalError && (
                <p className="error">{errors.generalError}</p>
              )}
            </>
          ) : null}
          {view === "Precious Metals" ? (
            <>
              <div className="precious-material-form">
                <h2 className="view-title">Precious Metals</h2>{" "}
                <p className="clarification">
                  According to the Ministry of Industry and Commerce, Gold,
                  Silver, and Platinium are the Precious Metals in the Kingdom
                  of Bahrain. Please specify the precious metals composing this
                  jewelry piece along with its karat and weight. If the jewelry
                  piece contains no precious metals, simply leave this section
                  empty.{" "}
                </p>
                {formData?.preciousMaterials?.length > 0 &&
                  formData.preciousMaterials.map((entry, index) => (
                    <div key={index} className="material-group">
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
                            <span className="required">*</span> Weight{" "}
                          </label>{" "}
                          <input
                            type="number"
                            name="weight"
                            placeholder="Weight (grams)"
                            value={entry.weight}
                            onChange={(e) =>
                              handleChange(e, "preciousMaterials", index)
                            }
                            min="0"
                            max={formData.totalWeight}
                            step="0.01"
                            className="material-weight"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        className="icon-btn delete-material"
                        onClick={() => removeEntry("preciousMaterials", index)}
                      >
                        <img
                          src={deleteIcon}
                          alt="delete icon"
                          className="icon"
                        />
                      </button>
                    </div>
                  ))}
              </div>
              {errors.preciousMaterialsError && (
                <p className="error">{errors.preciousMaterialsError}</p>
              )}

              <button
                type="button"
                className="add"
                onClick={() =>
                  addEntry("preciousMaterials", {
                    name: "gold",
                    karat: "24",
                    weight: "",
                    karatCost: "",
                  })
                }
              >
                +
              </button>
            </>
          ) : null}
          {view === "Pearls" ? (
            <>
              <div className="pearls-form">
                <h2 className="view-title">Pearls</h2>{" "}
                <p className="clarification">
                  According to the Ministry of Industry and Commerce, displaying
                  uncertified pearls isn't an illegal act, but it must be
                  accompanied with a description of the pearl and its nature.
                  Please specify the details of each pearl type composing this
                  piece. If the jewelry piece conatins no pearls, simply leave
                  this section empty.
                </p>
                {formData?.pearls?.map((entry, index) => (
                  <div key={index} className="pearl-group">
                    <h4 className="pearl-group-heading">
                      Pearl Type {index + 1}
                    </h4>
                    <label htmlFor="type">
                      <span className="required">*</span> Type
                    </label>
                    <input
                      type="text"
                      name="type"
                      placeholder="Type"
                      value={entry.type}
                      onChange={(e) => handleChange(e, "pearls", index)}
                    />

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

                    <button
                      type="button"
                      className="icon-btn delete-material"
                      onClick={() => removeEntry("pearls", index)}
                    >
                      <img
                        src={deleteIcon}
                        alt="delete icon"
                        className="icon"
                      />
                    </button>
                  </div>
                ))}
                <p className="error">
                  {errors["pearlsError"] ? errors["pearlsError"] : null}
                </p>
              </div>
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
              >
                +
              </button>
            </>
          ) : null}
          {view === "Diamonds" ? (
            <>
              <div className="diamonds-form">
                <h2 className="view-title">Diamonds</h2>{" "}
                <p className="clarification">
                  According to the Ministry of Industry and Commerce, Jewelry
                  pieces that contain diamonds, must provide a description of
                  the weight and purity (clarity) of them. The other
                  characteristics required proovide your customers with a better
                  informed expirence. If the piece contains no diamonds, simply
                  leave this section empty.
                </p>
                {formData?.diamonds?.map((entry, index) => (
                  <div key={index} className="diamond-group">
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
                    />

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

                    <label htmlFor="color">Color</label>
                    <input
                      type="text"
                      name="color"
                      placeholder="Color"
                      value={entry.color}
                      onChange={(e) => handleChange(e, "diamonds", index)}
                    />

                    <label htmlFor="cutGrade">Cut Grade</label>
                    <input
                      type="text"
                      name="cutGrade"
                      placeholder="Cut Grade"
                      value={entry.cutGrade}
                      onChange={(e) => handleChange(e, "diamonds", index)}
                    />

                    <label htmlFor="shape">Shape</label>
                    <input
                      type="text"
                      name="shape"
                      placeholder="Shape (e.g. round, princess)"
                      value={entry.shape}
                      onChange={(e) => handleChange(e, "diamonds", index)}
                    />

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

                    <label htmlFor="weight">
                      <span className="required">*</span> Weight
                    </label>
                    <input
                      type="number"
                      name="weight"
                      placeholder="Weight (carats)"
                      value={entry.weight}
                      onChange={(e) => handleChange(e, "diamonds", index)}
                      min="0"
                      step="0.01"
                      required
                    />
                    <button
                      type="button"
                      className="icon-btn delete-material"
                      onClick={() => removeEntry("diamonds", index)}
                    >
                      <img
                        src={deleteIcon}
                        alt="delete icon"
                        className="icon"
                      />
                    </button>
                  </div>
                ))}
                <p className="error">
                  {errors["diamondsError"] ? errors["diamondsError"] : null}
                </p>
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
                    <button
                      type="button"
                      className="icon-btn delete-material"
                      onClick={() => removeEntry("otherMaterials", index)}
                    >
                      <img
                        src={deleteIcon}
                        alt="delete icon"
                        className="icon"
                      />
                    </button>
                  </div>
                ))}
                <p className="error">
                  {errors["othersError"] ? errors["othersError"] : null}
                </p>
              </div>{" "}
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
            </>
          ) : null}
          {view === "Certifications" ? (
            <>
              <div className="certifications-form">
                <h2 className="view-title">Certifications</h2>{" "}
                <p className="clarification">
                  Provide certification details for any precious stones,
                  diamonds, or pearls included with this jewelry. This adds
                  trust and traceability for your customers.
                </p>
                {formData?.certifications?.map((entry, index) => (
                  <div key={index} className="certification-group">
                    <label htmlFor="name">
                      <span className="required">*</span> Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Certifier Name (e.g. GIA)"
                      value={entry.name}
                      onChange={(e) => handleChange(e, "certifications", index)}
                    />
                    <div className="certifications-details">
                      {" "}
                      <div className="label-and-">
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
                      <button
                        type="button"
                        className="icon-btn delete-material"
                        onClick={() => removeEntry("certifications", index)}
                      >
                        <img
                          src={deleteIcon}
                          alt="delete icon"
                          className="icon"
                        />
                      </button>
                    </div>
                  </div>
                ))}
                <p className="error">
                  {errors["certificationsError"]
                    ? errors["certificationsError"]
                    : null}
                </p>
              </div>{" "}
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
            </>
          ) : null}
          {view === "Images" ? (
            <>
              <div className="images-view">
                <h2 className="view-title">Images</h2>{" "}
                <p className="clarification">
                  Images of jewelry provide customer of unspoken details and
                  speak of your work. Please provide at least 1 image, and at
                  most 5.
                </p>
                {formData.images.length > 0 && (
                  <div className="image-slider">
                    <button className="slider-arrow left" onClick={handlePrev}>
                      &#8592;
                    </button>
                    <div className="slider-image-box">
                      <img
                        src={formData.images[currentImageIndex].src}
                        alt={`Image ${currentImageIndex + 1}`}
                        className="slider-image"
                      />
                      <button
                        type="button"
                        onClick={() => handleImageRemove(currentImageIndex)}
                        className="delete-image"
                      >
                        &times;
                      </button>
                    </div>
                    <button className="slider-arrow right" onClick={handleNext}>
                      &#8594;
                    </button>
                  </div>
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
              {errors.imagesError && (
                <p className="error">{errors.imagesError}</p>
              )}
            </>
          ) : null}
          {view === "Launch" && (
            <>
              <SummaryView formData={formData} handleChange={handleChange} />
              {errors.submitError && (
                <p className="error">{errors.submitError}</p>
              )}
              {errors.generalError && (
                <p className="error">{errors.generalError}</p>
              )}
              {errors.imagesError && (
                <p className="error">{errors.imagesError}</p>
              )}
              {errors.preciousMaterialsError && (
                <p className="error">{errors.preciousMaterialsError}</p>
              )}
              {errors.pearlsError && (
                <p className="error">{errors.pearlsError}</p>
              )}
              {errors.diamondsError && (
                <p className="error">{errors.diamondsError}</p>
              )}
              {errors.otherMaterialsError && (
                <p className="error">{errors.otherMaterialsError}</p>
              )}
              {errors.othercertificationsError && (
                <p className="error">{errors.otherMaterialsError}</p>
              )}
              <button
                type="button"
                onClick={() => {
                  handleSubmit()
                }}
                className={`${errors ? "disabled" : ""}`}
              >
                Submit Jewelry Info
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default JewelryForm
