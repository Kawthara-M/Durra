import { Route, Routes } from "react-router-dom"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import AboutUs from "./pages/AboutUs"
import Authentication from "./pages/Authentication"
import Home from "./pages/Home"
import Profile from "./pages/Profile"
import JewelerJewelryPage from "./pages/JewelerJewelryPage"
import JewelerCollectionsPage from "./pages/JewelerCollectionsPage"
import JewelerServices from "./pages/JewelerServices"
import JewelerOrdersPage from "./pages/JewelerOrdersPage"
import JewelryForm from "./components/JewelryForm"
import ServicesForm from "./components/ServicesForm"
import CollectionForm from "./components/CollectionForm"
import JewelerServicePage from "./pages/JewelerServicePage"
import JewelerOrderPage from "./pages/JewelerOrderPage"
import JewelryPiecePage from "./pages/JewelryPiecePage"
import JewelerCollectionPage from "./pages/JewelerCollectionPage"
import JewelerRegisteration from "./components/JewelerRegisteration"
import SetPassword from "./components/SetPassword"
import Search from "./pages/Search"
import LivePrices from "./pages/LivePrices"
import SizeGuide from "./pages/SizeGuide"
import ScrollToTop from "./components/ScrollToTop"
import TermsAndConditions from "./pages/TermsAndConditions"
import Shops from "./pages/Shops"
import Jewelry from "./pages/Jewelry"
import Services from "./pages/Services"
import JewelryPage from "./pages/JewelryPage"
import CollectionPage from "./pages/CollectionPage"
import ServicePage from "./pages/ServicePage"
import Wishlist from "./pages/Wishlist"
import ShopDetails from "./pages/ShopDetails"

import "./App.css"

function App() {
  return (
    <>
      <div className="app-container">
        <ScrollToTop />
        <Navbar />
        <main>
          <Routes>
            <Route path="/*" element={<Home />} />
            <Route path="/auth" element={<Authentication />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/SizeGuide" element={<SizeGuide />} />
            <Route path="/live-prices" element={<LivePrices />} />
            <Route
              path="/terms-and-conditions"
              element={<TermsAndConditions />}
            />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/registeration" element={<JewelerRegisteration />} />
            <Route path="/set-password" element={<SetPassword />} />

            <Route path="/search" element={<Search />} />
            <Route path="/shops" element={<Shops />} />
            <Route path="/jewelry" element={<Jewelry />} />
            <Route path="/services" element={<Services />} />
            <Route path="/jewelry/:jewelryId" element={<JewelryPage />} />
            <Route path="/services/:serviceId" element={<ServicePage />} />
            <Route path="/collections/:collectionId" element={<CollectionPage />} />

            <Route path="/jeweler-jewelry" element={<JewelerJewelryPage />} />
            <Route
              path="/jeweler-collections"
              element={<JewelerCollectionsPage />}
            />
            <Route path="/jeweler-services" element={<JewelerServices />} />
            <Route path="/jeweler-orders" element={<JewelerOrdersPage />} />

            <Route path="/add-jewelry" element={<JewelryForm />} />
            <Route path="/add-services" element={<ServicesForm />} />
            <Route path="/add-collections" element={<CollectionForm />} />

            <Route path="/edit-jewelry/:jewelryId" element={<JewelryForm />} />
            <Route
              path="/edit-collection/:collectionId"
              element={<CollectionForm />}
            />
            <Route path="/edit-service/:serviceId" element={<ServicesForm />} />

            <Route
              path="/show-jewelry/:jewelryId"
              element={<JewelryPiecePage />}
            />
            <Route
              path="/show-collection/:collectionId"
              element={<JewelerCollectionPage />}
            />
            <Route
              path="/show-service/:serviceId"
              element={<JewelerServicePage />}
            />
            <Route path="/show-order/:orderId" element={<JewelerOrderPage />} />
            <Route path="/shop/:shopId" element={<ShopDetails />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </>
  )
}

export default App
