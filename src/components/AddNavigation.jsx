import { useNavigate } from "react-router-dom"

const AddNavigation = ({ type, views, setView, activeView, backTo }) => {
  const navigate = useNavigate()

  const handleBack = () => {
    if (typeof backTo === "function") {
      backTo()
    } else if (backTo) {
      navigate(backTo)
    } else {
      navigate(-1)
    }
  }

  return (
    <div className="add-sidebar">
      <button type="button" className="add-sidebar-back" onClick={handleBack}>
        <span className="back-arrow">←</span>
        <span className="back-label">
          <h6>{type}</h6>
          (s)
        </span>
      </button>

      {type && <h1>{type} Form</h1>}
      <div className="add-sidebar-list">
        {views
          ? views.map((view) => (
              <a
                key={view}
                onClick={() => setView(view)}
                className={view === activeView ? "active" : ""}
              >
                {view}
              </a>
            ))
          : null}
      </div>
    </div>
  )
}

export default AddNavigation
