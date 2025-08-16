import { Link } from "react-router-dom"
import { useState } from "react"
import "../../public/styleSheets/navbar.css"
import userIcon from "../assets/user.png"
import cartIcon from "../assets/cart.png"
import searchIcon from "../assets/search.png"

const Navbar = ({ handleLogOut, customer }) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  return (
    <>
      <div className="top-wrapper">
        <nav className="topNav">
          <div className="topNav-left">
            <button className="toggleBtn" onClick={toggleMenu}>
              ☰
            </button>
          </div>

          <div className={`topNav-center ${isOpen ? "hide-on-mobile" : ""}`}>
            <Link to="/" className="brand-logo">
              DURRA
            </Link>
          </div>

          <div className="topNav-right">
            <Link to="#">
              <img src={searchIcon} alt="search icon" className="icon" />
            </Link>

            {customer ? (
              <Link to="/cart" title="Cart">
                <img src={cartIcon} alt="cart icon" className="icon" />
              </Link>
            ) : (
              <span
                className="icon-btn disabled-link"
                title="Sign in to view cart"
              >
                <img src={cartIcon} alt="cart icon" className="icon" />
              </span>
            )}

            {customer ? (
              <Link
                to={`/profile/${customer.id}`}
                className="icon-btn"
                title="User"
              >
                <img src={userIcon} alt="user icon" className="icon" />
              </Link>
            ) : (
              <span
                className="icon-btn disabled-link"
                title="Sign in to view profile"
              >
                <img src={userIcon} alt="user icon" className="icon" />
              </span>
            )}
          </div>
        </nav>

        <nav className="pages-navbar desktop-navbar">
          <Link to="/jewelry">All Jewelry</Link>
          <Link to="/jewelry/earrings">Earrings</Link>
          <Link to="/jewelry/bracelets">Bracelets</Link>
          <Link to="/jewelry/rings">Rings</Link>
          <Link to="/jewelry/necklaces">Necklaces</Link>
          <Link to="/services/necklaces">Services</Link>
        </nav>

        <div className={`sideNav ${isOpen ? "open" : ""}`}>
          <div className="sidebar-logo">
            <Link to="/" className="brand-logo-mobile" onClick={closeMenu}>
              DURRA
            </Link>
          </div>
          <nav className="pages-navbar side-navbar-links">
            <Link to="/jewelry" onClick={closeMenu}>
              All Jewelry
            </Link>
            <Link to="/jewelry/earrings" onClick={closeMenu}>
              Earrings
            </Link>
            <Link to="/jewelry/bracelets" onClick={closeMenu}>
              Bracelets
            </Link>
            <Link to="/jewelry/rings" onClick={closeMenu}>
              Rings
            </Link>
            <Link to="/jewelry/necklaces" onClick={closeMenu}>
              Necklaces
            </Link>
            <Link to="/services/necklaces" onClick={closeMenu}>
              Services
            </Link>
          </nav>
        </div>
      </div>
    </>
  )
}

export default Navbar
