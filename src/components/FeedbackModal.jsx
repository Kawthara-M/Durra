import "../../public/stylesheets/feedback-modal.css"
import { FaCheck, FaTimes } from "react-icons/fa"

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
          icon: <FaTimes className="icon" />,
          color: "#d10000",
          title: "Error",
        }
      case "confirm":
        return {
          icon: <FaTimes className="icon" />,
          color: "#d8af09ff",
          title: "Confirmation",
        }
        break
        return { icon: null, color: "#000", title: "" }
    }
  }

  const { icon, color, title } = getIconAndColor()

  return (
    <div className="feedback-modal-overlay">
      <div className="card">
        {/* Icon */}
        <div className="icon-container">{icon}</div>

        {/* Message Text */}
        <div className="message-text-container">
          <p className="message-text" style={{ color }}>
            {title}
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
