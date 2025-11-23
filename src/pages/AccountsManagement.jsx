import { useState, useEffect } from "react"
import User from "../services/api"
import { useUser } from "../context/UserContext"
import FeedbackModal from "../components/FeedbackModal"
import "../../public/stylesheets/accounts-management.css"

const AccountsManagement = () => {
  const { user } = useUser()
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState("")

  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [addUserError, setAddUserError] = useState("")

  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackType, setFeedbackType] = useState("success")
  const [feedbackMessage, setFeedbackMessage] = useState("")

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [showUserInfoModal, setShowUserInfoModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  const [showEditUserModal, setShowEditUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  const [newUser, setNewUser] = useState({
    fName: "",
    lName: "",
    email: "",
    phone: "",
    licenseNo: "",
    vehiclePlateNumber: "",
  })

  const [editForm, setEditForm] = useState({
    fName: "",
    lName: "",
    email: "",
    phone: "",
    licenseNo: "",
    vehiclePlateNumber: "",
  })

  const fetchUsers = async () => {
    try {
      const response = await User.get("/profile/users")
      setUsers(response.data.users)
    } catch (error) {
      console.error(error)
    }
  }
  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (editingUser) {
      setEditForm({
        fName: editingUser.fName || "",
        lName: editingUser.lName || "",
        email: editingUser.email || "",
        phone: editingUser.phone || "",
        licenseNo: editingUser.driver?.licenseNo || "",
        vehiclePlateNumber: editingUser.driver?.vehiclePlateNumber || "",
      })
    }
  }, [editingUser])

  const filteredUsers = users?.filter((u) =>
    u?._id.toLowerCase().includes(search.toLowerCase())
  )

  // handling driver add
  const handleNewUserChange = (e) => {
    const { name, value } = e.target
    setNewUser((prev) => ({ ...prev, [name]: value }))
  }

  const resetNewUserForm = () => {
    setNewUser({
      fName: "",
      lName: "",
      email: "",
      phone: "",
      licenseNo: "",
      vehiclePlateNumber: "",
    })
    setAddUserError("")
  }

  const handleCloseModal = () => {
    setShowAddUserModal(false)
    resetNewUserForm()
  }

  const handleAddUserSubmit = async (e) => {
    e.preventDefault()
    setAddUserError("")
    setSubmitting(true)

    try {
      const payload = {
        fName: newUser.fName,
        lName: newUser.lName,
        role: "Driver",
        email: newUser.email,
        phone: newUser.phone,
        licenseNo: newUser.licenseNo,
        vehiclePlateNumber: newUser.vehiclePlateNumber,
      }

      await User.post("/drivers", payload)

      await fetchUsers()

      setFeedbackType("success")
      setFeedbackMessage("Driver has been added successfully.")
      setShowFeedbackModal(true)

      handleCloseModal()
    } catch (err) {
      console.error("Error adding driver:", err)
      const msg =
        err.response?.data?.msg ||
        err.response?.data?.error ||
        "Failed to add driver."
      setAddUserError(msg)

      setFeedbackType("error")
      setFeedbackMessage(msg)
      setShowFeedbackModal(true)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await User.put(`/drivers/${editingUser.driver._id}`, editForm)

      setUsers((prev) =>
        prev.map((u) => (u._id === editingUser._id ? { ...u, ...editForm } : u))
      )

      setFeedbackType("success")
      setFeedbackMessage("Driver updated successfully.")
      setShowFeedbackModal(true)
      setShowEditUserModal(false)
      setEditingUser(null)
    } catch (err) {
      console.error(err)
      setFeedbackType("error")
      setFeedbackMessage("Failed to update driver.")
      setShowFeedbackModal(true)
    } finally {
      setSubmitting(false)
    }
  }

  // handling driver edit

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const isFormInvalid =
    !newUser.fName ||
    !newUser.lName ||
    !newUser.email ||
    !newUser.phone ||
    !newUser.licenseNo ||
    !newUser.vehiclePlateNumber

  const askDeleteUser = (u) => {
    setDeleteTarget(u)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)

    try {
      if (deleteTarget.role === "Jeweler") {
        if (!deleteTarget.shop?._id) {
          throw new Error("Shop ID is missing for this jeweler.")
        }
        await User.delete(`/shops/${deleteTarget.shop._id}`)
      } else if (deleteTarget.role === "Driver") {
        if (!deleteTarget.driver?._id) {
          throw new Error("Driver ID is missing for this user.")
        }
        await User.delete(`/drivers/${deleteTarget.driver._id}`)
      } else {
        throw new Error("This user type cannot be deleted from here.")
      }

      setUsers((prev) => prev.filter((u) => u._id !== deleteTarget._id))

      setFeedbackType("success")
      setFeedbackMessage(
        deleteTarget.role === "Jeweler"
          ? "Jeweler and shop deleted successfully."
          : "Driver deleted successfully."
      )
    } catch (err) {
      console.error("Error deleting user:", err)
      const msg =
        err.response?.data?.msg ||
        err.response?.data?.error ||
        err.message ||
        "Failed to delete account."
      setFeedbackType("error")
      setFeedbackMessage(msg)
    } finally {
      setDeleteLoading(false)
      setShowDeleteConfirm(false)
      setDeleteTarget(null)
      setShowFeedbackModal(true)
    }
  }

  // handling info modals
  const openUserInfo = (u) => {
    setSelectedUser(u)
    setShowUserInfoModal(true)
  }

  const closeUserInfo = () => {
    setSelectedUser(null)
    setShowUserInfoModal(false)
  }

  return (
    <>
      {user?.role === "Admin" && (
        <div className="accounts-management-page">
          <div className="accounts-management-header">
            <h1>Accounts Management</h1>

            <div className="accounts-management-header-actions">
              <input
                type="text"
                placeholder="Search by User ID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                type="button"
                className="add-user-btn"
                onClick={() => setShowAddUserModal(true)}
              >
                Add Driver
              </button>
            </div>
          </div>

          <div className="accounts-management-body">
            {filteredUsers?.length === 0 ? (
              <p>No matching users.</p>
            ) : (
              <div className="users-list">
                {filteredUsers?.map((u) => (
                  <div
                    key={u._id}
                    className="user-item"
                    onClick={() => openUserInfo(u)}
                  >
                    <div className="user-item-left-side">
                      <h3>{u.role}</h3>
                      <a
                        href={`mailto:${u.email}`}
                        className="email-link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {u.email}
                      </a>
                    </div>
                    <div className="user-item-right-side">
                      <p>{u._id}</p>
                      {(u.role === "Jeweler" || u.role === "Driver") && (
                        <div
                          className="admin-actions"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {u.role === "Driver" && (
                            <p
                              className="admin-edit-action"
                              onClick={() => {
                                setEditingUser(u)
                                setShowEditUserModal(true)
                              }}
                            >
                              Edit
                            </p>
                          )}
                          <p
                            className="admin-delete-action"
                            onClick={() => askDeleteUser(u)}
                          >
                            Delete
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {showAddUserModal && (
            <div
              className="accounts-add-user-overlay"
              onClick={handleCloseModal}
            >
              <div
                className="accounts-add-user-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="add-user-modal-header">
                  <h2>Add Driver</h2>
                  <button
                    type="button"
                    className="close-modal-btn"
                    onClick={handleCloseModal}
                  >
                    ✕
                  </button>
                </div>

                <form className="add-user-form" onSubmit={handleAddUserSubmit}>
                  <div className="add-user-form-inputs">
                    <div className="inline-row">
                      <div className="add-user-form-group">
                        <label>First Name</label>
                        <input
                          type="text"
                          placeholder="First Name"
                          name="fName"
                          value={newUser.fName}
                          onChange={handleNewUserChange}
                          required
                        />
                      </div>
                      <div className="add-user-form-group">
                        <label>Last Name</label>
                        <input
                          type="text"
                          placeholder="Last Name"
                          name="lName"
                          value={newUser.lName}
                          onChange={handleNewUserChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="inline-row">
                      <div className="add-user-form-group">
                        <label>Phone</label>
                        <input
                          type="tel"
                          placeholder="0000 0000"
                          name="phone"
                          value={newUser.phone}
                          onChange={handleNewUserChange}
                          required
                        />
                      </div>
                      <div className="add-user-form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          placeholder="driver@example.com"
                          name="email"
                          value={newUser.email}
                          onChange={handleNewUserChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="inline-row">
                      <div className="add-user-form-group">
                        <label>License Number</label>
                        <input
                          type="text"
                          placeholder="000000000"
                          name="licenseNo"
                          value={newUser.licenseNo}
                          onChange={handleNewUserChange}
                          required
                        />
                      </div>
                      <div className="add-user-form-group">
                        <label>Vehicle Plate Number</label>
                        <input
                          type="text"
                          placeholder="000000"
                          name="vehiclePlateNumber"
                          value={newUser.vehiclePlateNumber}
                          onChange={handleNewUserChange}
                          required
                        />
                      </div>
                    </div>

                    {addUserError && (
                      <p className="add-user-error">{addUserError}</p>
                    )}
                  </div>
                  <div className="add-user-actions">
                    <button
                      type="button"
                      className="cancel-add-user-btn"
                      onClick={handleCloseModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="confirm-add-user-btn"
                      disabled={isFormInvalid || submitting}
                    >
                      {submitting ? "Adding..." : "Add Driver"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showEditUserModal && editingUser && (
            <div
              className="accounts-add-user-overlay"
              onClick={() => setShowEditUserModal(false)}
            >
              <div
                className="accounts-add-user-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="add-user-modal-header">
                  <h2>Edit Driver</h2>
                  <button
                    type="button"
                    className="close-modal-btn"
                    onClick={() => setShowEditUserModal(false)}
                  >
                    ✕
                  </button>
                </div>

                <form className="add-user-form" onSubmit={handleEditSubmit}>
                  <div className="add-user-form-inputs">
                    <div className="inline-row">
                      <div className="add-user-form-group">
                        <label>First Name</label>
                        <input
                          type="text"
                          name="fName"
                          value={editForm.fName}
                          onChange={handleEditChange}
                          required
                        />
                      </div>
                      <div className="add-user-form-group">
                        <label>Last Name</label>
                        <input
                          type="text"
                          name="lName"
                          value={editForm.lName}
                          onChange={handleEditChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="inline-row">
                      <div className="add-user-form-group">
                        <label>Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={editForm.phone}
                          onChange={handleEditChange}
                          required
                        />
                      </div>
                      <div className="add-user-form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          name="email"
                          value={editForm.email}
                          onChange={handleEditChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="inline-row">
                      <div className="add-user-form-group">
                        <label>License Number</label>
                        <input
                          type="text"
                          name="licenseNo"
                          value={editForm.licenseNo}
                          onChange={handleEditChange}
                          required
                        />
                      </div>
                      <div className="add-user-form-group">
                        <label>Vehicle Plate Number</label>
                        <input
                          type="text"
                          name="vehiclePlateNumber"
                          value={editForm.vehiclePlateNumber}
                          onChange={handleEditChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="add-user-actions">
                    <button
                      type="button"
                      className="cancel-add-user-btn"
                      onClick={() => setShowEditUserModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="confirm-add-user-btn"
                      disabled={submitting}
                    >
                      {submitting ? "Updating..." : "Update Driver"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showUserInfoModal && selectedUser && (
            <div className="accounts-add-user-overlay" onClick={closeUserInfo}>
              <div
                className="accounts-add-user-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="add-user-modal-header">
                  <h2>User Information</h2>
                  <button
                    type="button"
                    className="close-modal-btn"
                    onClick={closeUserInfo}
                  >
                    ✕
                  </button>
                </div>

                <div className="user-info-modal-body">
                  <span className="user-info-field">
                    <h6>Role</h6>
                    <p>{selectedUser.role}</p>
                  </span>
                  {selectedUser.role === "Jeweler" && selectedUser.shop && (
                    <>
                      <span className="user-info-field">
                        <h6>Shop Name</h6>
                        <p>{selectedUser.shop.name}</p>
                      </span>
                    </>
                  )}

                  {selectedUser.role != "Jeweler" && (
                    <span className="user-info-field">
                      <h6>Name</h6>
                      <p>
                        {(selectedUser.fName || "") +
                          " " +
                          (selectedUser.lName || "")}
                      </p>
                    </span>
                  )}

                  <span className="user-info-field">
                    <h6>Email</h6>
                    <p>{selectedUser.email}</p>
                  </span>

                  <span className="user-info-field">
                    <h6>Phone</h6>
                    <p>{selectedUser.phone}</p>
                  </span>
                </div>
              </div>
            </div>
          )}

          <FeedbackModal
            show={showFeedbackModal}
            type={feedbackType}
            message={feedbackMessage}
            onClose={() => setShowFeedbackModal(false)}
            actions={[
              {
                label: "OK",
                onClick: () => setShowFeedbackModal(false),
              },
            ]}
          />

          <FeedbackModal
            show={showDeleteConfirm}
            type="confirm"
            message={
              deleteTarget
                ? deleteTarget.role === "Jeweler"
                  ? "Are you sure you want to delete this jeweler and their shop? This will also remove related data such as products and orders."
                  : "Are you sure you want to delete this driver account?"
                : ""
            }
            onClose={() => {
              if (deleteLoading) return
              setShowDeleteConfirm(false)
              setDeleteTarget(null)
            }}
            actions={[
              {
                label: deleteLoading ? "Deleting..." : "Confirm Delete",
                onClick: () => {
                  if (!deleteLoading) handleConfirmDelete()
                },
              },
              {
                label: "Cancel",
                onClick: () => {
                  if (deleteLoading) return
                  setShowDeleteConfirm(false)
                  setDeleteTarget(null)
                },
              },
            ]}
          />
        </div>
      )}
    </>
  )
}

export default AccountsManagement
