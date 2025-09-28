import { useState, useEffect } from "react"

import User from "../services/api"

// I should work on order logic first, because there is no reviews currently
const Reviews = ({ serviceId }) => {
  const [reviews, setReviews] = useState(null)

  useEffect(() => {
    const getReviews = async () => {
      const respone = User.get(`/reviews/Service/${serviceId}`)
      console.log(respone)
    }
    getReviews()
  }, [])

  return <>{reviews && reviews.length > 0 ? "meow" : <p className="none">No Reviews</p>}</>
}

export default Reviews
