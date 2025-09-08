import { Link } from "react-router-dom"
import { useState } from "react"
import { useUser } from "../context/UserContext"
import "../../public/stylesheets/navbar.css"
import userIcon from "../assets/user.png"
import cartIcon from "../assets/cart.png"
import searchIcon from "../assets/search.png"
import heartIcon from "../assets/heart.png"

const Navbar = ({ handleLogOut, customer }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [showSearchInput, setShowSearchInput] = useState(false)
  const { user } = useUser()

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
              <button
                onClick={() => setShowSearchInput(!showSearchInput)}
                id="search"
              >
                <img src={searchIcon} alt="search icon" className="icon" />
              </button>
            </Link>
            {user ? (
              <>
                {/* Cart Icon - Only for customers */}
                {user.role === "customer" && (
                  <Link to="/cart" title="Cart">
                    <img src={cartIcon} alt="cart icon" className="icon" />
                  </Link>
                )}

                {/* Profile Icon */}
                {customer && (
                  <Link
                    to={`/profile/${customer.id}`}
                    className="icon-btn"
                    title="User"
                  >
                    <img src={userIcon} alt="user icon" className="icon" />
                  </Link>
                )}

                {/* Favourites Icon */}
                {customer && (
                  <Link
                    to={`/favourites/${customer.id}`}
                    className="icon-btn"
                    title="Favourites"
                  >
                    <img
                      src={heartIcon}
                      alt="favourite icon"
                      className="icon"
                    />
                  </Link>
                )}
              </>
            ) : (
              <>
                {/* Disabled Cart Icon */}
                <span
                  className="icon-btn disabled-link"
                  title="Sign in to view cart"
                >
                  <img src={cartIcon} alt="cart icon" className="icon" />
                </span>

                {/* Disabled Profile Icon */}
                <span
                  className="icon-btn disabled-link"
                  title="Sign in to view profile"
                >
                  <img src={userIcon} alt="user icon" className="icon" />
                </span>

                {/* Disabled Favourites Icon */}
                <span
                  className="icon-btn disabled-link"
                  title="Sign in to view favourites"
                >
                  <img src={heartIcon} alt="favourite icon" className="icon" />
                </span>
              </>
            )}
          </div>
        </nav>

        {showSearchInput ? (
          <div className="search-bar-container">
            <input
              type="text"
              placeholder="Search..."
              className="search-input"
            />
          </div>
        ) : (
          <nav className="pages-navbar desktop-navbar">
            <Link to="/jewelry">All Jewelry</Link>
            <Link to="/jewelry/earrings">Earrings</Link>
            <Link to="/jewelry/bracelets">Bracelets</Link>
            <Link to="/jewelry/rings">Rings</Link>
            <Link to="/jewelry/necklaces">Necklaces</Link>
            <Link to="/services/necklaces">Services</Link>
          </nav>
        )}

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
            <Link to="/jewelry/rings" onClick={closeMenu}>
              Rings
            </Link>
            <Link to="/jewelry/earrings" onClick={closeMenu}>
              Earrings
            </Link>
            <Link to="/jewelry/bracelets" onClick={closeMenu}>
              Bracelets
            </Link>
            <Link to="/jewelry/necklaces" onClick={closeMenu}>
              Necklaces
            </Link>
            <Link to="/services" onClick={closeMenu}>
              Services
            </Link>
          </nav>
        </div>
      </div>
    </>
  )
}

export default Navbar
