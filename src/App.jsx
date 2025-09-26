import { Route, Routes } from "react-router-dom"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import AboutUs from "./pages/AboutUs"
import Authentication from "./pages/Authentication"
import Home from "./pages/Home"
import JewelerServices from "./pages/JewelerServices"
import JewelryForm from "./components/JewelryForm"
import ServicesForm from "./components/ServicesForm"

import "./App.css"

function App() {

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
            <Route path="/add-jewelry" element={<JewelryForm />} />
            <Route path="/add-services" element={<ServicesForm />} />
            <Route path="/jeweler-services" element={<JewelerServices />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </>
  )
}

export default App
