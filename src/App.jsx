import { useEffect } from "react"
import { Route, Routes } from "react-router-dom"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import AboutUs from "./pages/AboutUs"
import Authentication from "./pages/Authentication"
import Home from "./pages/Home"
import JewelryAddForm from "./components/JewelryAddForm"

import "./App.css"

function App() {


  useEffect(() => {
  
    async function fetchMetalRates() {
      const url =
        "https://api.metals.dev/v1/latest?api_key=GF9QACGGAWN9BJKRDDYO374KRDDYO&currency=BHD&unit=g"

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      })

      const result = await response.json()
      console.log(result)
    }
    // fetchMetalRates()
    
  }, [])

  return (
    <>
      <div className="app-container">
        <Navbar />
        <main>
          <Routes>
            <Route path="/*" element={<Home />} />
            <Route
              path="/auth"
              element={<Authentication />}
            />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/add-jewelry" element={<JewelryAddForm />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </>
  )
}

export default App
