import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { useUser } from "../context/UserContext"
import { useNavigate } from "react-router-dom"
import userIcon from "../assets/user.png"
import cartIcon from "../assets/cart.png"
import searchIcon from "../assets/search.png"
import heartIcon from "../assets/heart.png"
import "../../public/stylesheets/navbar.css"

const Navbar = ({}) => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [showSearchInput, setShowSearchInput] = useState(false)
  const { user } = useUser()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 615) {
        setIsOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)

    handleResize()
    console.log(user)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <>
      <div className="top-wrapper">
        <nav className="topNav">
          <div
            className={`topNav-left ${
              user && user.role != "Customer" ? "large-left" : null
            }`}
          >
            {user ? (
              user?.role === "Customer" ? (
                <button className="toggleBtn" onClick={toggleMenu}>
                  ☰
                </button>
              ) : (
                <>
                  <Link to="/" className="brand-logo">
                    DURRA
                  </Link>
                  <Link to="/add-jewelry" className="jeweler-options">
                    Jewelry
                  </Link>
                  <Link to="/" className="jeweler-options">
                    Orders
                  </Link>
                </>
              )
            ) : (
              <button className="toggleBtn" onClick={toggleMenu}>
                ☰
              </button>
            )}
          </div>

          <div className={`topNav-center ${isOpen ? "hide-on-mobile" : ""}`}>
            {user ? (
              user.role === "Customer" ? (
                <Link to="/" className="brand-logo">
                  DURRA
                </Link>
              ) : null
            ) : (
              <Link to="/" className="brand-logo">
                DURRA
              </Link>
            )}
          </div>

          <div className="topNav-right">
            {user ? (
              <>
                {user.role === "Customer" && (
                  <>
                    <Link to="#">
                      <button
                        onClick={() => setShowSearchInput(!showSearchInput)}
                        id="search"
                      >
                        <img
                          src={searchIcon}
                          alt="search icon"
                          className="icon"
                        />
                      </button>
                    </Link>
                    <Link to="/cart" title="Cart">
                      <img src={cartIcon} alt="cart icon" className="icon" />
                    </Link>

                    {/* Favourites Icon  */}

                    <Link
                      to={`/favourites/${user.id}`}
                      className="icon-btn"
                      title="Favourites"
                    >
                      <img
                        src={heartIcon}
                        alt="favourite icon"
                        className="icon"
                      />
                    </Link>
                  </>
                )}

                {/* Profile Icon */}
                <Link
                  to={`/profile/${user.id}`}
                  className="icon-btn"
                  title="User"
                >
                  <img src={userIcon} alt="user icon" className="icon" />
                </Link>
              </>
            ) : (
              <>
                <Link to="#">
                  <button
                    onClick={() => setShowSearchInput(!showSearchInput)}
                    id="search"
                  >
                    <img src={searchIcon} alt="search icon" className="icon" />
                  </button>
                </Link>
                {/* Disabled Cart Icon */}
                <span
                  className="icon-btn disabled-link"
                  title="Sign in to view cart"
                >
                  <img src={cartIcon} alt="cart icon" className="icon" />
                </span>

                {/* Disabled Favourites Icon */}
                <span
                  className="icon-btn disabled-link"
                  title="Sign in to view favourites"
                >
                  <img src={heartIcon} alt="favourite icon" className="icon" />
                </span>
                {/* Disabled Profile Icon */}
                <span className="icon-btn" title="Sign in to view profile">
                  <img
                    src={userIcon}
                    alt="user icon"
                    className="icon"
                    onClick={() => {
                      navigate("/auth")
                    }}
                  />
                </span>
              </>
            )}
          </div>
        </nav>
        {user ? (
          user.role === "Customer" ? (
            showSearchInput ? (
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
            )
          ) : null
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
          <div></div>
        </div>
      </div>
    </>
  )
}

export default Navbar
