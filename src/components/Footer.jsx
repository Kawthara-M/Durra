import { useContext } from "react"
import { Link } from "react-router-dom"
import instaIcon from "../assets/instagram.png"
import themeIcon from "../assets/theme.png"

import { ThemeContext } from "../context/ThemeContext"
import "../../public/stylesheets/footer.css"

const Footer = () => {
  const { toggleTheme, theme } = useContext(ThemeContext)

  return (
    <>
      <footer>
        <div className="links">
          <div className="container">
            <h6>General</h6>
            <div className="options">
              <p>About Us</p>
              <p>Privacy Policy</p>
              <p>Terms and Conditions</p>
            </div>
          </div>

          <div className="container">
            <h6>Customer Service</h6>
            <div className="options">
              <p>Delivery</p>
              <p>Size Guide</p>
              <p>Refund Policy</p>
            </div>
          </div>
        </div>
        <div className="social-media">
          <Link
            to={`/social-media/instagram`} //replace with insta link
            className="icon-btn"
            title="Durra Instagram"
          >
            <img src={instaIcon} alt="Instagram icon" className="icon" />
          </Link>
          <button
            onClick={toggleTheme}
            title="Toggle Theme" id="theme"
          >
            <img src={themeIcon} alt="Theme icon"  />
          </button>
          {/* theme should be part of user page, but it currentlt doesn't exist */}
        </div>
        <p id="durra">© 2025 DURRA</p>
      </footer>
    </>
  )
}
export default Footer
