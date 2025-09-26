const AddNavigation = ({ views, setView, activeView }) => {
  return (
    <>
      <div className="add-sidebar">
        {views
          ? views.map((view) => {
              return (
                <a
                  onClick={() => setView(view)}
                  className={
                    view === activeView  ? "active" : ""
                  }
                >
                  {view}
                </a>
              )
            })
          : null}
      </div>
    </>
  )
}

export default AddNavigation
