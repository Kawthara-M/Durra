import { useState, useEffect } from "react"
import { Route, Routes } from "react-router-dom"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
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
    <div className='app-container'>
      <Navbar handleLogOut={handleLogOut} user={user}  />
      <main>
        <Routes>
          {/* <Route path="/*" element={<Home />} /> */}
          <Route path="/auth" element={<Authentication setUser={setUser}/>} />
        </Routes>
      </main>
      <Footer/></div>
    </>
  )
}

export default App
