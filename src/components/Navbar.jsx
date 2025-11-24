import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect, useContext } from "react"
import { useUser } from "../context/UserContext"
import { useOrder } from "../context/OrderContext"
import { ThemeContext } from "../context/ThemeContext"
import { getPendingOrder } from "../services/order.js"
import User from "../services/api"

import userIcon from "../assets/user.png"
import cartIcon from "../assets/cart.png"
import searchIcon from "../assets/search.png"
import heartIcon from "../assets/heart.png"
import themeIcon from "../assets/theme.png"
import logoutIcon from "../assets/logout.png"
import closeIcon from "../assets/close.png"

import "../../public/stylesheets/navbar.css"

const Navbar = () => {
  const navigate = useNavigate()
  const { user, handleLogOut } = useUser()
  const { order } = useOrder()
  const { toggleTheme } = useContext(ThemeContext)

  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [showSearchInput, setShowSearchInput] = useState(false)

  const [wishlistCount, setWishlistCount] = useState(0)
  const [hasPendingOrder, setHasPendingOrder] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)
  const handleProfileClick = () => setShowMenu((prev) => !prev)

  const fetchResults = async () => {
    try {
      const response = await User.get("/search", { params: { search } })
      navigate(`/search?search=${encodeURIComponent(search)}`, {
        state: { results: response.data },
      })
      setShowSearchInput(false)
    } catch (err) {
      console.error("Search error:", err)
    }
  }

  const fetchWishlistCount = async () => {
    if (!user) return setWishlistCount(0)
    try {
      const res = await User.get("/wishlist")
      setWishlistCount(res.data?.wishlist?.items?.length || 0)
    } catch {
      setWishlistCount(0)
    }
  }

  useEffect(() => {
    fetchWishlistCount()

    const handleWishlistUpdate = () => fetchWishlistCount()
    window.addEventListener("wishlist-updated", handleWishlistUpdate)

    return () =>
      window.removeEventListener("wishlist-updated", handleWishlistUpdate)
  }, [user])

  useEffect(() => {
    const handleResize = () => window.innerWidth > 615 && setIsOpen(false)
    window.addEventListener("resize", handleResize)
    handleResize()
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const fetchPendingOrder = async () => {
      if (!user) return setHasPendingOrder(false)
      try {
        const pending = await getPendingOrder()
        setHasPendingOrder(!!pending)
      } catch (err) {
        console.error("Failed to fetch pending order:", err)
        setHasPendingOrder(false)
      }
    }

    fetchPendingOrder()
    console.log(user)
    const handleOrderUpdate = () => fetchPendingOrder()
    window.addEventListener("order-updated", handleOrderUpdate)

    return () => window.removeEventListener("order-updated", handleOrderUpdate)
  }, [user])

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false)
        setShowSearchInput(false)
        setShowMenu(false)
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [])

  useEffect(() => {
    const clickOutside = (e) => {
      if (
        !e.target.closest(".profile-menu") &&
        !e.target.closest(".profile-icon")
      ) {
        setShowMenu(false)
      }
    }
    document.addEventListener("click", clickOutside)
    return () => document.removeEventListener("click", clickOutside)
  }, [])

  return (
    <>
      <div className="top-wrapper">
        <nav className={`topNav ${showSearchInput ? "hide" : ""}`}>
          <div className="topNav-left large-left">
            <button className="toggleBtn" onClick={toggleMenu}>
              ☰
            </button>
            <Link to="/" className="brand-logo">
              DURRA
            </Link>

            {user?.role === "Customer" || !user ? (
              <>
                <Link to="/shops" className="desktop-only">
                  Shops
                </Link>
                <Link to="/jewelry" className="desktop-only">
                  Jewelry
                </Link>
                <Link to="/services" className="desktop-only">
                  Services
                </Link>
              </>
            ) : user?.role === "Jeweler" ? (
              <>
                <Link to="/jeweler-jewelry" className="desktop-only">
                  Jewelry
                </Link>
                <Link to="/jeweler-collections" className="desktop-only">
                  Collections
                </Link>
                <Link to="/jeweler-services" className="desktop-only">
                  Services
                </Link>
                <Link to="/jeweler-orders" className="desktop-only">
                  Orders
                </Link>
              </>
            ) : user?.role === "Admin" ? (
              <>
                <Link to="/dashboard" className="desktop-only">
                  Dashboard
                </Link>
                <Link to="/requests" className="desktop-only">
                  Requests
                </Link>
                <Link to="/accounts-management" className="desktop-only">
                  Accounts Management
                </Link>
              </>
            ) : user?.role === "Driver" ? (
              <Link to="/shipments" className="desktop-only">
                Shipments
              </Link>
            ) : null}
          </div>

          <div className="topNav-right">
            {(!user || user.role != "Customer") && (
              <button
                onClick={() => setShowSearchInput(!showSearchInput)}
                id="search"
              >
                <img src={searchIcon} alt="search" className="icon" />
              </button>
            )}
            {user?.role === "Customer" && (
              <>
                <Link to="/cart" className="icon-btn cart-btn">
                  <img src={cartIcon} alt="cart" className="icon" />
                  {(hasPendingOrder ||
                    (order?.jewelryOrder?.length ||
                      order?.serviceOrder?.length) > 0) && (
                    <span className="icon-badge"></span>
                  )}
                </Link>

                <Link to="/wishlist" className="icon-btn wish-btn">
                  <img src={heartIcon} alt="wishlist" className="icon" />
                  {wishlistCount > 0 && <span className="icon-badge"></span>}
                </Link>
              </>
            )}

            <div
              className="icon-btn profile-icon"
              title="User"
              onClick={handleProfileClick}
            >
              <img src={userIcon} alt="user" className="icon" />
            </div>

            {showMenu && (
              <div className="profile-menu">
                {user ? (
                  <>
                    <Link
                      to={`/profile/${user.id}`}
                      onClick={() => setShowMenu(false)}
                    >
                      <span className="menu-item-wrapper pro">
                        <img src={userIcon} className="icon" /> Profile
                      </span>
                    </Link>

                    <span className="menu-item-wrapper">
                      <img src={themeIcon} className="icon" />
                      <button className="menu-btn" onClick={toggleTheme}>
                        Switch
                      </button>
                    </span>

                    <span className="menu-item-wrapper">
                      <img src={logoutIcon} className="icon" />
                      <button className="menu-btn" onClick={handleLogOut}>
                        Sign Out
                      </button>
                    </span>
                  </>
                ) : (
                  <>
                    <span className="menu-item-wrapper">
                      <img src={logoutIcon} className="icon" />
                      <button
                        className="menu-btn"
                        onClick={() => navigate("/sign-in")}
                      >
                        Sign In
                      </button>
                    </span>

                    <span className="menu-item-wrapper">
                      <img src={themeIcon} className="icon" />
                      <button className="menu-btn" onClick={toggleTheme}>
                        Switch
                      </button>
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>

        {showSearchInput && (
          <div className="search-bar-container">
            <span className="search-bar-span">
              <input
                type="text"
                placeholder="Search . . ."
                id="search-in-navbar"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchResults()}
              />
              <img
                src={closeIcon}
                alt="close"
                className="icon close-search"
                onClick={() => setShowSearchInput(false)}
              />
            </span>
            <span className="search-options">Hit Enter or ESC to Close</span>
          </div>
        )}

        <div className={`sideNav ${isOpen ? "open" : ""}`}>
          <div className="sidebar-logo">
            <span className="brand-logo-mobile" onClick={closeMenu}>
              DURRA
            </span>
          </div>

          <nav className="pages-navbar side-navbar-links">
            {user?.role === "Customer" || !user ? (
              <>
                <Link to="/jewelry" onClick={closeMenu}>
                  Jewelry
                </Link>
                {/* <Link to="/jewelry/rings" onClick={closeMenu}>
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
                </Link> */}
                <Link to="/services" onClick={closeMenu}>
                  Services
                </Link>
              </>
            ) : user?.role === "Jeweler" ? (
              <>
                <Link to="/jeweler-jewelry" onClick={closeMenu}>
                  Jewelry
                </Link>
                <Link to="/jeweler-collections" onClick={closeMenu}>
                  Collections
                </Link>
                <Link to="/jeweler-services" onClick={closeMenu}>
                  Services
                </Link>
                <Link to="/jeweler-orders" onClick={closeMenu}>
                  Orders
                </Link>
              </>
            ) : user?.role === "Admin" ? (
              <>
                <Link to="/requests" onClick={closeMenu}>
                  Requests
                </Link>
                <Link to="/dashboard" onClick={closeMenu}>
                  Dashboard
                </Link>
                <Link to="/accounts-management" onClick={closeMenu}>
                  Accounts Management
                </Link>
              </>
            ) : user?.role === "Driver" ? (
              <Link to="/shipments" onClick={closeMenu}>
                Shipments
              </Link>
            ) : null}
          </nav>
        </div>
      </div>
    </>
  )
}

export default Navbar
