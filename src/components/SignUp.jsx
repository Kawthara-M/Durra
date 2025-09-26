import { useState } from "react"
import { SignUpUser } from "../services/Auth"
import { useNavigate } from "react-router-dom"

import "../../public/styleSheets/auth.css"

import validator from "validator"

const SignUp = ({ setShowSignUp }) => {
  let navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState("")

  const initialState = {
    fName: "",
    lName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "Customer",
  }

  const [formValues, setFormValues] = useState(initialState)

  const handleChange = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value })
  }
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage("")

    try {
      console.log(formValues)
      const payload = await SignUpUser(formValues)
      if (payload) {
        setFormValues(initialState)
        setShowSignUp(false)
        // navigate("/auth/sign-in")
      }
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  return (
    <div className="wrapper">
      <h2 className="form-title">Sign Up</h2>
      <div className="signUp-form">
        <form onSubmit={handleSubmit} className="sign-up">
          <div className="name-row">
            <label>
              First Name
              <input
                type="text"
                name="fName"
                placeholder="First Name"
                onChange={handleChange}
                value={formValues.fName}
                required
              />
            </label>

            <label>
              Last Name
              <input
                type="text"
                name="lName"
                placeholder="Last Name"
                onChange={handleChange}
                value={formValues.lName}
              />
            </label>
          </div>

          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            placeholder="user@example.com"
            onChange={handleChange}
            value={formValues.email}
            required
            autoComplete="email"
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

          <div className="password-group">
            <div className="label-with-icon">
              <label htmlFor="password">Password</label>
              <span
                className={`tooltip-icon ${
                  errorMessage ? "tooltip-error" : ""
                }`}
                title="Password must be at least 8 characters, include upper & lowercase letters, a number, and a special character."
              >
                ?
              </span>
            </div>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Password"
              onChange={(e) => {
                handleChange(e)
                validate(e.target.value)
              }}
              value={formValues.password}
              required
              autoComplete="off"
              className={errorMessage ? "input-error" : ""}
            />
            {errorMessage && <span className="error">{errorMessage}</span>}
          </div>

          <label htmlFor="confirmPassword">Comfirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            onChange={handleChange}
            value={formValues.confirmPassword}
            required
            autoComplete="off"
          />
          <button
            disabled={
              !formValues.fName ||
              !formValues.email ||
              !formValues.phone ||
              !formValues.password ||
              !formValues.confirmPassword ||
              (!formValues.password &&
                formValues.password === formValues.confirmPassword)
            }
          >
            Sign Up
          </button>
          <p id="switch">
            Already have an account?{" "}
            <button
              type="button"
              className="switch"
              onClick={() => setShowSignUp(false)}
            >
              Sign In
            </button>
          </p>
        </form>
        {errorMessage && <span className="error">{errorMessage}</span>}
      </div>
    </div>
  )
}

export default SignUp
