export const fetchMetalRates = async () => {
  const FALLBACK_RATES = {
    gold: 24.5,
    silver: 0.32,
    platinum: 31.1,
  }

  try {
    const res = await fetch(import.meta.env.VITE_METALS_API)

    if (!res.ok) {
      throw new Error("API error or quota exceeded")
    }

    const data = await res.json()


    const normalized = data.metals || data

    localStorage.setItem("metalRatesCache", JSON.stringify(normalized))

    return normalized
  } catch (err) {
    console.warn("Rates API failed, using fallback:", err.message)

    const cached = localStorage.getItem("metalRatesCache")
    if (cached) {
      console.log("Using cached metal rates")
      return JSON.parse(cached)
    }

    console.log("Using default backup metal rates")
    return FALLBACK_RATES
  }
}

export const getKaratMultiplier = (karat) => {
  const k = parseFloat(karat)
  if (isNaN(k)) return 1
  return k / 24
}

export const getKaratAdjustedPricePerGram = (
  metalName,
  karat,
  metalRates = {}
) => {
  const metalKey =
    metalName.toLowerCase() === "platinium"
      ? "platinum"
      : metalName.toLowerCase()
  const pureMetalPrice = metalRates[metalKey] || 0
  const karatMultiplier = getKaratMultiplier(karat)
  return pureMetalPrice * karatMultiplier
}

export const calculatePreciousMaterialCost = (materials, metalRates) => {
  if (!materials || !metalRates) return 0
  console.log(materials)
  console.log(metalRates)

  let total = 0
  for (const mat of materials) {
    const rate = metalRates[mat.name?.toLowerCase()] || 0
    total += rate * mat.weight
  }
  console.log(total)
  return total
}

// Total cost = precious materials + origin
export const calculateTotalCost = (
  preciousMaterialCost = 0,
  originCost = 0
) => {
  return parseFloat(preciousMaterialCost) + parseFloat(originCost)
}

export const calculateCollectionPrice = (collection, metalRates) => {
  console.log("here")
  if (!metalRates || !collection?.jewelry?.length) return null
  let jewelryCostSum = 0
  for (const jewel of collection.jewelry) {
    console.log(jewel)
    const metalCost = calculatePreciousMaterialCost(
      jewel.preciousMaterials,
      metalRates
    )

    const jewelPrice = calculateTotalCost(metalCost, jewel.originPrice)
    jewelryCostSum += jewelPrice
  }

  const final = jewelryCostSum + collection.originPrice

  return Math.max(final, 0)
}
