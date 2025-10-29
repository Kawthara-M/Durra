import { useState, useEffect } from "react"
import User from "../services/api"

const Services = () => {
const [Services, setServices] = useState()

useEffect(()=>{
  const getServices = async () => {
    const response = await User.get("/services/")
    console.log(response.data.services)
    setServices(response.data.services)

  }
  getServices()

}, [])
  
  return <>
  </>
}

export default Services