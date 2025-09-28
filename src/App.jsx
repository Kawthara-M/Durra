import { Route, Routes } from "react-router-dom"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import AboutUs from "./pages/AboutUs"
import Authentication from "./pages/Authentication"
import Home from "./pages/Home"
import JewelerServices from "./pages/JewelerServices"
import JewelryForm from "./components/JewelryForm"
import ServicesForm from "./components/ServicesForm"
import JewelerServicePage from "./pages/JewelerServicePage"
import JewelerOrdersPage from "./pages/JewelerOrdersPage"
import JewelerOrderPage from "./pages/JewelerOrderPage"

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
            <Route path="/edit-service/:serviceId" element={<ServicesForm />} />
            <Route path="/jeweler-services" element={<JewelerServices />} />
            <Route path="/jeweler-orders" element={<JewelerOrdersPage />} />
            <Route path="/show-order/:orderId" element={<JewelerOrderPage />} />
            <Route path="/show-service/:serviceId" element={<JewelerServicePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </>
  )
}

export default App
