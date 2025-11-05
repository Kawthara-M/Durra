import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import User from "../services/api"

const CollectionPage = () => {
  const [collection, setCollection] = useState()
  const { collectionId } = useParams()

  useEffect(() => {}, [])
  return <></>
}

export default CollectionPage
