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
import editIcon from "../assets/edit.png"
import deleteIcon from "../assets/delete.png"
import "../../public/stylesheets/profile.css"

const Profile = () => {
  const { userId } = useParams()
  const { user } = useUser()
  const { toggleTheme } = useContext(ThemeContext)

  let [profile, setProfile] = useState()
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
    block: "",
    latitude: null,
    longitude: null,
  })

  const [customerAddress, setCustomerAddress] = useState({
    _id: null,
    name: "",
    road: "",
    block: "",
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
  const [modalType, setModalType] = useState("success")
  const [modalActions, setModalActions] = useState([])

  useEffect(() => {
    const getProfile = async () => {
      const response = await User.get(`/profile/`)
      const data = response.data
      setProfile(data)

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

      const addrRes = await User.get("/addresses/")
      const allAddresses = addrRes.data.addresses || []
      setAddresses(allAddresses)

      let jewelerAddrDoc = null

      if (data.user.defaultAddress) {
        jewelerAddrDoc = allAddresses.find(
          (a) => a._id === data.user.defaultAddress
        )
      }

      if (!jewelerAddrDoc && allAddresses.length > 0) {
        jewelerAddrDoc = allAddresses[0]
      }

      setJewelerAddress({
        governante: jewelerAddrDoc?.governante || "",
        area: jewelerAddrDoc?.area || "",
        road: jewelerAddrDoc?.road || "",
        block: jewelerAddrDoc?.block || "",
        latitude: jewelerAddrDoc?.coordinates?.[0] || null,
        longitude: jewelerAddrDoc?.coordinates?.[1] || null,
      })
    }

    getProfile()
  }, [userId])

  // Modals handling
  const triggerSuccessModal = (msg) => {
    setModalType("success")
    setModalMessage(msg)
    setModalActions([])
    setShowModal(true)
  }

  const openConfirmDeleteModal = (addressId, displayName) => {
    setModalType("confirm")
    setModalMessage(
      `Are you sure you want to delete "${displayName || "this address"}"?`
    )

    setModalActions([
      {
        label: "Delete",
        onClick: async () => {
          await deleteAddress(addressId)
          setShowModal(false)
          setModalActions([])
          triggerSuccessModal("Address deleted successfully.")
        },
      },
      {
        label: "Cancel",
        onClick: () => {
          setShowModal(false)
          setModalActions([])
        },
      },
    ])

    setShowModal(true)
  }

  const openConfirmProfileUpdate = () => {
    setModalType("confirm")
    setModalMessage("Are you sure you want to update your shop profile?")

    setModalActions([
      {
        label: "Update",
        onClick: async () => {
          setShowModal(false)
          setModalActions([])
          await handleUpdate()
        },
      },
      {
        label: "Cancel",
        onClick: () => {
          setShowModal(false)
          setModalActions([])
        },
      },
    ])

    setShowModal(true)
  }

  const openConfirmAccountDelete = () => {
    if (!profile?.user?._id) return

    setModalType("confirm")
    setModalMessage(
      "Are you sure you want to delete your account? This action cannot be undone."
    )

    setModalActions([
      {
        label: "Delete",
        onClick: async () => {
          try {
            // close current confirm modal
            setShowModal(false)
            setModalActions([])

            await User.delete(`/auth/${profile.user._id}`)

            setModalType("success")
            setModalMessage("Your account has been deleted successfully.")
            setModalActions([
              {
                label: "OK",
                onClick: () => {
                  setShowModal(false)
                  setModalActions([])
                  localStorage.clear()
                  window.location.href = "/"
                },
              },
            ])
            setShowModal(true)
          } catch (error) {
            console.error("Failed to delete account:", error)
            const msg =
              error.response?.data?.msg ||
              error.response?.data?.error ||
              "Failed to delete account. Please try again."

            setModalType("error")
            setModalMessage(msg)
            setModalActions([])
            setShowModal(true)
          }
        },
      },
      {
        label: "Cancel",
        onClick: () => {
          setShowModal(false)
          setModalActions([])
        },
      },
    ])

    setShowModal(true)
  }

  const handleUpdate = async () => {
    try {
      await User.put("/profile/", userInfo)

      if (user.role === "Jeweler" && profile?.shop?._id) {
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
          await User.put(`/shops/${profile.shop._id}`, shopInfo)
        }
      }

      setProfile((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          ...userInfo,
        },
        shop: prev.shop
          ? {
              ...prev.shop,
              ...shopInfo,
            }
          : prev.shop,
      }))

      setModalType("success")
      setModalMessage(
        user.role === "Jeweler"
          ? "Your jeweler profile has been updated successfully."
          : "Profile updated successfully."
      )
      setModalActions([])
      setShowModal(true)
    } catch (error) {
      console.error("Update failed:", error)

      const msg =
        error.response?.data?.msg ||
        error.response?.data?.error ||
        "Update failed. Please try again."

      setModalType("error")
      setModalMessage(msg)
      setModalActions([])
      setShowModal(true)
    }
  }

  const validatePhone = (value) => {
    const isValid = /^[0-9]{8}$/.test(value)
    return isValid
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setLogoFile(file)
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

  // Jeweler address handling
  const handleAddressUpdate = async () => {
    try {
      const addressPayload = {
        name: `${profile.shop.name} Address`,
        road: jewelerAddress.road,
        block: jewelerAddress.block,
        governante: jewelerAddress.governante,
        area: jewelerAddress.area,
        coordinates: [jewelerAddress.latitude, jewelerAddress.longitude],
        setDefault: true,
      }

      const defaultAddressId = profile?.user?.defaultAddress

      if (!defaultAddressId) {
        await User.post("/addresses/", addressPayload)

        const [profileRes, addrRes] = await Promise.all([
          User.get("/profile/"),
          User.get("/addresses/"),
        ])

        setProfile(profileRes.data)
        setAddresses(addrRes.data.addresses || [])

        const allAddresses = addrRes.data.addresses || []
        const defaultAddr = allAddresses.find(
          (a) => a._id === profileRes.data.user.defaultAddress
        )
        if (defaultAddr) {
          setJewelerAddress({
            governante: defaultAddr.governante || "",
            area: defaultAddr.area || "",
            road: defaultAddr.road || "",
            block: defaultAddr.block || "",
            latitude: defaultAddr.coordinates?.[0] || null,
            longitude: defaultAddr.coordinates?.[1] || null,
          })
        }

        triggerSuccessModal("Your address has been added successfully.")
      } else {
        await User.put(`/addresses/${defaultAddressId}`, addressPayload)

        const addrRes = await User.get("/addresses/")
        setAddresses(addrRes.data.addresses || [])

        triggerSuccessModal("Your address has been updated successfully.")
      }
    } catch (error) {
      console.error("Address update failed:", error)
    }
  }

  // Customer address handling
  const startAddAddress = () => {
    setActiveAddress(null)
    setCustomerAddress({
      _id: null,
      name: "",
      road: "",
      block: "",
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
        block: customerAddress.block,
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

      const response = await User.get(`/addresses/`)
      setAddresses(response.data.addresses)
      setShowAddressForm(false)
      setActiveAddress(null)

      triggerSuccessModal("Your addresses have been updated successfully.")
    } catch (err) {
      console.error("Address update failed:", err)
    }
  }

  const setAsDefault = async (addressId) => {
    try {
      await User.put(`/addresses/${addressId}`, {
        setDefault: true,
      })

      const response = await User.get(`/addresses/`)
      const profileres = await User.get("/profile/")
      setProfile(profileres.data)
      setAddresses(response.data.addresses)
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
        setPasswordValues({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        })

        triggerSuccessModal("Your password has been updated successfully.")
      }
    } catch (error) {
      const serverMessage =
        error.response?.data?.msg ||
        error.response?.data?.error ||
        "Something went wrong."

      setErrorMessage("")

      setPasswordValues({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      setModalType("error")
      setModalMessage(serverMessage)
      setModalActions([])
      setShowModal(true)
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

  const passwordsMismatch =
    passwordValues.newPassword &&
    passwordValues.confirmPassword &&
    passwordValues.newPassword !== passwordValues.confirmPassword

  return (
    <>
      <div className="profile">
        <div className="profile-left">
          <div className="profile-image-wrapper">
            <img
              src={profile?.shop?.logo ? profile.shop.logo : accountIcon}
              alt={
                profile
                  ? user?.role === "Jeweler"
                    ? profile.shop.name
                    : `${profile?.user?.fName} ${profile?.user?.lName}`
                  : "User Logo"
              }
              className="profile-image"
            />

            {user?.role === "Jeweler" && (
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
                : profile?.user?.fName + " " + profile?.user?.lName
              : null}
          </h2>
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
            {/* Account Information View */}
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
                    maxLength={8}
                    onChange={(e) => {
                      const value = e.target.value

                      if (!/^\d*$/.test(value)) return

                      setUserInfo({ ...userInfo, phone: value })
                    }}
                    onBlur={() => {
                      if (!validatePhone(userInfo.phone)) {
                        setErrorMessage(
                          "Phone number must be exactly 8 digits."
                        )
                      } else {
                        setErrorMessage("")
                      }
                    }}
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
                  )}
                </div>
<div>
                {user?.role === "Customer" && (
                  <button
                    type="button"
                    className="delete-account-link"
                    onClick={openConfirmAccountDelete}
                  >
                    Delete Account
                  </button>
                )}

                <button
                  className="update-button"
                  disabled={!validatePhone(userInfo.phone)}
                  onClick={
                    user?.role === "Jeweler"
                      ? openConfirmProfileUpdate
                      : handleUpdate
                  }
                >
                  Update
                </button></div>
              </div>
            )}

            {/* Jeweler Address View */}
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
                    <select
                      value={jewelerAddress.governante}
                      onChange={(e) =>
                        setJewelerAddress({
                          ...jewelerAddress,
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
                    <label>Block</label>
                    <input
                      type="text"
                      value={jewelerAddress.block}
                      onChange={(e) =>
                        setJewelerAddress({
                          ...jewelerAddress,
                          block: e.target.value,
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

            {/* Customer Addresses View */}
            {view === "Addresses" && user.role === "Customer" && (
              <div>
                <div className="customer-address-header">
                  <h3>Addresses</h3>
                  {!showAddressForm && (
                    <button
                      onClick={() => {
                        startAddAddress()
                        setShowAddressForm(true)
                      }}
                      title="Add Address"
                      className="add-address"
                    >
                      Add Address
                    </button>
                  )}
                </div>
                <div className="customer-addresses">
                  {showAddressForm && !activeAddress && (
                    <div className="address-form">
                      <h4>New Address</h4>

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

                      <div className="road-block-row">
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
                          placeholder="Block"
                          value={customerAddress.block}
                          onChange={(e) =>
                            setCustomerAddress({
                              ...customerAddress,
                              block: e.target.value,
                            })
                          }
                        />
                      </div>

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
                          Add Address
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

                  {addresses.map((a, index) => {
                    const isEditingThis =
                      showAddressForm && activeAddress?._id === a._id

                    return (
                      <div key={a._id} style={{ marginBottom: "1rem" }}>
                        <span className="inline">
                          <h4>{a.name || `Address ${index + 1}`}</h4>

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
                            onClick={() =>
                              openConfirmDeleteModal(
                                a._id,
                                a.name || `Address ${index + 1}`
                              )
                            }
                          />

                          <span className="default-action">
                            {profile?.user?.defaultAddress === a._id ? (
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
                          {[
                            a.governante && `${a.governante} Governante`,
                            a.area && a.area,
                            a.road && `Road: ${a.road}`,
                            a.block && `Block: ${a.block}`,
                          ]
                            .filter(Boolean)
                            .map((item, index, arr) => (
                              <span key={index}>
                                <h6>{item}</h6>
                                {index < arr.length - 1 ? "," : ""}
                              </span>
                            ))}
                        </div>

                        {isEditingThis && (
                          <div className="address-form">
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

                            <div className="road-block-row">
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
                                placeholder="Block"
                                value={customerAddress.block}
                                onChange={(e) =>
                                  setCustomerAddress({
                                    ...customerAddress,
                                    block: e.target.value,
                                  })
                                }
                              />
                            </div>

                            <LocationMap
                              position={
                                customerAddress.latitude &&
                                customerAddress.longitude
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
                                Update Address
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
                    )
                  })}
                </div>
              </div>
            )}

            {/* Password View */}
            {view === "Password" && (
              <>
                <div className="password-view">
                  <div>
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
                      onChange={handlePasswordChange}
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
                    <a className="forgot-password" onClick={forgetPassword}>
                      Forgot your password?
                    </a>
                  </div>

                  <div className="password">
                    {errorMessage && (
                      <span className="error">{errorMessage}</span>
                    )}

                    {passwordsMismatch && !errorMessage && (
                      <span className="error">
                        New password and confirmation do not match.
                      </span>
                    )}

                    <button
                      className="change-password"
                      disabled={
                        !passwordValues.oldPassword ||
                        !passwordValues.newPassword ||
                        !passwordValues.confirmPassword ||
                        !!errorMessage ||
                        passwordsMismatch
                      }
                      onClick={updatePassword}
                    >
                      Change Password
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Orders View */}
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
          type={modalType}
          message={modalMessage}
          actions={modalActions}
          onClose={() => {
            setShowModal(false)
            setModalActions([])
          }}
        />
      )}
    </>
  )
}

export default Profile
