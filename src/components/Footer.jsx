import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import { useUser } from "../context/UserContext"
import instaIcon from "../assets/instagram.png"

import "../../public/stylesheets/footer.css"

const Footer = () => {
  const navigate = useNavigate()
  const { user } = useUser()

  return (
    <>
      <footer>
        <div className="links">
          <div className={`container `}>
            <h6>General</h6>
            <div className={`options`}>
              <p
                onClick={() => {
                  navigate("/about")
                }}
              >
                About DURRA
              </p>
              <p>Privacy Policy</p>
              <p>Terms and Conditions</p>
              <p
                onClick={() => {
                  navigate("/live-prices")
                }}
              >
                Live Prices
              </p>
              {!user ? (
                <p
                  onClick={() => {
                    navigate("/registeration")
                  }}
                >
                  Join as a Jeweler
                </p>
              ) : null}
            </div>
          </div>

          {user ? (
            user.role === "Customer" ? (
              <div className="container">
                <h6>Customer Service</h6>
                <div className="options">
                  <p>Delivery</p>
                  <p>Size Guide</p>
                  <p>Refund Policy</p>
                  {/* do we have refund? */}
                </div>
              </div>
            ) : null
          ) : (
            <div className="container">
              <h6>Customer Service</h6>
              <div className="options">
                <p>Delivery</p>
                <p>Size Guide</p>
              </div>
            </div>
          )}
        </div>
        <div className="social-media">
          <Link
            to={`/social-media/instagram`} // replace with insta link
            className="icon-btn"
            title="Durra Instagram"
          >
            <img src={instaIcon} alt="Instagram icon" className="icon" />
          </Link>
        </div>
        <p id="durra">© 2025 DURRA</p>
      </footer>
    </>
  )
}
export default Footer
