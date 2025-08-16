import { useState, useEffect } from "react"
import { Route, Routes } from "react-router-dom"
import Navbar from "./components/Navbar"
import Authentication from "./pages/authentication"
import "./App.css"

function App() {
  const [user, setUser] = useState()
  const checkToken = async () => {
    const userData = await CheckSession()
    setUser(userData)
  }

  const handleLogOut = () => {
    setUser(null)
    localStorage.clear()
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      checkToken()
    }
  }, [])

  return (
    <>
      <Navbar handleLogOut={handleLogOut} user={user}  />
      <main>
        <Routes>
          {/* <Route path="/*" element={<Home />} /> */}
          <Route path="/auth" element={<Authentication setUser={setUser}/>} />
        </Routes>
      </main>
    </>
  )
}

export default App
