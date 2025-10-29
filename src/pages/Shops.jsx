import { useState, useEffect } from "react"
import User from "../services/api"
const Shops = () => {
  const [shops, setShops] = useState()

  useEffect(() => {
    const getShops = async () => {
      const response = await User.get("/shops/")
      console.log(response.data.shops)
      setShops(response.data.shops)

    }
    getShops()
  }, [])

  return <>
  </>
}

export default Shops
