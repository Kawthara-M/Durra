import { useState } from "react"
import { SignInUser } from "../services/Auth"
import { useNavigate } from "react-router-dom"
import { useUser } from "../context/UserContext"
import FeedbackModal from "./FeedbackModal"
import User from "../services/api"

import "../../public/styleSheets/auth.css"
import authImage from "../assets/auth.jpg"

const SignIn = () => {
  const { setUser } = useUser()
  let navigate = useNavigate()
  const initialState = { email: "", password: "" }
  const [errorMessage, setErrorMessage] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [modalMessage, setModalMessage] = useState("")
  const [modalType, setModalType] = useState("success")
  const [formValues, setFormValues] = useState(initialState)

  const handleChange = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage("")

    try {
      const payload = await SignInUser(formValues)
      if (payload && payload.id) {
        setUser(payload)
        setFormValues({ email: "", password: "" })
        navigate("/Home")
      }
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  const forgetPassword = async () => {
    try {
      const response = await User.post("/auth/forgetPassword", {
        email: formValues.email,
      })

      setModalType("success")
      setModalMessage("A password reset link has been sent to your email.")
      setShowModal(true)
      setErrorMessage("")
    } catch (error) {
      const errorMsg = "Failed to send reset link."

      setModalType("error")
      setModalMessage(errorMsg)
      setShowModal(true)
    }
  }

  return (
    <>
      <div className="wrapper" style={{ width: "100%" }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `url(${authImage})`,
            backgroundSize: "cover",
            backgroundPosition: "bottom",
            opacity: 0.7,
            zIndex: 0,
          }}
        />

        <div
          style={{ position: "relative", zIndex: 1 }}
          className="sign-in-container"
        >
          <h1 className="sign-in-title">Sign In</h1>
          <form onSubmit={handleSubmit} className="sign-in-form">
            <div>
              <label htmlFor="email">Email</label>
              <input
                onChange={handleChange}
                id="email"
                type="email"
                name="email"
                placeholder="user@example.com"
                value={formValues.email}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password">Password</label>
              <input
                onChange={handleChange}
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formValues.password}
                required
              />
            </div>

            <a
              className={`forget-password ${
                !formValues.email ? "disabled-link" : ""
              }`}
              title="Please Enter your Email"
              onClick={() => {
                if (!formValues.email) return
                forgetPassword()
              }}
            >
              Forgot your password?
            </a>

            <div>
              {errorMessage && <span className="error">{errorMessage}</span>}
              <button
                disabled={!formValues.email || !formValues.password}
                className="sign-in-button"
              >
                Sign In
              </button>
            </div>

            <p id="switch">
              <button
                className="switch"
                type="button"
                onClick={() => navigate("/sign-up")}
              >
                Create an Account?
              </button>
            </p>
          </form>
        </div>
      </div>

      {showModal && (
        <FeedbackModal
          show={showModal}
          type={modalType}
          message={modalMessage}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}

export default SignIn
