import { useState } from "react"
import { useNavigate } from "react-router-dom"
import User from "../services/api"
import { useUser } from "../context/UserContext"
import FeedbackModal from "../components/FeedbackModal"

import "../../public/stylesheets/contact-us.css"

const ContactUs = () => {
  const navigate = useNavigate()
  const { user } = useUser()

  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)

  const [feedback, setFeedback] = useState({
    show: false,
    type: "success",
    message: "",
  })

  const [showLoginModal, setShowLoginModal] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user) {
      setShowLoginModal(true)
      return
    }

    if (!subject || !message) {
      setFeedback({
        show: true,
        type: "warning",
        message: "Please fill in both Subject and Message fields.",
      })
      return
    }

    try {
      setIsSending(true)

      await User.post("/contact-us", { subject, message })

      setSubject("")
      setMessage("")

      setFeedback({
        show: true,
        type: "success",
        message: "Your message was sent successfully!",
      })
    } catch (err) {
      setFeedback({
        show: true,
        type: "error",
        message: "Failed to send message. Please try again later.",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <>
      <div className="contact-page">
        <h1>Contact Us</h1>

        <form className="contact-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Subject"
            maxLength={150}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={isSending}
          />

          <textarea
            rows="6"
            placeholder="Write your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isSending}
          />

          <button type="submit" disabled={isSending}>
            {isSending ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>

      <FeedbackModal
        show={feedback.show}
        type={feedback.type}
        message={feedback.message}
        onClose={() => setFeedback((p) => ({ ...p, show: false }))}
        actions={[
          {
            label: "Close",
            onClick: () =>
              setFeedback((p) => ({
                ...p,
                show: false,
              })),
            primary: true,
          },
        ]}
      />

      <FeedbackModal
        show={showLoginModal}
        type="warning"
        message="Please sign in to contact DURRA's support team."
        onClose={() => setShowLoginModal(false)}
        actions={[
          {
            label: "Sign In",
            onClick: () => {
              setShowLoginModal(false)
              navigate("/sign-in")
            },
            primary: true,
          },
          {
            label: "Cancel",
            onClick: () => setShowLoginModal(false),
          },
        ]}
      />
    </>
  )
}

export default ContactUs
