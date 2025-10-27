import { useState } from "react"
import { SignInUser } from "../services/Auth"
import { useNavigate } from "react-router-dom"
import { useUser } from "../context/UserContext"
import FeedbackModal from "./FeedbackModal"
import User from "../services/api"

import "../../public/styleSheets/auth.css"

const SignIn = ({ setShowSignUp }) => {
  const { setUser } = useUser()
  let navigate = useNavigate()
  const initialState = { email: "", password: "" }
  const [errorMessage, setErrorMessage] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [modalMessage, setModalMessage] = useState("")

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
      console.log("here")
      const response = await User.post("/auth/forgetPassword", {
        email: formValues.email,
      })
      console.log("meow")

      setModalMessage("A password reset link has been sent to your email.")
      setShowModal(true)
      setErrorMessage("")
    } catch (error) {
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.msg ||
        "Failed to send reset link."
      setErrorMessage(errorMsg)
    }
  }

  return (
    <>
      <div className="wrapper">
        <h1>Sign In</h1>
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
              onChange={(e) => {
                handleChange(e)
              }}
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
              !formValues.email ? "disabled-link" : null
            }`}
            title="Enter Email First"
            onClick={() => {
              if (!formValues.email) return
              forgetPassword()
            }}
          >
            Forgot your password?
          </a>
          <div>
            {errorMessage && <span className="error">{errorMessage}</span>}
            <button disabled={!formValues.email || !formValues.password}>
              Sign In
            </button>
          </div>
          <p id="switch">
            <button
              className="switch"
              type="button"
              onClick={() => setShowSignUp(true)}
            >
              Create an Account?
            </button>
          </p>
        </form>
      </div>
      {showModal && (
        <FeedbackModal
          show={showModal}
          type="success"
          message={modalMessage}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}

export default SignIn
