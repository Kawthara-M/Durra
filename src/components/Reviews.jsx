import { useEffect, useState } from "react"
import User from "../services/api"
import { useUser } from "../context/UserContext"
import SingleReview from "./SingleReview"
import "../../public/stylesheets/reviews.css"

const Reviews = ({
  reviewedItemId,
  reviewedItemType = "Jewelry",
  readOnly = false,
}) => {
  const { user } = useUser()
  console.log(user)
  const userId = user?.id

  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [canReview, setCanReview] = useState(false)

  useEffect(() => {
    if (!reviewedItemId || !reviewedItemType) return

    const fetchReviews = async () => {
      setLoading(true)
      setError("")
      try {
        const res = await User.get(
          `/reviews/${reviewedItemType}/${reviewedItemId}`
        )
        setReviews(res.data.reviews || [])
      } catch (err) {
        console.error("Failed to fetch reviews:", err)
        setError("Failed to load reviews.")
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [reviewedItemId, reviewedItemType])

  useEffect(() => {
    if (readOnly || !userId || !reviewedItemId || !reviewedItemType) {
      console.log(userId)
      setCanReview(false)
      return
    }

    const checkEligibility = async () => {
      try {
        console.log(" we are here")
        const res = await User.get(
          `/reviews/can-review/${reviewedItemType}/${reviewedItemId}`
        )
        setCanReview(!!res.data.canReview)
      } catch (err) {
        console.error("Failed to check review eligibility:", err)
        setCanReview(false)
      }
    }

    checkEligibility()
  }, [readOnly, userId, reviewedItemId, reviewedItemType])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user || readOnly || !canReview || !comment.trim()) return

    setSubmitting(true)
    setError("")
    try {
      const res = await User.post("/reviews", {
        reviewedItem: reviewedItemId,
        reviewedItemType,
        comment: comment.trim(),
      })

      const newReview = res.data.review
      setReviews((prev) => [newReview, ...prev])
      setComment("")
    } catch (err) {
      console.error("Failed to create review:", err)
      const msg =
        err.response?.data?.error ||
        "Failed to submit review. Please try again."
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (reviewId) => {
    try {
      await User.delete(`/reviews/${reviewId}`)
      setReviews((prev) => prev.filter((r) => r._id !== reviewId))
    } catch (err) {
      console.error("Failed to delete review:", err)
      setError("Failed to delete review.")
    }
  }

  const handleUpdate = async (reviewId, newComment) => {
    try {
      const res = await User.put(`/reviews/${reviewId}`, {
        comment: newComment,
      })
      const updated = res.data.review

      setReviews((prev) => prev.map((r) => (r._id === reviewId ? updated : r)))
    } catch (err) {
      console.error("Failed to update review:", err)
      setError("Failed to update review.")
    }
  }

  return (
    <div className="reviews-wrapper">
      <div className="reviews-list">
        {loading ? (
          <p>Loading reviews . . .</p>
        ) : reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          <>
            {reviews.map((review) => (
              <SingleReview
                key={review._id}
                review={review}
                canEdit={!!userId && review.user?._id === userId && !readOnly}
                onDelete={() => handleDelete(review._id)}
                onUpdate={handleUpdate}
              />
            ))}
          </>
        )}
      </div>

      {!readOnly && (
        <div className="reviews-form">
          <h4>Leave a Review</h4>

          {error && <p className="reviews-error">{error}</p>}

          <form onSubmit={handleSubmit}>
            <textarea
              rows="4"
              placeholder={
                !user
                  ? "Sign in to leave a review."
                  : canReview
                  ? "Share your experience..."
                  : "You can only review items you have purchased and collected."
              }
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={!user || !canReview || submitting}
            />
            <button
              type="submit"
              disabled={!user || !canReview || submitting || !comment.trim()}
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default Reviews
