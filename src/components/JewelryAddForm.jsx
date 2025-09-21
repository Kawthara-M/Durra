import { useState } from "react"

import placeholder from "../assets/placeholder.png"
import deleteIcon from "../assets/delete.png"
import "../../public/stylesheets/jewelry-form.css"

const JewelryAddForm = () => {
  const [view, setView] = useState("general")
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
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
  const [materials, setMaterials] = useState([
    {
      name: "gold",
      karat: "24",
      weight: "",
      karatCost: "",
      productionCost: "",
    },
  ])
  const [pearls, setPearls] = useState([
    {
      type: "",
      weight: "",
      shape: "",
      color: "",
      number: "",
    },
  ])
  const [diamonds, setDiamonds] = useState([
    {
      weight: "",
      color: "",
      clarity: "",
      cutGrade: "",
      type: "",
      shape: "",
      number: "",
    },
  ])

  const [otherMaterials, setOtherMaterials] = useState([
    {
      name: "",
      weight: "",
    },
  ])
  const [certifications, setCertifications] = useState([
    {
      name: "",
      reportNumber: "",
      reportDate: "",
    },
  ])

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    mainMaterial: "",
    totalWeight: "",
    limitPerOrder: 1,
    description: "",
  })
  const [imageError, setImageError] = useState("")
  const [infoErrors, setInfoErrors] = useState({})

  // image handlers
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)

    if (images.length + files.length > 5) {
      alert("You can only upload up to 5 images.")
      return
    }

    const validImages = files.filter((file) => file.type.startsWith("image/"))

    const newPreviews = validImages.map((file) => URL.createObjectURL(file))

    setImages((prev) => [...prev, ...validImages])
    setPreviews((prev) => [...prev, ...newPreviews])

    e.target.value = ""
  }

  const handleRemoveImage = (index) => {
    const updatedImages = [...images]
    const updatedPreviews = [...previews]
    updatedImages.splice(index, 1)
    updatedPreviews.splice(index, 1)
    setImages(updatedImages)
    setPreviews(updatedPreviews)
  }

  const calculateTotalWeight = (items) =>
    items.reduce((total, item) => {
      const weight = parseFloat(item.weight)
      return (
        total +
        (isNaN(weight) ? 0 : item.number ? item.number * weight : weight)
      )
    }, 0)

  const calculateCurrentWeight = () => {
    const sum =
      calculateTotalWeight(materials) +
      calculateTotalWeight(pearls) +
      calculateTotalWeight(diamonds) +
      calculateTotalWeight(otherMaterials)
    console.log(sum)
    return sum
  }

  // precious material handlers
  // update the karat options based on material selected
  const handleMaterialChange = (index, newName) => {
    const newKarat = karatOptionsByMaterial[newName][0].value
    const updated = [...materials]
    updated[index] = {
      ...updated[index],
      name: newName,
      karat: newKarat,
    }
    setMaterials(updated)
  }

  // updating the karat after selecting a material
  const handleKaratChange = (index, newKarat) => {
    const updated = [...materials]
    updated[index].karat = newKarat
    setMaterials(updated)
  }

  const addMaterial = () => {
    setMaterials([
      ...materials,
      {
        name: "gold",
        karat: "24",
        weight: "",
        karatCost: "",
        productionCost: "",
      },
    ])
  }

  // keep only the material whose index doesn't equal the passed one
  const removeMaterial = (index) => {
    setMaterials(materials.filter((_, i) => i !== index))
  }

  const handleMaterialFieldChange = (index, field, value) => {
    const updated = [...materials]
    updated[index][field] = value
    setMaterials(updated)
    if (field === "weight" || field === "number") {
      if (calculateTotalWeight(materials) > formData.totalWeight) {
        setInfoErrors((prev) => ({
          ...prev,
          materialsError: `The total weight of precious materials shouldn't exceed the jewelry's total weight: ${formData.totalWeight}`,
        }))
      } else {
        setInfoErrors((prev) => ({
          ...prev,
          materialsError: ``,
        }))
      }
    }
  }

  // pearl handlers
  const addPearl = () => {
    setPearls([
      ...pearls,
      {
        type: "",
        weight: "",
        shape: "",
        color: "",
        number: "",
      },
    ])
  }

  const removePearl = (index) => {
    setPearls(pearls.filter((_, i) => i !== index))
  }

  const handlePearlFieldChange = (index, field, value) => {
    const updated = [...pearls]
    updated[index][field] = value
    setPearls(updated)
    if (field === "weight" || field === "number") {
      if (calculateTotalWeight(pearls) > formData.totalWeight) {
        console.log(calculateCurrentWeight())
        setInfoErrors((prev) => ({
          ...prev,
          pearlsError: `The total weight of pearls shouldn't exceed the jewelry's total weight: ${formData.totalWeight}`,
        }))
      } else {
        setInfoErrors((prev) => ({
          ...prev,
          pearlsError: ``,
        }))
      }
    }
  }

  const isPearlValid = () => {
    const valid = pearls.every((p) => {
      const hasAnyValue = Object.values(p).some(
        (val) => val?.toString().trim() !== ""
      )

      if (!hasAnyValue) return true

      const requiredFields = ["type", "shape", "color", "weight", "number"]
      // this will return true if all of them are filled
      return requiredFields.every((field) => p[field]?.toString().trim() !== "")
    })
    return valid
  }
  // diamond handlers
  const addDiamond = () => {
    setDiamonds([
      ...diamonds,
      {
        weight: "",
        color: "",
        clarity: "",
        cutGrade: "",
        type: "",
        shape: "",
        diamond: "",
      },
    ])
  }

  const removeDiamond = (index) => {
    setDiamonds(diamonds.filter((_, i) => i !== index))
  }

  const handleDiamondFieldChange = (index, field, value) => {
    const updated = [...diamonds]
    updated[index][field] = value
    setDiamonds(updated)
    if (field === "weight" || field === "number") {
      if (calculateTotalWeight(diamonds) > formData.totalWeight) {
        setInfoErrors((prev) => ({
          ...prev,
          diamondsError: `The total weight of diamonds shouldn't exceed the jewelry's total weight: ${formData.totalWeight}`,
        }))
      } else {
        setInfoErrors((prev) => ({
          ...prev,
          diamondsError: ``,
        }))
      }
    }
  }

  const isDiamondValid = () => {
    const valid = diamonds.every((diamond) => {
      const hasAnyValue = Object.values(diamond).some(
        (val) => val?.toString().trim() !== ""
      )

      if (!hasAnyValue) return true

      const requiredFields = [
        "type",
        "shape",
        "color",
        "weight",
        "number",
        "clarity",
        "cutGrade",
      ]
      // this will return true if all of them are filled
      return requiredFields.every(
        (field) => diamond[field]?.toString().trim() !== ""
      )
    })
    if (!valid) {
      setInfoErrors((prev) => ({
        ...prev,
        diamondsError: `Incomplete Information`,
      }))
    } else {
      setInfoErrors((prev) => ({
        ...prev,
        diamondsError: ``,
      }))
    }
    return valid
  }

  // certifications handlers
  const addCertification = () => {
    setCertifications([
      ...certifications,
      {
        name: "",
        reportNumber: "",
        reportDate: "",
      },
    ])
  }

  const removeCertification = (index) => {
    setCertifications(certifications.filter((_, i) => i !== index))
  }

  const handleCertificationChange = (index, field, value) => {
    const updated = [...certifications]
    updated[index][field] = value
    setCertifications(updated)
  }

  // other materials handlers
  const addOtherMaterial = () => {
    setOtherMaterials([
      ...otherMaterials,
      {
        name: "",
        weight: "",
      },
    ])
  }

  const removeOtherMaterial = (index) => {
    setOtherMaterials(otherMaterials.filter((_, i) => i !== index))
  }

  const handleOtherMaterialChange = (index, field, value) => {
    const updated = [...otherMaterials]
    updated[index][field] = value
    setOtherMaterials(updated)
    if (field === "weight" || field === "number") {
      if (calculateTotalWeight(otherMaterials) > formData.totalWeight) {
        setInfoErrors((prev) => ({
          ...prev,
          othersError: `The total weight of materials shouldn't exceed the jewelry's total weight: ${formData.totalWeight}`,
        }))
      } else {
        setInfoErrors((prev) => ({
          ...prev,
          othersError: ``,
        }))
      }
    }
  }
  const isValidOthers = () => {
    const valid = otherMaterials.every((material) => {
      const hasAnyValue = Object.values(material).some(
        (val) => val?.toString().trim() !== ""
      )

      if (!hasAnyValue) return true

      const requiredFields = ["name", "weight"]

      return requiredFields.every(
        (field) => material[field]?.toString().trim() !== ""
      )
    })
    if (!valid) {
      setInfoErrors((prev) => ({
        ...prev,
        othersError: `Complete this material information`,
      }))
    } else {
      setInfoErrors((prev) => ({
        ...prev,
        othersError: ``,
      }))
    }
    return valid
  }
  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === "preciousMaterials") {
      const karatsForMaterial = karatOptionsByMaterial[value] || []
      setFormData((prev) => ({
        ...prev,
        preciousMaterials: value,
        karat: karatsForMaterial.length > 0 ? karatsForMaterial[0].value : "",
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }
  const handleSubmit = () => {
    if (images.length < 1) {
      setImageError("Images are required. Min of 1, Max of 5.")
      return
    }

    const finalFormData = {
      ...formData,
      images,
      preciousMaterials: materials,
      pearls,
      diamonds,
      otherMaterials,
      certifications,
    }

    console.log("Final Submission Data:", finalFormData)
    // use post
  }

  return (
    <>
      <div className="jewelry-add-form">
        <div className="img-side">
          <div className="previews">
            <div className="main-image-container">
              <img
                src={previews[0] || placeholder}
                alt="Main Preview"
                id="main-image"
              />
              {previews[0] && (
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveImage(0)}
                >
                  ✕
                </button>
              )}
              {images.length < 5 && (
                <label className="image-add-label" title="Add Image">
                  +
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    disabled={images.length >= 5}
                    className="image-add"
                  />
                </label>
              )}
            </div>
            <div className="extra">
              {[0, 1, 2, 3].map((i) => {
                const preview = previews[i + 1]
                return (
                  <div key={i} className="preview-container">
                    <img
                      src={preview || placeholder}
                      alt={`Extra Preview ${i + 1}`}
                    />
                    {preview && (
                      <button
                        className="remove-btn"
                        onClick={() => handleRemoveImage(i + 1)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          <p className="error">{imageError ? imageError : null}</p>
        </div>

        <div className="info-side">
          {view === "general" ? (
            <>
              {" "}
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <label htmlFor="type">Type:</label>
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleChange}
                placeholder="necklace, bracelet, earring..."
                required
                autoComplete="on"
              />
              <label htmlFor="mainMaterial">Main Material:</label>
              <input
                type="text"
                name="mainMaterial"
                value={formData.mainMaterial}
                onChange={handleChange}
                placeholder="gold, silver..."
                required
                autoComplete="on"
              />
              <label htmlFor="totalWeight">Total Weight (in grams):</label>
              <input
                type="text"
                name="totalWeight"
                value={formData.totalWeight}
                onChange={handleChange}
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
                cols="48"
                rows="10"
              />
              <button
                onClick={() => setView("preciousMaterials")}
                disabled={
                  !formData.name ||
                  !formData.type ||
                  !formData.mainMaterial ||
                  !formData.totalWeight
                }
              >
                Next
              </button>
            </>
          ) : null}
          {view === "preciousMaterials" ? (
            <>
              <div className="precious-material-form">
                <button className="back" onClick={() => setView("general")}>
                  ←
                </button>

                <h3 className="view-title">Precious Materials</h3>
                <p className="clarification">
                  According to the Ministry of Industry and Commerce, Gold,
                  Silver, and Platinium are the Precious Materials in the
                  Kingdom of Bahrain. Please specify the precious materials
                  composing this jewelry piece along with its karat and weight.{" "}
                </p>
                {materials.map((entry, index) => (
                  <div key={index} className="material-group">
                    <div className="selection">
                      <select
                        name="name"
                        value={entry.name}
                        onChange={(e) =>
                          handleMaterialChange(index, e.target.value)
                        }
                        className="material-selector"
                      >
                        <option value="gold">Gold</option>
                        <option value="silver">Silver</option>
                        <option value="platinium">Platinium</option>
                      </select>

                      <select
                        name="karat"
                        value={entry.karat}
                        onChange={(e) =>
                          handleKaratChange(index, e.target.value)
                        }
                        className="karat-selector"
                      >
                        {karatOptionsByMaterial[entry.name].map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        name="productionCost"
                        placeholder="Production Cost"
                        value={entry.productionCost}
                        onChange={(e) =>
                          handleMaterialFieldChange(
                            index,
                            "productionCost",
                            e.target.value
                          )
                        }
                        min="0.01"
                        step="0.01"
                        required
                        className="production-cost"
                      />
                      <input
                        type="number"
                        name="weight"
                        placeholder="Weight (grams)"
                        value={entry.weight}
                        onChange={(e) =>
                          handleMaterialFieldChange(
                            index,
                            "weight",
                            e.target.value
                          )
                        }
                        min="0"
                        max={formData.totalWeight}
                        step="0.01"
                        className="material-weight"
                      />
                    </div>
                    <button
                      onClick={() => removeMaterial(index)}
                      className="icon-btn delete-material"
                      title="delete"
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
              <p className="error">
                {infoErrors["materialsError"]
                  ? infoErrors["materialsError"]
                  : null}
              </p>
              <button
                type="button"
                onClick={addMaterial}
                className="add-material"
                title="Add Another Precious Material"
              >
                +
              </button>
              <button
                onClick={() => setView("pearls")}
                className="next-button"
                disabled={
                  !materials.every(
                    (mat) =>
                      mat.weight &&
                      parseFloat(mat.weight) > 0 &&
                      mat.productionCost &&
                      parseFloat(mat.productionCost) > 0
                  )
                }
              >
                Next
              </button>
            </>
          ) : null}

          {view === "pearls" ? (
            <div className="pearls-form">
              <button
                className="back"
                onClick={() => setView("preciousMaterials")}
              >
                ←
              </button>
              <h3 className="view-title">Pearls</h3>
              <p className="clarification">
                According to the Ministry of Industry and Commerce, displaying
                uncertified pearls isn't an illegal act, but it must be
                accompanied with a description of the pearl and its nature.
                Please specify the details of each pearl type composing this
                piece. If the piece doesn't contain any pearls, simply click
                next.
              </p>

              {pearls.map((entry, index) => (
                <div key={index} className="pearl-group">
                  <input
                    type="text"
                    name="type"
                    placeholder="Type"
                    value={entry.type}
                    onChange={(e) =>
                      handlePearlFieldChange(index, "type", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    name="shape"
                    placeholder="Shape (e.g. round, baroque...)"
                    value={entry.shape}
                    onChange={(e) =>
                      handlePearlFieldChange(index, "shape", e.target.value)
                    }
                    autoComplete="on"
                  />
                  <input
                    type="text"
                    name="color"
                    placeholder="Color (e.g. white, pink...)"
                    value={entry.color}
                    onChange={(e) =>
                      handlePearlFieldChange(index, "color", e.target.value)
                    }
                    autoComplete="on"
                  />
                  <input
                    type="number"
                    name="weight"
                    placeholder="Weight (grams)"
                    value={entry.weight}
                    onChange={(e) =>
                      handlePearlFieldChange(index, "weight", e.target.value)
                    }
                    min="0"
                    step="0.01"
                  />
                  <input
                    type="number"
                    name="number"
                    placeholder="Number of Pearls of this type"
                    value={entry.number}
                    onChange={(e) =>
                      handlePearlFieldChange(index, "number", e.target.value)
                    }
                    max={formData.totalWeight}
                  />
                  <button
                    onClick={() => removePearl(index)}
                    className="icon-btn delete-material"
                    title="Delete Pearl Entry"
                    disabled={pearls.length === 1}
                  >
                    <img src={deleteIcon} alt="delete icon" className="icon" />
                  </button>
                </div>
              ))}
              <p className="error">
                {infoErrors["pearlsError"] ? infoErrors["pearlsError"] : null}
              </p>
              <button
                type="button"
                onClick={addPearl}
                className="add-material"
                title="Add Another Pearl"
              >
                +
              </button>

              <button
                disabled={!isPearlValid()}
                onClick={() => {
                  setView("diamonds")
                }}
              >
                Next
              </button>
            </div>
          ) : null}
          {view === "diamonds" ? (
            <div className="diamonds-form">
              <button className="back" onClick={() => setView("pearls")}>
                ←
              </button>
              <h3 className="view-title">Diamonds</h3>
              <p className="clarification">
                Please provide information about any diamonds used in this
                jewelry piece, including their characteristics. If the piece
                doesn't include any diamonds, simply click next.
              </p>

              {diamonds.map((entry, index) => (
                <div key={index} className="diamond-group">
                  <input
                    type="text"
                    name="type"
                    placeholder="Type (e.g. natural, lab-grown)"
                    value={entry.type}
                    onChange={(e) =>
                      handleDiamondFieldChange(index, "type", e.target.value)
                    }
                    autoComplete="on"
                  />
                  <input
                    type="number"
                    name="weight"
                    placeholder="Weight (carats)"
                    value={entry.weight}
                    onChange={(e) =>
                      handleDiamondFieldChange(index, "weight", e.target.value)
                    }
                    min="0"
                    step="0.01"
                  />
                  <input
                    type="text"
                    name="color"
                    placeholder="Color"
                    value={entry.color}
                    onChange={(e) =>
                      handleDiamondFieldChange(index, "color", e.target.value)
                    }
                    autoComplete="on"
                  />
                  <input
                    type="text"
                    name="clarity"
                    placeholder="Clarity"
                    value={entry.clarity}
                    onChange={(e) =>
                      handleDiamondFieldChange(index, "clarity", e.target.value)
                    }
                    autoComplete="on"
                  />
                  <input
                    type="text"
                    name="cutGrade"
                    placeholder="Cut Grade"
                    value={entry.cutGrade}
                    onChange={(e) =>
                      handleDiamondFieldChange(
                        index,
                        "cutGrade",
                        e.target.value
                      )
                    }
                    autoComplete="on"
                  />

                  <input
                    type="text"
                    name="shape"
                    placeholder="Shape (e.g. round, princess)"
                    value={entry.shape}
                    onChange={(e) =>
                      handleDiamondFieldChange(index, "shape", e.target.value)
                    }
                    autoComplete="on"
                  />
                  <input
                    type="number"
                    name="number"
                    placeholder="Number of diamonds of this type"
                    value={entry.number}
                    onChange={(e) =>
                      handleDiamondFieldChange(index, "number", e.target.value)
                    }
                    min="1"
                  />
                  <button
                    onClick={() => removeDiamond(index)}
                    className="icon-btn delete-material"
                    title="Delete Diamond"
                    disabled={diamonds.length === 1}
                  >
                    <img src={deleteIcon} alt="delete icon" className="icon" />
                  </button>
                </div>
              ))}
              <p className="error">
                {infoErrors["diamondsError"]
                  ? infoErrors["diamondsError"]
                  : null}
              </p>
              <button
                type="button"
                onClick={() => addDiamond()}
                className="add-material"
                title="Add Another Diamond"
              >
                +
              </button>
              <button
                disabled={infoErrors["diamondsError"]}
                onClick={() => setView("otherMaterials")}
                className="next-button"
              >
                Next
              </button>
            </div>
          ) : null}
          {view === "otherMaterials" ? (
            <div className="other-materials-form">
              <button className="back" onClick={() => setView("diamonds")}>
                ←
              </button>
              <h3 className="view-title">Other Materials</h3>
              <p className="clarification">
                Please list any other materials used in this jewelry piece (e.g.
                gemstones, stainless steel). Include their names and weights. If
                the piece doesn't include any other materials, simply click
                continue.
              </p>

              {otherMaterials.map((entry, index) => (
                <div key={index} className="other-material-group">
                  <input
                    type="text"
                    name="name"
                    placeholder="Material Name (e.g. rubby)"
                    value={entry.name}
                    onChange={(e) =>
                      handleOtherMaterialChange(index, "name", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    name="weight"
                    placeholder="Weight (grams)"
                    value={entry.weight}
                    onChange={(e) =>
                      handleOtherMaterialChange(index, "weight", e.target.value)
                    }
                    min="0"
                    step="0.01"
                  />
                  <button
                    onClick={() => removeOtherMaterial(index)}
                    className="icon-btn delete-material"
                    title="Delete Other Material"
                    disabled={otherMaterials.length === 1}
                  >
                    <img src={deleteIcon} alt="delete icon" className="icon" />
                  </button>
                </div>
              ))}
              <p className="error">
                {infoErrors["otherssError"] ? infoErrors["othersError"] : null}
              </p>

              <button
                type="button"
                onClick={addOtherMaterial}
                className="add-material"
                title="Add Another Material"
              >
                +
              </button>
              <button
                disabled={!isValidOthers()}
                onClick={() => setView("certifications")}
                className="next-button"
              >
                Next
              </button>
            </div>
          ) : null}
          {view === "certifications" ? (
            <div className="certifications-form">
              <button
                className="back"
                onClick={() => setView("otherMaterials")}
              >
                ←
              </button>
              <h3 className="view-title">Certifications</h3>
              <p className="clarification">
                Provide certification details for any precious stones, diamonds,
                or pearls included with this jewelry. This adds trust and
                traceability for your customers.
              </p>

              {certifications.map((entry, index) => (
                <div key={index} className="certification-group">
                  <input
                    type="text"
                    name="name"
                    placeholder="Certifier Name (e.g. GIA)"
                    value={entry.name}
                    onChange={(e) =>
                      handleCertificationChange(index, "name", e.target.value)
                    }
                    autoComplete="on"
                  />
                  <input
                    type="text"
                    name="reportNumber"
                    placeholder="Report Number"
                    value={entry.reportNumber}
                    onChange={(e) =>
                      handleCertificationChange(
                        index,
                        "reportNumber",
                        e.target.value
                      )
                    }
                  />
                  <input
                    type="date"
                    name="reportDate"
                    placeholder="Report Date"
                    value={entry.reportDate}
                    onChange={(e) =>
                      handleCertificationChange(
                        index,
                        "reportDate",
                        e.target.value
                      )
                    }
                  />
                  <button
                    onClick={() => removeCertification(index)}
                    className="icon-btn delete-material"
                    title="Delete Certification"
                    disabled={certifications.length === 1}
                  >
                    <img src={deleteIcon} alt="delete icon" className="icon" />
                  </button>
                </div>
              ))}
              {infoErrors?.materialsError ? (
                <p className="error">{infoErrors.materialsError}</p>
              ) : infoErrors?.pearlsError ? (
                <p className="error">{infoErrors.pearlsError}</p>
              ) : infoErrors?.diamondsError ? (
                <p className="error">{infoErrors.diamondsError}</p>
              ) : infoErrors?.othersError ? (
                <p className="error">{infoErrors.othersError}</p>
              ) : null}

              <button
                type="button"
                onClick={addCertification}
                className="add-material"
                title="Add Another Certification"
              >
                +
              </button>

              <button className="submit-button" onClick={() => handleSubmit()}>
                Submit
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </>
  )
}

export default JewelryAddForm
