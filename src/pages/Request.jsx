import { useState, useEffect } from "react"
import User from "../services/api"
import { useUser } from "../context/UserContext"
import "../../public/stylesheets/requests.css"

const Request = ({ requestId, onClose, onRequestUpdated }) => {
  const { user } = useUser()
  const [request, setRequest] = useState()
  const [adminNote, setAdminNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!requestId) return

    const fetchRequest = async () => {
      try {
        const response = await User.get(`/requests/${requestId}`)
        const fetchedRequest = response.data.request
        setRequest(fetchedRequest)

        if (fetchedRequest?.adminNote) {
          setAdminNote(fetchedRequest.adminNote)
        } else {
          setAdminNote("")
        }
      } catch (error) {
        console.error("Error fetching request:", error)
      }
    }

    fetchRequest()
  }, [requestId])

  const updateRequest = async (status) => {
    if (!request) return
    try {
      setIsSubmitting(true)

      await User.put(`/requests/${requestId}`, {
        status,
        adminNote,
      })

      const updatedRequest = {
        ...request,
        status,
        adminNote,
      }

      setRequest(updatedRequest)
      if (onRequestUpdated) {
        onRequestUpdated(updatedRequest)
      }
    } catch (error) {
      console.error("Error updating request:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user || user.role !== "Admin" || !requestId || !request) return null

  return (
    <div className="request-modal-backdrop" onClick={onClose}>
      <div
        className="request-modal"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="request-modal-header">
          <div>
            <h1>{request?.details.name}</h1>
            <p className="request-status-pill">
              {request?.status.charAt(0).toUpperCase() +
                request?.status.slice(1)}
            </p>
          </div>
          <button className="request-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="request-modal-body">
          <div className="request-page-body-details">
            <div>
              <h2>Request Details</h2>
              <div className="req-details-rows">
                <span className="req-details-row">
                  <h3>Email</h3>
                  <p>{request?.details.email}</p>
                </span>
                <span className="req-details-row">
                  <h3>Contact Number</h3>
                  <p>{request?.details.phone}</p>
                </span>
                <span className="req-details-row">
                  <h3>Commercial Record (C.R)</h3>
                  <p>{request?.details.cr}</p>
                </span>
              </div>
            </div>

            <div className="request-item-actions">
              {request?.status === "pending" && (
                <>
                  <button
                    className="approve-request"
                    disabled={isSubmitting}
                    onClick={() => updateRequest("approved")}
                  >
                    {isSubmitting ? "Approving..." : "Accept"}
                  </button>

                  <button
                    className="reject-request"
                    disabled={isSubmitting}
                    onClick={() => updateRequest("rejected")}
                  >
                    {isSubmitting ? "Rejecting..." : "Reject"}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="request-page-body-answer">
            <div className="req-admin-note">
              <label htmlFor="adminNote">Admin Note</label>
              <textarea
                name="adminNote"
                id="adminNote"
                rows="10"
                placeholder={
                  request?.status === "pending"
                    ? "Leave the jeweler a note to keep them informed . . . "
                    : request?.status === "approved" && !request?.adminNote
                    ? `${request?.details.name} request has been successfully approved.`
                    : request?.status === "rejected" && !request?.adminNote
                    ? `${request?.details.name} request has been rejected.`
                    : ""
                }
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                disabled={
                  request?.status === "rejected" ||
                  request?.status === "approved"
                }
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Request
