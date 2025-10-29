import { useState, useEffect } from "react"
import User from "../services/api"

const Collections = () => {
const [collections, setCollections] = useState()

useEffect(()=>{
  const getCollections = async () => {
    const response = await User.get("/collections/")
    console.log(response.data.collections)
    setCollections(response.data.collections)

  }
  getCollections()

}, [])
  
  return <>
  </>
}

export default Collections