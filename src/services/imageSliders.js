import { useState, useEffect } from "react"

const imageSlider = (images = []) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const resetIndex = () => {
    setCurrentIndex(0)
  }

  useEffect(() => {
    if (images.length === 0) {
      setCurrentIndex(0)
    } else if (currentIndex >= images.length) {
      setCurrentIndex(images.length - 1)
    }
  }, [images, currentIndex])

  return {
    currentIndex,
    setCurrentIndex,
    handleNext,
    handlePrev,
    resetIndex,
  }
}

export default imageSlider
