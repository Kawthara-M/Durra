const SingleReview = ({ review, canEdit, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(review.comment)

  const displayName =
    (review.user?.fName || "") +
    (review.user?.lName ? ` ${review.user.lName}` : "") ||
    review.user?.email ||
    "User"

  const createdDate = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString()
    : ""

  const handleSave = () => {
    onUpdate(review._id, draft, () => setIsEditing(false))
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
              <button type="button" onClick={handleSave}>
                Save
              </button>
              <button type="button" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => setIsEditing(true)}>
                Edit
              </button>
              <button type="button" onClick={onDelete}>
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default SingleReview