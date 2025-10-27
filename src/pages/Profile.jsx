import { useState, useEffect, useContext } from "react"
import { useParams } from "react-router-dom"
import validator from "validator"

import { useUser } from "../context/UserContext"
import { ThemeContext } from "../context/ThemeContext"
import LocationMap from "../components/LocationMap"
import FeedbackModal from "../components/FeedbackModal"
import CustomerOrders from "../components/CustomerOrders"
import User from "../services/api"

import accountIcon from "../assets/account.png"
import logout from "../assets/logout.png"
import themeIcon from "../assets/theme.png"
import editIcon from "../assets/edit.png"
import deleteIcon from "../assets/delete.png"
import "../../public/stylesheets/profile.css"

const Profile = () => {
  const { userId } = useParams()
  const { user, handleLogOut } = useUser()
  const { toggleTheme } = useContext(ThemeContext)

  const [profile, setProfile] = useState()
  const [logoFile, setLogoFile] = useState(null)
  const [errorMessage, setErrorMessage] = useState("")
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

  const [userInfo, setUserInfo] = useState({
    fName: "",
    lName: "",
    phone: "",
    email: "",
  })

  const [shopInfo, setShopInfo] = useState({
    name: "",
    cr: "",
    description: "",
  })

  const [jewelerAddress, setJewelerAddress] = useState({
    governante: "",
    area: "",
    road: "",
    building: "",
    latitude: null,
    longitude: null,
  })
  const [customerAddress, setCustomerAddress] = useState({
    _id: null,
    name: "",
    road: "",
    building: "",
    house: "",
    governante: "",
    area: "",
    latitude: null,
    longitude: null,
    setDefault: false,
  })

  const [addresses, setAddresses] = useState([])
  const [activeAddress, setActiveAddress] = useState(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [passwordValues, setPasswordValues] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const views = {
    Jeweler: ["Address"],
    Customer: ["Addresses", "Orders"],
  }

  const [view, setView] = useState("Account Information")
  const [showManual, setShowManual] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalMessage, setModalMessage] = useState("")

  useEffect(() => {
    const getProfile = async () => {
      const response = await User.get(`/profile/`)
      const data = response.data
      setProfile(data)
      console.log(data)

      setUserInfo({
        fName: data.user.fName || "",
        lName: data.user.lName || "",
        phone: data.user.phone || "",
        email: data.user.email || "",
      })

      setShopInfo({
        name: data.shop?.name || "",
        cr: data.shop?.cr || "",
        description: data.shop?.description || "",
      })

      const address = data.user.addresses?.[0]
      setJewelerAddress({
        governante: address?.governante || "",
        area: address?.area || "",
        road: address?.road || "",
        building: address?.building || "",
        latitude: address?.coordinates?.[0] || null,
        longitude: address?.coordinates?.[1] || null,
      })

      setAddresses(data.user.addresses || [])
    }

    getProfile()
  }, [userId])

  const handleUpdate = async () => {
    try {
      // Update user info
      await User.put("/profile/", userInfo)

      // Update shop info
      if (user.role === "Jeweler" && profile?.shop?._id) {
        // If a logo file was selected, use FormData
        if (logoFile) {
          const formData = new FormData()
          formData.append("name", shopInfo.name)
          formData.append("cr", shopInfo.cr)
          formData.append("description", shopInfo.description)
          formData.append("image", logoFile)

          await User.put(`/shops/${profile.shop._id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          })
        } else {
          // No new logo
          await User.put(`/shops/${profile.shop._id}`, shopInfo)
        }
      }

      setModalMessage("Profile updated successfully.")
      setShowModal(true)
    } catch (error) {
      console.error("Update failed:", error)
      setModalMessage("Update failed. Please try again.")
      setShowModal(true)
    }
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setLogoFile(file)
      // Optional: show live preview
      const reader = new FileReader()
      reader.onload = (ev) => {
        setProfile((prev) => ({
          ...prev,
          shop: { ...prev.shop, logo: ev.target.result },
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  // address handling

  const handleAddressUpdate = async () => {
    try {
      const addressPayload = {
        name: "Main Address",
        road: jewelerAddress.road,
        building: jewelerAddress.building,
        governante: jewelerAddress.governante,
        area: jewelerAddress.area,
        coordinates: [jewelerAddress.latitude, jewelerAddress.longitude],
        setDefault: true,
      }

      const defaultAddressId = profile?.user?.defaultAddress
      if (!defaultAddressId) {
        await User.post("/addresses/", addressPayload)
      } else {
        await User.put(`/addresses/${defaultAddressId}`, addressPayload)
      }
    } catch (error) {
      console.error("Address update failed:", error)
    }
  }

  const startAddAddress = () => {
    setActiveAddress(null)
    setCustomerAddress({
      _id: null,
      name: "",
      road: "",
      building: "",
      house: "",
      governante: "",
      area: "",
      latitude: null,
      longitude: null,
      setDefault: false,
    })
  }

  const startEditAddress = (address) => {
    setActiveAddress(address)
    setShowAddressForm(true)
    setCustomerAddress({
      ...address,
      latitude: address.coordinates?.[0] || null,
      longitude: address.coordinates?.[1] || null,
      setDefault: false,
    })
  }

  const handleCustomerAddressSubmit = async () => {
    try {
      const payload = {
        name: customerAddress.name,
        road: customerAddress.road,
        building: customerAddress.building,
        house: customerAddress.house,
        governante: customerAddress.governante,
        area: customerAddress.area,
        coordinates: [customerAddress.latitude, customerAddress.longitude],
        setDefault: customerAddress.setDefault,
      }

      if (activeAddress?._id) {
        await User.put(`/addresses/${activeAddress._id}`, payload)
      } else {
        await User.post("/addresses/", payload)
      }

      const response = await User.get(`/profile/`)
      setAddresses(response.data.user.addresses)
      setShowAddressForm(false)
      setActiveAddress(null)
    } catch (err) {
      console.error("Address update failed:", err)
    }
  }

  const setAsDefault = async (addressId) => {
    try {
      await User.put(`/addresses/${addressId}`, {
        setDefault: true,
      })

      const response = await User.get(`/profile/`)
      setProfile(response.data)
      setAddresses(response.data.user.addresses)
    } catch (error) {
      console.error("Failed to set default address:", error)
    }
  }

  const deleteAddress = async (addressId) => {
    try {
      await User.delete(`/addresses/${addressId}`)
      setAddresses((prev) => prev.filter((addr) => addr._id !== addressId))
    } catch (error) {
      console.error("Failed to delete address", error)
    }
  }

  // password handling
  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }))
  }

  const updatePassword = async () => {
    try {
      const response = await User.put("/auth/update-password", passwordValues)
      setErrorMessage("")

      if (response.status === 200) {
        setErrorMessage("")
        setModalMessage("Your password has been updated successfully.")
        setShowModal(true)
      }
      setPasswordValues({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      if (error.response) {
        const serverMessage =
          error.response.data?.msg ||
          error.response.data?.error ||
          "Something went wrong."
        setErrorMessage(serverMessage)
      } else {
        setErrorMessage("Network error or server did not respond.")
      }
      setPasswordValues({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    }
  }

  const forgetPassword = async () => {
    try {
      const response = await User.post("/auth/forget-password")
      setModalMessage("A password reset link has been sent to your email.")
      setShowModal(true)
      setErrorMessage("")
    } catch (error) {
      console.error("Forget password error:", error)

      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.msg ||
        "Failed to send reset link."
      setErrorMessage(errorMsg)
    }
  }

  return (
    <>
      <div className="profile">
        <div className="profile-left">
          <div className="profile-image-wrapper">
            <img
              src={profile?.shop?.logo ? profile.shop.logo : accountIcon}
              alt={
                profile
                  ? user.role === "Jeweler"
                    ? profile.shop.name
                    : `${profile.user.fName} ${profile.user.lName}`
                  : "User Logo"
              }
              className="profile-image"
            />

            {user.role === "Jeweler" && (
              <>
                <label htmlFor="profile-upload" className="upload-btn">
                  +
                </label>
                <input
                  type="file"
                  id="profile-upload"
                  accept="image/*"
                  hidden
                  onChange={handleLogoChange}
                />
              </>
            )}
          </div>

          <h2 className="jeweler-name">
            {profile
              ? user.role === "Jeweler"
                ? profile.shop.name
                : profile.user.fName + " " + profile.user.lName
              : null}
          </h2>
          {profile ? profile.user.email : null}
          <span className="profile-icons">
            <img
              src={themeIcon}
              alt="Theme Icon"
              className="icon"
              onClick={toggleTheme}
            />
            <img
              src={logout}
              alt="Sign out"
              className="icon"
              onClick={() => handleLogOut()}
            />
          </span>
        </div>

        <div className="profile-right">
          <div className="profile-navbar">
            <a
              onClick={() => setView("Account Information")}
              className={view === "Account Information" ? "active" : ""}
            >
              Account Information
            </a>

            {profile &&
              views[user.role]?.map((v) => (
                <a
                  key={v}
                  onClick={() => setView(v)}
                  className={view === v ? "active" : ""}
                >
                  {v}
                </a>
              ))}

            <a
              onClick={() => setView("Password")}
              className={view === "Password" ? "active" : ""}
            >
              Password
            </a>
          </div>

          <div className="profile-details">
            {view === "Account Information" && (
              <div className="account-information">
                <div className="account-information-inputs">
                {user?.role === "Jeweler" ? (
                  <>
                    <label>Business Name</label>
                    <input
                      type="text"
                      value={shopInfo.name}
                      onChange={(e) =>
                        setShopInfo({ ...shopInfo, name: e.target.value })
                      }
                    />
                  </>
                ) : (
                  <>
                    <label>First Name</label>
                    <input
                      type="text"
                      value={userInfo.fName}
                      onChange={(e) =>
                        setUserInfo({ ...userInfo, fName: e.target.value })
                      }
                    />
                    <label>Last Name</label>
                    <input
                      type="text"
                      value={userInfo.lName}
                      onChange={(e) =>
                        setUserInfo({ ...userInfo, lName: e.target.value })
                      }
                    />
                  </>
                )}

                <label>Email</label>
                <input
                  type="email"
                  value={userInfo.email}
                  onChange={(e) =>
                    setUserInfo({ ...userInfo, email: e.target.value })
                  }
                />

                <label>Phone</label>
                <input
                  type="text"
                  value={userInfo.phone}
                  onChange={(e) =>
                    setUserInfo({ ...userInfo, phone: e.target.value })
                  }
                />

                {user?.role === "Jeweler" && (
                  <>
                    <label>Commercial Record (C.R)</label>
                    <input
                      type="text"
                      value={shopInfo.cr}
                      onChange={(e) =>
                        setShopInfo({ ...shopInfo, cr: e.target.value })
                      }
                    />
                    <label>Description</label>
                    <textarea
                      rows="6"
                      value={shopInfo.description}
                      onChange={(e) =>
                        setShopInfo({
                          ...shopInfo,
                          description: e.target.value,
                        })
                      }
                    ></textarea>
                  </>
                )}</div>

                <button className="update-button" onClick={handleUpdate}>
                  Update
                </button>
              </div>
            )}
            {view === "Address" && user.role === "Jeweler" && (
              <div className="address-view">
                <h3 className="address-view-title">Location</h3>
                <LocationMap
                  position={
                    jewelerAddress.latitude && jewelerAddress.longitude
                      ? [jewelerAddress.latitude, jewelerAddress.longitude]
                      : null
                  }
                  onChange={(newPos) =>
                    setJewelerAddress((prev) => ({
                      ...prev,
                      latitude: newPos[0],
                      longitude: newPos[1],
                    }))
                  }
                />

                <div
                  className="manual-toggle"
                  onClick={() => setShowManual((prev) => !prev)}
                >
                  <h3> Manual Specification</h3>
                  <span>{showManual ? "–" : "+"}</span>
                </div>

                {showManual && (
                  <div className="manual-address">
                    <label>Governante</label>
                    <input
                      type="text"
                      value={jewelerAddress.governante}
                      onChange={(e) =>
                        setJewelerAddress({
                          ...jewelerAddress,
                          governante: e.target.value,
                        })
                      }
                    />
                    <label>Area</label>
                    <input
                      type="text"
                      value={jewelerAddress.area}
                      onChange={(e) =>
                        setJewelerAddress({
                          ...jewelerAddress,
                          area: e.target.value,
                        })
                      }
                    />
                    <label>Road</label>
                    <input
                      type="text"
                      value={jewelerAddress.road}
                      onChange={(e) =>
                        setJewelerAddress({
                          ...jewelerAddress,
                          road: e.target.value,
                        })
                      }
                    />
                    <label>Building</label>
                    <input
                      type="text"
                      value={jewelerAddress.building}
                      onChange={(e) =>
                        setJewelerAddress({
                          ...jewelerAddress,
                          building: e.target.value,
                        })
                      }
                    />
                  </div>
                )}

                <button className="update-button" onClick={handleAddressUpdate}>
                  Update Address
                </button>
              </div>
            )}
            {view === "Addresses" && user.role === "Customer" && (
              <div>
                <h3>Addresses</h3>
                <div className="customer-addresses">
                  {addresses.map((a, index) => {
                    console.log(
                      "Default address:",
                      profile?.user?.defaultAddress
                    )
                    console.log(
                      "Addresses list:",
                      addresses.map((a) => a._id)
                    )

                    return (
                      <div key={a._id}>
                        <span className="inline">
                          <h4>{a.name || `Shipping Address ${index + 1}`}</h4>

                          <img
                            src={editIcon}
                            alt="edit icon"
                            className="icon"
                            onClick={() => startEditAddress(a)}
                          />
                          <img
                            src={deleteIcon}
                            alt="delete icon"
                            className="icon"
                            onClick={() => deleteAddress(a._id)}
                          />

                          <span className="default-action">
                            {String(profile.user.defaultAddress?._id) ===
                            String(a._id) ? (
                              <button className="default-label">Default</button>
                            ) : (
                              <button
                                className="default-button"
                                onClick={() => setAsDefault(a._id)}
                              >
                                Mark as Default
                              </button>
                            )}
                          </span>
                        </span>
                        <div className="address-details">
                          {a.governante && <p>{a.governante}</p>}
                          {a.road && <p>{a.road}</p>}
                          {a.building && <p>{a.building}</p>}
                        </div>
                      </div>
                    )
                  })}

                  {!showAddressForm && (
                    <button
                      onClick={() => {
                        startAddAddress()
                        setShowAddressForm(true)
                      }}
                      title="Add Address"
                      className="add-address"
                    >
                      +
                    </button>
                  )}

                  {showAddressForm && (
                    <div className="address-form">
                      <h4>
                        {activeAddress ? customerAddress.name : "New Address"}
                      </h4>

                      <input
                        type="text"
                        placeholder="Name"
                        value={customerAddress.name}
                        onChange={(e) =>
                          setCustomerAddress({
                            ...customerAddress,
                            name: e.target.value,
                          })
                        }
                      />

                      <select
                        value={customerAddress.governante}
                        onChange={(e) =>
                          setCustomerAddress({
                            ...customerAddress,
                            governante: e.target.value,
                          })
                        }
                        className="governante-select"
                      >
                        <option value="">Select Governate</option>
                        <option value="Capital">Capital</option>
                        <option value="Muharraq">Muharraq</option>
                        <option value="Northern">Northern</option>
                        <option value="Southern">Southern</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Area"
                        value={customerAddress.area}
                        onChange={(e) =>
                          setCustomerAddress({
                            ...customerAddress,
                            area: e.target.value,
                          })
                        }
                      />

                      <input
                        type="text"
                        placeholder="Road"
                        value={customerAddress.road}
                        onChange={(e) =>
                          setCustomerAddress({
                            ...customerAddress,
                            road: e.target.value,
                          })
                        }
                      />

                      <input
                        type="text"
                        placeholder="Building"
                        value={customerAddress.building}
                        onChange={(e) =>
                          setCustomerAddress({
                            ...customerAddress,
                            building: e.target.value,
                          })
                        }
                      />

                      <LocationMap
                        position={
                          customerAddress.latitude && customerAddress.longitude
                            ? [
                                customerAddress.latitude,
                                customerAddress.longitude,
                              ]
                            : null
                        }
                        onChange={(newPos) => {
                          setCustomerAddress((prev) => ({
                            ...prev,
                            latitude: newPos[0],
                            longitude: newPos[1],
                          }))
                        }}
                      />

                      <div className="inline">
                        <button
                          className="update-button"
                          onClick={handleCustomerAddressSubmit}
                        >
                          {activeAddress ? "Update Address" : "Add Address"}
                        </button>
                        <button
                          className="cancel-button"
                          onClick={() => {
                            setShowAddressForm(false)
                            setActiveAddress(null)
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {view === "Password" && (
              <>
                <div className="password-view">
                  <div>
                    {" "}
                    <h3>Change password</h3>
                    <p className="clarification">
                      Your password must be at least 8 characters and should
                      include a combination of numbers, letters, and special
                      characters (!$@%).
                    </p>
                  </div>

                  <div className="password-inputs">
                    <input
                      type="password"
                      name="oldPassword"
                      value={passwordValues.oldPassword}
                      placeholder="Old password"
                      onChange={(e) => {
                        handlePasswordChange(e)
                      }}
                    />
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordValues.newPassword}
                      placeholder="New password"
                      onChange={(e) => {
                        handlePasswordChange(e)
                        validate(e.target.value)
                      }}
                    />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordValues.confirmPassword}
                      placeholder="Re-type new password"
                      onChange={handlePasswordChange}
                    />
                    <a
                      className="forgot-password"
                      onClick={() => forgetPassword()}
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <div className="password">
                    {errorMessage && (
                      <span className="error">{errorMessage}</span>
                    )}

                    <button
                      className="change-password"
                      disabled={
                        passwordValues.newPassword !=
                          passwordValues.confirmPassword || errorMessage
                      }
                      onClick={() => updatePassword()}
                    >
                      Change Password
                    </button>
                  </div>
                </div>
              </>
            )}{" "}
            {view === "Orders" && (
              <>
                <CustomerOrders />
              </>
            )}
          </div>
        </div>
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

export default Profile
