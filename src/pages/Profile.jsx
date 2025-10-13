import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useUser } from "../context/UserContext"
import LocationMap from "../components/LocationMap"
import User from "../services/api"

import "../../public/stylesheets/profile.css"
const Profile = () => {
  const { userId } = useParams()
  const { user } = useUser()
  const [profile, setProfile] = useState()
  const initialState = {
    fName: "",
    lName: "",
    phone: "",
    email: "",
    addresses: [],
    defaultAddress: "",
    name: "",
    cr: "",
    description: "",
    latitude: null,
    longitude: null,
  }
  const [formValues, setFormValues] = useState()

  const views = {
    Jeweler: ["Address"],
    Customer: ["Addresses", "Orders"],
  }
  const [view, setView] = useState()
  const [showManual, setShowManual] = useState(false)

  useEffect(() => {
    const getProfile = async () => {
      const response = await User.get(`/profile/`)
      const data = response.data
      setProfile(data)

      setFormValues({
        fName: data.user.fName || "",
        lName: data.user.lName || "",
        phone: data.user.phone || "",
        email: data.user.email || "",
        addresses: data.user.addresses || [],
        defaultAddress: data.user.defaultAddress || "",
        name: data.shop?.name || "",
        cr: data.shop?.cr || "",
        description: data.shop?.description || "",
        latitude: data.user.latitude || null,
        longitude: data.user.longitude || null,
      })
    }
    getProfile()
  }, [userId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleUpdate = async () => {
    try {
      const response = User.put()
    } catch (error) {}
  }

  return (
    <>
      <div className="profile">
        <div className="profile-left">
          <div className="profile-image">
            <img
              src={``}
              alt={`${
                profile
                  ? user.role === "Jeweler"
                    ? profile.shop.name
                    : profile.name
                  : null
              } Logo`}
            />
          </div>
          <h2>
            {profile
              ? user.role === "Jeweler"
                ? profile.shop.name
                : profile.name
              : null}
          </h2>
          {profile ? profile.user.email : null}
        </div>
        <div className="profile-right">
          <div className="profile-navbar">
            <a
              onClick={() => {
                setView("Account Information")
              }}
              className={view === "Account Information" ? "active" : ""}
            >
              Account Information
            </a>
            {profile
              ? views[user.role].map((v) => {
                  return (
                    <>
                      <a
                        onClick={() => {
                          setView(v)
                        }}
                        className={view === v ? "active" : ""}
                      >
                        {v}
                      </a>
                    </>
                  )
                })
              : null}
            <a
              onClick={() => {
                setView("Password")
              }}
              className={view === "Password" ? "active" : ""}
            >
              Password Settings
            </a>
            <a
              onClick={() => {
                setView("Account Settings")
              }}
              className={view === "Account Settings" ? "active" : ""}
            >
              Account Settings
            </a>{" "}
            {/* is this needed? */}
          </div>
          <div className="profile-details">
            {view && view === "Account Information" ? (
              <div className="account-information">
                <label htmlFor="name">Business Name</label>
                <input
                  type="text"
                  value={formValues.name}
                  onChange={handleChange}
                />

                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formValues.email}
                  onChange={handleChange}
                />

                <label htmlFor="phone">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formValues.phone}
                  onChange={handleChange}
                />

                <label htmlFor="cr">CR</label>
                <input
                  type="text"
                  name="cr"
                  value={formValues.cr}
                  onChange={handleChange}
                />

                <label htmlFor="description">Description</label>
                <textarea
                  name="description"
                  value={formValues.description}
                  onChange={handleChange}
                  rows="6"
                ></textarea>
                <button className="update-button" onClick={handleUpdate}>
                  Update
                </button>
              </div>
            ) : null}

            {view === "Address" && formValues ? (
              <div className="address-view">
                <h3 className="address-view-title">Pick your location</h3>

                <LocationMap
                  position={
                    formValues.latitude && formValues.longitude
                      ? [formValues.latitude, formValues.longitude]
                      : null
                  }
                  onChange={(newPos) => {
                    setFormValues((prev) => ({
                      ...prev,
                      latitude: newPos[0],
                      longitude: newPos[1],
                    }))
                  }}
                />

                <div
                  className="manual-toggle"
                  onClick={() => setShowManual((prev) => !prev)}
                >
                  <h3> Manual Specification</h3>
                  <span >{showManual ? "–" : "+"}</span>
                </div>

                {showManual && (
                  <div className="manual-address">
                    <div>
                      <label htmlFor="governante">Governante</label>
                      <input
                        type="text"
                        name="governante"
                        value={formValues.governante || ""}
                        onChange={handleChange}
                      />
                      <label htmlFor="area">Area</label>
                      <input
                        type="text"
                        name="area"
                        value={formValues.area || ""}
                        onChange={handleChange}
                      />
                      <label htmlFor="road">Road</label>
                      <input
                        type="text"
                        name="road"
                        value={formValues.road || ""}
                        onChange={handleChange}
                      />
                      <label htmlFor="building">Building</label>
                      <input
                        type="text"
                        name="building"
                        value={formValues.building || ""}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  )
}

export default Profile
