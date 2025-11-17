import { useState, useEffect } from "react"
import deleteIcon from "../assets/delete.png"
import editIcon from "../assets/edit.png"

const SingleReview = ({ review, canEdit, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(review.comment || "")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setDraft(review.comment || "")
  }, [review.comment])

  const displayName = (() => {
    const first = review.user?.fName || ""
    const last = review.user?.lName || ""
    const full = `${first} ${last}`.trim()
    return full || review.user?.email || "User"
  })()

  const createdDate = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString()
    : ""

  const handleSave = async () => {
    if (!draft.trim()) return

    try {
      setSaving(true)
      await onUpdate(review._id, draft.trim())
      setIsEditing(false)
    } catch (err) {
      console.error("Failed to save review:", err)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setDraft(review.comment || "")
    setIsEditing(false)
  }

  return (
    <div className="review-card">
      <div className="review-header">
        <span className="review-author">{displayName}</span>
        {createdDate && <span className="review-date">{createdDate}</span>}
      </div>

      {isEditing ? (
        <textarea
          rows="3"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
      ) : (
        <p className="review-comment">{review.comment}</p>
      )}

      {canEdit && (
        <div className="review-actions">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                id="save-review"
                disabled={saving || !draft.trim()}
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                id="cancel-review-change"
                disabled={saving}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => setIsEditing(true)}>
                <img src={editIcon} alt="Edit" className="icon" />
              </button>
              <button type="button" onClick={onDelete}>
                <img src={deleteIcon} alt="Delete" className="icon" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default SingleReview
