import { useState, useEffect } from "react"
import { Route, Routes } from "react-router-dom"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import AboutUs from "./pages/AboutUs"
import Authentication from "./pages/Authentication"
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
          <Route path="/about" element={<AboutUs/>} />
        </Routes>
      </main>
      <Footer/></div>
    </>
  )
}

export default App
