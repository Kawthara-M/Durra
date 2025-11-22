import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import { useUser } from "../context/UserContext"
import instaIcon from "../assets/instagram.png"

import "../../public/stylesheets/footer.css"

const Footer = () => {
  const navigate = useNavigate()
  const { user } = useUser()

  return (
    <footer>
      <div className="footer-container">
        <div className="logo-container">
          <h1 className="brand-logo" onClick={() => navigate("/")}>
            DURRA
          </h1>
        </div>

        <div className="row1">
          <div className="container">
            <h6 onClick={() => navigate("/about")}>About Us</h6>
          </div>
          <div className="container">
            <h6 onClick={() => navigate("/live-prices")}>Live Prices</h6>
          </div>

          {user && user?.role !== "Jeweler" && (
            <>
              <div className="container">
                <h6 onClick={() => navigate("/comparsion")}>Comparsion</h6>
              </div>
              <div className="container">
                <h6 onClick={() => navigate("/registeration")}>
                  Join as a Jeweler
                </h6>
              </div>
            </>
          )}

          <div className="container">
            <h6>Privacy Policy</h6>
          </div>
          <div className="container">
            <h6>Terms and Conditions</h6>
          </div>
          <div className="container">
            <h6 onClick={() => navigate("/sizeGuide")}>Size Guide</h6>
          </div>
          {!user && (
            <div className="container">
              <h6 onClick={() => navigate("/sign-in")}>Sign In</h6>
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}

export default Footer
