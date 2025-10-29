import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import User from "../services/api"

const Jewelry = () => {
  const [jewelry, setJewelry] = useState()

  useEffect(() => {
    const getJewelry = async () => {
      const response = await User.get("/jewelry/")
      console.log(response.data.jewelry)
      setJewelry(response.data.jewelry)
    }
    getJewelry()
  }, [])

  return (
    <>
      <div className="jewelry-page">
        {jewelry ? (
          jewelry.map((j) => {
            return (
              <>
              <Link to={`/jewelry/${j._id}`}>
                <div className="jewelry-card"></div></Link>
              </>
            )
          })
        ) : (
          <p>No Jewelry Available</p>
        )}
      </div>
    </>
  )
}

export default Jewelry
