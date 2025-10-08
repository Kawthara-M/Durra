import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"


import User from "../services/api"
import placeholder from "../assets/placeholder.png"
import "../../public/stylesheets/jeweler-services.css"

const JewelerCollectionsPage = () => {
  const navigate = useNavigate()
  const [collections, setCollections] = useState(null)

  useEffect(() => {
    const getCollections = async () => {
      const response = await User.get(`/collections/`)
      setCollections(response.data.collections)
    }
    getCollections()
  }, [])

  return (
    <>
      <div className="jeweler-collections">
        <h1 className="collections-heading">Jewelry Collections</h1>
        {collections?.length === 0 ? (
          <p>No collections found.</p>
        ) : (
          collections?.map((collection) => (
            <Link to={`/show-collection/${collection._id}`}>
              <div className="service-card" key={collection._id}>
                <h3 className="service-card__title">{collection.name}</h3>

                <img
                  src={collection.jewelry[0].images?.[0] || placeholder}
                  alt={collection.name}
                  className="service-card__image"
                />

                <p className="service-card__content">
                  {collection.description}
                </p>
                <div>
                  <div className="service-card__date">
                    Created on{" "}
                    {new Date(collection.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="service-card__arrow" title="Show Service Page">
                  <span> →</span>
                </div>
              </div>
            </Link>
          ))
        )}

        <button
          type="button"
          className="add-service"
          title="Add Collection"
          onClick={() => navigate("/add-collections")}
        >
          +
        </button>
      </div>
    </>
  )
}

export default JewelerCollectionsPage
