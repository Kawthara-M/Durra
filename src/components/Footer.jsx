import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import { useUser } from "../context/UserContext"
import instaIcon from "../assets/instagram.png"
import themeIcon from "../assets/theme.png"
import logoutIcon from "../assets/logout.png"

import { ThemeContext } from "../context/ThemeContext"
import "../../public/stylesheets/footer.css"

const Footer = () => {
  const { toggleTheme } = useContext(ThemeContext)
  const navigate = useNavigate()
  const { user, handleLogOut } = useUser()

  return (
    <>
      <footer>
        <div className="links">
          <div
            className={`container `}
          >
            <h6>General</h6>
            <div className={`options row`}>
              <p
                onClick={() => {
                  navigate("/about")
                }}
              >
                About Us
              </p>
              <p>Privacy Policy</p>
              <p>Terms and Conditions</p>
            </div>
          </div>

          {user ? user.role === "Customer" ? (
            <div className="container">
              <h6>Customer Service</h6>
              <div className="options row">
                <p>Delivery</p>
                <p>Size Guide</p>
                <p>Refund Policy</p>
              </div>
            </div>
          ) : null: <div className="container">
              <h6>Customer Service</h6>
              <div className="options row">
                <p>Delivery</p>
                <p>Size Guide</p>
              </div>
            </div>}
        </div>
        <div className="social-media">
          <Link
            to={`/social-media/instagram`} //replace with insta link
            className="icon-btn"
            title="Durra Instagram"
          >
            <img src={instaIcon} alt="Instagram icon" className="icon" />
          </Link>
          <button onClick={toggleTheme} title="Toggle Theme" id="theme">
            <img src={themeIcon} alt="Theme icon" className="icon" />
          </button>
          <button onClick={() => handleLogOut()} title="Logout" id="logout">
            <img src={logoutIcon} alt="Logout icon" className="icon" />
          </button>
          {/* theme should be part of user page, but it currently doesn't exist */}
        </div>
        <p id="durra">© 2025 DURRA</p>
      </footer>
    </>
  )
}
export default Footer
