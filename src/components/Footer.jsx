import { useNavigate, Link } from "react-router-dom"
import { useUser } from "../context/UserContext"
import "../../public/stylesheets/footer.css"

const Footer = () => {
  const navigate = useNavigate()
  const { user } = useUser()

  // doesnt work
  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="footer">
      <div className="footer-card">
        <div className="footer-main">
          <div className="footer-brand">
            <h2 className="footer-logo">DURRA</h2>
            <p className="footer-tagline">
              Representing the perfect harmony of Bahrain's jewelry legacy and
              contemporary sophistication, a symbol of heritage, trust, and innovation.
            </p>

            <button
              type="button"
              className="footer-backtotop"
              onClick={handleBackToTop}
            >
              ↑ Back to top
            </button>
          </div>

          <div className="footer-columns">
            <div className="footer-column">
              <h6>General</h6>
              <p className="footer-link" onClick={() => navigate("/about")}>
                About DURRA
              </p>
              <p
                className="footer-link"
                onClick={() => navigate("/live-prices")}
              >
                Live Prices
              </p>
              {!user && (
                <>
                  <p
                    className="footer-link"
                    onClick={() => navigate("/sign-in")}
                  >
                    Sign in
                  </p>
                  <p
                    className="footer-link"
                    onClick={() => navigate("/registeration")}
                  >
                    Join as a Jeweler
                  </p>
                </>
              )}
            </div>

            <div className="footer-column">
              <h6>Legal</h6>
              <p className="footer-link">Privacy Policy</p>
              <p
                className="footer-link"
                onClick={() => navigate("/terms-and-conditions")}
              >
                Terms and Conditions
              </p>
            </div>

            <div className="footer-column">
              <h6>Customer Support</h6>
              {user && user.role === "Customer" ? (
                <>
                  <p
                    className="footer-link"
                    onClick={() => navigate("/comparsion")}
                  >
                    Comparison
                  </p>
                  <p
                    className="footer-link"
                    onClick={() => navigate("/SizeGuide")}
                  >
                    Size Guide
                  </p>
                </>
              ) : (
                <p
                  className="footer-link"
                  onClick={() => navigate("/SizeGuide")}
                >
                  Size Guide
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p>© 2025 DURRA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
