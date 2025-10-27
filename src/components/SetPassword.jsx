import { useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import validator from "validator"
import FeedbackModal from "./FeedbackModal"
import User from "../services/api"

const SetPassword = () => {
  const navigate = useNavigate()
  const initialState = {
    password: "",
    confirmPassword: "",
  }

  const [formValues, setFormValues] = useState(initialState)
  const [searchParams] = useSearchParams()
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState("success")
  const [modalMessage, setModalMessage] = useState("")
  const [modalActions, setModalActions] = useState([])
  const [errorMessage, setErrorMessage] = useState("")
  const token = searchParams.get("token")

  const validate = (value) => {
    if (
      validator.isStrongPassword(value, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
    ) {
      setErrorMessage("")
    } else {
      setErrorMessage("Weak Password!")
    }
  }
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { password, confirmPassword } = formValues

    if (password !== confirmPassword) {
      setModalType("error")
      setModalMessage("Passwords do not match.")
      setShowModal(true)
      return
    }
    try {
      const response = await User.post(`/auth/set-password?token=${token}`, {
        newPassword: formValues.password,
        confirmPassword: formValues.confirmPassword,
      })
      setModalType("success")
      setModalMessage(response.data.message || "Password set successfully.")

      setModalActions([
        {
          label: "Sign In",
          onClick: () => navigate("/auth"),
        },
        {
          label: "Close",
          onClick: () => setShowModal(false),
        },
      ])
      setShowModal(true)
      setFormValues(initialState)
    } catch (error) {
      console.error(error)
      setModalType("error")
      setModalMessage(error.response?.data?.error || "Something went wrong.")
      setModalActions([])
      setShowModal(true)
    }
  }

  return (
    <>
      <div className="wrapper">
        <h1 className="form-title">Password Setup</h1>
        <div className="registeration-form">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            onChange={(e) => {
              handleChange(e)
              validate(e.target.value)
            }}
            value={formValues.password}
            required
          />
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            onChange={handleChange}
            value={formValues.confirmPassword}
            required
          />
          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <button
            type="submit"
            disabled={
              !formValues.password ||
              !formValues.confirmPassword ||
              formValues.password !== formValues.confirmPassword
            }
            onClick={(e) => handleSubmit(e)}
          >
            Set Password
          </button>
        </div>
        <FeedbackModal
          show={showModal}
          type={modalType}
          message={modalMessage}
          actions={modalActions}
          onClose={() => {
            setShowModal(false)
            setModalActions([])
          }}
        />
      </div>
    </>
  )
}

export default SetPassword
