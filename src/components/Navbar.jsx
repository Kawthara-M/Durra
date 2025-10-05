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
          <div className={`topNav-left large-left`}>
            <button className="toggleBtn" onClick={toggleMenu}>
              ☰
            </button>
            <Link to="/" className={`brand-logo ${isOpen ? "hide-on-mobile" : ""}`}>
              DURRA
            </Link>
            {user ? (
              user?.role === "Customer" ? (
                <Link to="/" className="brand-logo">
                  DURRA
                </Link>
              ) : user?.role === "Jeweler" ? (
                <>
                  <Link to="/jeweler-jewelry" className="jeweler-options desktop-only">
                    Jewelry
                  </Link>
                  <Link to="/jeweler-jewelry" className="jeweler-options desktop-only">
                    Collections
                  </Link>
                  <Link to="/jeweler-services" className="jeweler-options desktop-only">
                    Services
                  </Link>
                  <Link to="/jeweler-orders" className="jeweler-options desktop-only">
                    Orders
                  </Link>
                </>
              ) : (
                <Link to="/" className="brand-logo">
                  DURRA
                </Link>
              )
            ) : (
              <>
                {/* for guests */}

                <Link to="/jewelry" className="guest-link desktop-only">
                  Jewelry
                </Link>
                <Link to="/services" className="guest-link desktop-only">
                  Service
                </Link>
              </>
            )}
          </div>

          {/* <div className={`topNav-center ${isOpen ? "hide-on-mobile" : ""}`}>
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
          </div> */}

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
            ) : null
          ) : null
        ) : null}

        <div className={`sideNav ${isOpen ? "open" : ""}`}>
          <div className="sidebar-logo">
            <Link to="/" className="brand-logo-mobile" onClick={closeMenu}>
              DURRA
            </Link>
          </div>
          <nav className="pages-navbar side-navbar-links">
            {user?.role === "Customer" || !user ? (
              <>
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
              </>
            ) : user?.role === "Jeweler" ? (
              <>
                <Link to="/jeweler-jewelry" onClick={closeMenu}>
                  Jewelry
                </Link>
                <Link to="/jeweler-jewelry" onClick={closeMenu}>
                  Collections
                </Link>
                <Link to="/jeweler-services" onClick={closeMenu}>
                  Services
                </Link>
                <Link to="/jeweler-orders" onClick={closeMenu}>
                  Orders
                </Link>
              </>
            ) : null}
          </nav>

          <div></div>
        </div>
      </div>
    </>
  )
}

export default Navbar
