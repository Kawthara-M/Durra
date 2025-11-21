import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"

import User from "../services/api"
import { useUser } from "../context/UserContext"

import "../../public/stylesheets/requests.css"

const Request = () => {
  const { requestId } = useParams()
  const { user } = useUser()
  const [request, setRequest] = useState()
  const [adminNote, setAdminNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchRequest = async () => {
      const response = await User.get(`/requests/${requestId}`)
      setRequest(response.data.request)

      if (response.data.request?.adminNote) {
        setAdminNote(response.data.request.adminNote)
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

      // update local state so UI reflects new status + note
      setRequest((prev) => ({
        ...prev,
        status,
        adminNote,
      }))
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {user?.role === "Admin" && (
        <div className="request-page-wrapper">
          <div className="request-page-header">
            <h1>{request?.details.name}</h1>
            <p>
              ({request?.status.charAt(0).toUpperCase() +
                request?.status.slice(1)}
              )
            </p>
          </div>

          <div className="request-page-body">
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
                {request?.status === "pending" ? (
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
                ) : null}
              </div>
            </div>

            <div className="request-page-body-answer">
              <div className="req-admin-note">
                <label htmlFor="adminNote">Admin Note</label>
                <textarea
                  name="adminNote"
                  id="adminNote"
                  rows="10"
                  placeholder={`${
                    request?.status === "pending"
                      ? "Leave the jeweler a note to keep them informed . . . "
                      : request?.status === "accepted" && !request?.adminNote
                      ? `${request?.details.name} request have been successfully approved.`
                      : request?.status === "rejected" &&
                        !request?.adminNote &&
                        `${request?.details.name} request have been rejected.`
                  }`}
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
      )}
    </>
  )
}

export default Request
