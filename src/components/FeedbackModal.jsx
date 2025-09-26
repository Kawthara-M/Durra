import React from "react"
import "../../public/stylesheets/feedback-modal.css"
import { FaCheck, FaTimes } from "react-icons/fa"

const FeedbackModal = ({
  show,
  success,
  message,
  onClose,
  actions = [],
}) => {
  if (!show) return null

  return (
    <div className="feedback-modal-overlay">
      <div className="card">
        {/* Icon */}
        <div className="icon-container">
          {success ? (
            <FaCheck className="icon" style={{ color: "#269b24" }} />
          ) : (
            <FaTimes className="icon" style={{ color: "#d10000" }} />
          )}
        </div>

        {/* Message Text */}
        <div className="message-text-container">
          <p
            className="message-text"
            style={{ color: success ? "#269b24" : "#d10000" }}
          >
            {success ? "Success!" : "Error!"}
          </p>
          <p className="sub-text">{message}</p>
        </div>

        {/* Actions */}
        <div className="feedback-actions">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`feedback-buttons`}
            >
              {action.label}
            </button>
          ))}
          {!actions.length && (
            <button onClick={onClose} className="feedback-buttons">
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default FeedbackModal
