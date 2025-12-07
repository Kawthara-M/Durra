import {
  FaCheck,
  FaTimes,
  FaTimesCircle,
  FaExclamationTriangle,
} from "react-icons/fa"
import "../../public/stylesheets/feedback-modal.css"

const FeedbackModal = ({
  show,
  type = "success",
  message,
  onClose,
  actions = [],
}) => {
  if (!show) return null

  const getIconAndColor = () => {
    switch (type) {
      case "success":
        return {
          icon: <FaCheck className="icon" />,
          color: "#269b24",
          title: "Success!",
        }
      case "error":
        return {
          icon: <FaTimesCircle className="icon" />,
          color: "#d10000",
          title: "Error",
        }
      case "warning":
        return {
          icon: <FaExclamationTriangle className="icon" />,
          color: "#daa402ff",
          title: "Warning",
        }

      case "confirm":
        return {
          icon: <FaExclamationTriangle className="icon" />,
          color: "#d8af09ff",
          title: "Confirmation",
        }
      case "notice":
        return {
          icon: <FaExclamationTriangle className="icon" />,
          color: "#005f9e", 
          title: "Notice",
        }
      default:
        return {
          icon: <FaCheck className="icon" />,
          color: "#269b24",
          title: "Notice",
        }
    }
  }

  const { icon, color, title } = getIconAndColor()

  const stopAll = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <div
      className="feedback-modal-overlay"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="card" onClick={(e) => e.stopPropagation()}>
        <div className="feedback-wrapper">
          <div className="icon-and-message">
            <div className="icon-container">{icon}</div>

            <div className="message-text-container">
              <p className="message-text" style={{ color }}>
                {title}
              </p>
              <p className="sub-text">{message}</p>
            </div>
          </div>
          <div className="feedback-actions">
            {actions.map((action, index) => (
              <button
                key={index}
                type="button"
                className="feedback-buttons"
                onClick={(e) => {
                  stopAll(e)
                  action.onClick && action.onClick(e)
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
        <span
          className="modal-close-btn"
          onClick={(e) => {
            stopAll(e)
            onClose && onClose()
          }}
        >
          ✕
        </span>
      </div>
    </div>
  )
}

export default FeedbackModal
