import { useEffect, useState } from "react"
import User from "../services/api"
import SingleReview from "./SingleReview"
import { useUser } from "../context/UserContext"

import "../../public/stylesheets/reviews.css"

const Reviews = ({ jewelryId, serviceId, collectionId, type }) => {
  const { user } = useUser()

  const reviewedItemType = type 
  const reviewedItemId = jewelryId || serviceId || collectionId

  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [canReview, setCanReview] = useState(false)

  const userId = user?._id || user?.id

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
    const checkEligibility = async () => {
      if (!userId) return setCanReview(false)

      try {
        const res = await User.get(
          `/reviews/can-review/${reviewedItemType}/${reviewedItemId}`
        )
        setCanReview(res.data.canReview)
      } catch (err) {
        console.error("Eligibility check failed:", err)
        setCanReview(false)
      }
    }

    checkEligibility()
  }, [userId, reviewedItemId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      setError("Please sign in to leave a review.")
      return
    }
    if (!comment.trim()) {
      setError("Comment cannot be empty.")
      return
    }

    setSubmitting(true)
    setError("")

    try {
      const body = {
        reviewedItem: reviewedItemId,
        reviewedItemType,
        comment: comment.trim(),
      }

      const res = await User.post("/reviews", body)
      const newReview = res.data.review

      setReviews((prev) => [
        {
          ...newReview,
          user: {
            fName: user.fName,
            lName: user.lName,
            email: user.email,
            _id: userId,
          },
        },
        ...prev,
      ])
      setComment("")
    } catch (err) {
      console.error("Failed to create review:", err)
      const msg =
        err.response?.data?.error ||
        "Failed to post review. You may need to have ordered and collected this item."
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (reviewId) => {
    if (!user) return
    try {
      await User.delete(`/reviews/${reviewId}`)
      setReviews((prev) => prev.filter((r) => r._id !== reviewId))
    } catch (err) {
      console.error("Failed to delete review:", err)
      setError("Failed to delete review.")
    }
  }

  const handleUpdate = async (reviewId, newComment, done) => {
    if (!user) return
    if (!newComment.trim()) return

    try {
      const res = await User.put(`/reviews/${reviewId}`, {
        comment: newComment.trim(),
      })
      const updated = res.data.review
      setReviews((prev) =>
        prev.map((r) =>
          r._id === reviewId ? { ...r, comment: updated.comment } : r
        )
      )
      done && done()
    } catch (err) {
      console.error("Failed to update review:", err)
      setError("Failed to update review.")
    }
  }

  if (!reviewedItemId) return null

  return (
    <div className="reviews-wrapper">
      <div className="reviews-list">
        {loading ? (
          <p>Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          <>
            <h4>What others say</h4>
            {reviews.map((review) => (
              <SingleReview
                key={review._id}
                review={review}
                canEdit={userId && review.user?._id === userId}
                onDelete={() => handleDelete(review._id)}
                onUpdate={handleUpdate}
              />
            ))}
          </>
        )}
      </div>

      <div className="reviews-form">
        <h4>Leave a Review</h4>
        {!user && (
          <p className="reviews-hint">
            Sign in and make sure you have ordered and collected this item to
            leave a review.
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={
              canReview
                ? "Write your review…"
                : "You can only review items you have purchased and received."
            }
            disabled={!canReview}
            className={!canReview ? "textarea-disabled" : ""}
          />
          {error && <p className="reviews-error">{error}</p>}
          <button type="submit" disabled={!user || submitting}>
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Reviews
