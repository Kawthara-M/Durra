import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import FeedbackModal from "./FeedbackModal"
import axios from "axios"
import User from "../services/api"

import "../../public/stylesheets/terms-modal.css"

const JewelerRegisteration = () => {
  let navigate = useNavigate()

  const initialState = {
    name: "",
    email: "",
    phone: "",
    address: "",
    cr: "",
    role: "Jeweler",
  }
  const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY

  const [formValues, setFormValues] = useState(initialState)
  const [addressSuggestions, setAddressSuggestions] = useState([])
  const [errorMessage, setErrorMessage] = useState("") //not using it yet

  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState("success")
  const [modalMessage, setModalMessage] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)

  let debounceTimeout

  const fetchAddressSuggestions = async (query) => {
    if (!query) return setAddressSuggestions([])

    try {
      const response = await axios.get(
        `https://api.geoapify.com/v1/geocode/autocomplete`,
        {
          params: {
            text: query,
            limit: 5,
            filter: "countrycode:bh",
            apiKey: GEOAPIFY_API_KEY,
          },
        }
      )

      setAddressSuggestions(response.data.features || [])
    } catch (error) {
      console.error("Address autocomplete error:", error)
    }
  }

  const handleAddressSelect = (suggestion) => {
    const formatted = suggestion.properties.formatted
    setFormValues({ ...formValues, address: formatted })
    setAddressSuggestions([])
  }

  const handleChange = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value })

    if (e.target.name === "address") {
      clearTimeout(debounceTimeout)
      debounceTimeout = setTimeout(() => {
        fetchAddressSuggestions(e.target.value)
      }, 300)
    }
    console.log(formValues)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage("")

    try {
      const formData = new FormData()
      formData.append("details", JSON.stringify(formValues))
      console.log(formData)

      await User.post("/requests", { details: formValues })

      setFormValues(initialState)
      setModalType("success")
      setModalMessage(
        <>
          Registration request submitted successfully.
          <br />A response will be provided soon.
        </>
      )
      setShowModal(true)
    } catch (error) {
      setModalType("error")
      setModalMessage(
        error.response?.data?.error || "Failed to submit request."
      )
      setShowModal(true)
    }
  }
  return (
    <>
      <div className="wrapper">
        <h1 className="form-title">Jeweler Registeration</h1>
        <div className="registeration-form">
          <label htmlFor="name">Business Name</label>
          <input
            type="text"
            name="name"
            onChange={handleChange}
            value={formValues.name}
            required
          />
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            placeholder="user@example.com"
            onChange={handleChange}
            value={formValues.email}
            required
          />

          <label htmlFor="phoneNumber">Phone Number</label>
          <div className="phone-input-wrapper">
            <span className="phone-code">+973</span>
            <input
              type="tel"
              name="phone"
              placeholder="0000 0000"
              onChange={handleChange}
              value={formValues.phone}
              required
            />
          </div>

          <label htmlFor="cr">Commercial Record (C.R)</label>
          <input
            type="text"
            name="cr"
            onChange={handleChange}
            value={formValues.cr}
            required
          />
          <div className="address-autocomplete-wrapper">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              name="address"
              onChange={handleChange}
              value={formValues.address}
              placeholder="Manama, Capital Governorate"
              required
            />
            {addressSuggestions.length > 0 && (
              <ul className="autocomplete-suggestions">
                {addressSuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => handleAddressSelect(suggestion)}
                  >
                    {suggestion.properties.formatted}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="terms-checkbox">
            <input
              type="checkbox"
              id="agree"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <label htmlFor="agree">
              I have read and agreed to the{" "}
              <span
                style={{
                  color: "blue",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
                onClick={() => setShowTermsModal(true)}
              >
                Terms and Conditions
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={
              !formValues.name ||
              !formValues.email ||
              !formValues.phone ||
              !formValues.address ||
              !formValues.cr ||
              !agreed
            }
            onClick={(e) => handleSubmit(e)}
          >
            Register
          </button>
        </div>
        <FeedbackModal
          show={showModal}
          type={modalType}
          message={modalMessage}
          onClose={() => setShowModal(false)}
        />
        {showTermsModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Terms and Conditions</h2>
              <p>
                {/* Replace this with your actual terms */}
                By registering, you agree to our platform rules, privacy
                policies, and all legal requirements associated with being a
                jeweler on our platform.
              </p>
              <button onClick={() => setShowTermsModal(false)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default JewelerRegisteration
