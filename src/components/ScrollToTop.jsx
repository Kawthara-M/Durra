import { useEffect } from "react"
import { useLocation } from "react-router-dom"

const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // this makes it smooth
    })
  }, [pathname]) // runs every time you change page

  return null
}

export default ScrollToTop
