import { useState } from "react"
import { SignUpUser } from "../services/Auth"
import { useNavigate } from "react-router-dom"

import "../../public/styleSheets/auth.css"
import validator from "validator"
import authImage from "../assets/auth.jpg"

const SignUp = () => {
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
      const payload = await SignUpUser(formValues)
      if (payload) {
        setFormValues(initialState)
        navigate("/sign-in")
      }
    } catch (error) {
      setErrorMessage(error.message)
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
          className="sign-up-container"
        >
          <h1 className="form-title">Sign Up</h1>

          <div className="signUp-form">
            <form onSubmit={handleSubmit} className="sign-up">
              <div className="name-row">
                <div>
                  <label>First Name</label>
                  <input
                    type="text"
                    name="fName"
                    placeholder="First Name"
                    onChange={handleChange}
                    value={formValues.fName}
                    required
                  />
                </div>
                <div>
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lName"
                    placeholder="Last Name"
                    onChange={handleChange}
                    value={formValues.lName}
                  />
                </div>
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
                  id="phone-input"
                  placeholder="0000 0000"
                  onChange={handleChange}
                  value={formValues.phone}
                  required
                />
              </div>
              {formValues.phone && !/^\d{8}$/.test(formValues.phone) && (
                <span className="error">* Phone number must be 8 digits</span>
              )}

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
              </div>

              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                id="confirm-password"
                onChange={handleChange}
                value={formValues.confirmPassword}
                required
                autoComplete="off"
              />

              {errorMessage && <span className="error">{errorMessage}</span>}

              <button
                disabled={
                  !formValues.fName ||
                  !formValues.email ||
                  !formValues.phone ||
                  !/^\d{8}$/.test(formValues.phone) ||
                  !formValues.password ||
                  !formValues.confirmPassword ||
                  formValues.password !== formValues.confirmPassword
                }
              >
                Sign Up
              </button>

              <p id="switch">
                <button
                  type="button"
                  className="switch"
                  onClick={() => navigate("/sign-in")}
                >
                  Already have an Account? Sign In
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default SignUp
