import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import FeedbackModal from "./FeedbackModal"
import User from "../services/api"

import "../../public/stylesheets/terms-modal.css"
import sideImage from "../assets/small re.png"
import smallImage from "../assets/small re.png"

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

  const [formValues, setFormValues] = useState(initialState)
  const [errorMessage, setErrorMessage] = useState("") //not using it yet

  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState("success")
  const [modalMessage, setModalMessage] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)

  const [bgImage, setBgImage] = useState(sideImage)

  const handleChange = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value })
  }

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)")

    const handleChangeMq = (e) => {
      setBgImage(e.matches ? smallImage : sideImage)
    }

    handleChangeMq(mq)

    mq.addEventListener("change", handleChangeMq)
    return () => mq.removeEventListener("change", handleChangeMq)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage("")

    try {
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

  const jewelerTerms = [
    {
      title: "Introduction",
      content:
        "Welcome to Durra. By registering as a jeweler, you agree to comply with and be bound by these terms and conditions.",
    },
    {
      title: "Use of Platform",
      content:
        "You agree to use the platform for lawful business purposes only and to provide accurate, up-to-date information about your shop and products.",
    },
    {
      title: "Products and Listings",
      content:
        "You are responsible for ensuring that all product descriptions, images, prices, and availability details are truthful, accurate, and not misleading.",
    },
    {
      title: "Review and Approval",
      content:
        "All registration requests are subject to review by Durra’s administrative team, who may approve, reject, or request modifications.",
    },
    {
      title: "Privacy & Security",
      content:
        "Any personal or business information you provide will be handled in accordance with Durra’s Terms and Conditions and applicable laws.",
    },
    {
      title: "Liability",
      content:
        "Durra is not liable for indirect or consequential losses arising from your use of the platform or issues between you and customers.",
    },
    {
      title: "Governing Law",
      content:
        "These terms are governed by the laws of Bahrain, and you agree to the jurisdiction of Bahraini courts in the event of any dispute.",
    },
    {
      title: "Partner Policy",
      content:
        "As a partner jeweler, you are responsible for the authenticity, quality, and legality of all products you list. Durra may remove any product or suspend accounts that breach these terms.",
      highlight: true,
    },
  ]

  return (
    <>
      <div className="registeration-wrapper">
        <div
          className="img-side"
          style={{
            backgroundImage: `url(${bgImage})`,
          }}
        ></div>
        <div className="registeration-form">
          <h1 className="form-title">Jeweler Registeration</h1>
          <div>
            <label htmlFor="name">Business Name</label>
            <input
              type="text"
              placeholder="Enter Business Name"
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
              placeholder="Enter Commercial Record"
              name="cr"
              onChange={handleChange}
              value={formValues.cr}
              required
            />

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
                !formValues.cr ||
                !agreed
              }
              onClick={handleSubmit}
            >
              Register
            </button>
          </div>
        </div>
        <FeedbackModal
          show={showModal}
          type={modalType}
          message={modalMessage}
          onClose={() => setShowModal(false)}
        />
      </div>

      {showTermsModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Terms and Conditions</h2>

            <div className="terms-modal-content">
              {jewelerTerms.map((sec, idx) => (
                <div
                  key={idx}
                  className={`terms-section ${
                    sec.highlight ? "terms-section-highlight" : ""
                  }`}
                >
                  <h5>{sec.title}</h5>
                  <p>{sec.content}</p>
                </div>
              ))}
            </div>

            <button onClick={() => setShowTermsModal(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  )
}

export default JewelerRegisteration
