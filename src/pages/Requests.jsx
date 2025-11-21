import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import User from "../services/api"
import { useUser } from "../context/UserContext"
import "../../public/stylesheets/requests.css"

const statusPriority = {
  pending: 1,
  approved: 2,
  rejected: 3,
}

const sortByStatus = (a, b) => {
  const aPriority = statusPriority[a.status] ?? 99
  const bPriority = statusPriority[b.status] ?? 99
  return aPriority - bPriority
}

const Requests = () => {
  const { user } = useUser()
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    const fetchRequests = async () => {
      const response = await User.get("/requests")
      const sorted = [...response.data.requests].sort(sortByStatus)
      setRequests(sorted)
    }
    fetchRequests()
  }, [])

  const updateRequest = async (requestId, status) => {
    try {
      await User.put(`/requests/${requestId}`, { status })

      setRequests((prev) => {
        const updated = prev.map((req) =>
          req._id === requestId ? { ...req, status } : req
        )
        return [...updated].sort(sortByStatus)
      })
    } catch (err) {
      console.error(err)
    }
  }

  const filteredRequests = requests.filter((req) =>
    filterStatus === "all" ? req : req.status === filterStatus
  )

  return (
    <>
      {user?.role == "Admin" && (
        <div className="requests-wrapper">
          <div className="requests-header">
            <div className="requests-header-title">
              <h1>Requests</h1>
              <span className="number-of-requests">
                ({filteredRequests.length})
              </span>
            </div>

            <select
              className="filter-requests"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="requests-body">
            {filteredRequests.length === 0 ? (
              <p>No requests.</p>
            ) : (
              <div className="requests-list">
                {filteredRequests.map((req) => (
                  <div
                    className="request-item"
                    key={req._id}
                    onClick={() => navigate(`/requests/${req._id}`)}
                  >
                    <div className="request-item-overview">
                      <h3>{req.details.name}</h3>
                      <span className="inline">
                        <h6>
                          {req.status.charAt(0).toUpperCase() +
                            req.status.slice(1)}
                        </h6>
                      </span>
                    </div>
                    <div className="request-item-actions">
                      {req.status === "pending" ? (
                        <>
                          <button
                            className="approve-request"
                            onClick={(e) => {
                              e.stopPropagation()
                              updateRequest(req._id, "approved")
                            }}
                          >
                            Accept
                          </button>

                          <button
                            className="reject-request"
                            onClick={(e) => {
                              e.stopPropagation()
                              updateRequest(req._id, "rejected")
                            }}
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <button
                          className="overview-button"
                          title="Request Overview"
                          onClick={() => navigate(`/requests/${req._id}`)}
                        >
                          Overview
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default Requests
