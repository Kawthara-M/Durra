import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import User from "../services/api"

const ServicePage = () => {
  const [service, setService] = useState()
  const { serviceId } = useParams()

  useEffect(() => {}, [])
  return <></>
}

export default ServicePage
