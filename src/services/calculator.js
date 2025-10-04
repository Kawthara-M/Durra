// export const fetchMetalRates = async () => {
//   try {
//     const url =
//       "https://api.metals.dev/v1/latest?api_key=GF9QACGGAWN9BJKRDDYO374KRDDYO&currency=BHD&unit=g"
//     const response = await fetch(url, {
//       headers: {
//         Accept: "application/json",
//       },
//     })

//     const result = await response.json()
//     return result?.metals || {}
//   } catch (error) {
//     console.error("Failed to fetch metal rates", error)
//     throw new Error("Failed to load metal rates")
//   }
// }

  // to save api req available
  export const fetchMetalRates = async () => {
  return {
    gold: 50,
    silver: 0.7,
    platinum: 25,
    // etc
  }
}
// Helper to convert karat to percent (e.g. 18k = 0.75)
export const getKaratMultiplier = (karat) => {
  const k = parseFloat(karat)
  if (isNaN(k)) return 1 // fallback to pure metal
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

export const calculatePreciousMaterialCost = (
  preciousMaterials = [],
  metalRates = {}
) => {
  return preciousMaterials.reduce((total, material) => {
    const metalName = material.name.toLowerCase()
    let metalKey = metalName

    if (metalName === "platinium") metalKey = "platinum"

    const pureMetalPrice = metalRates[metalKey] || 0
    const karatMultiplier = getKaratMultiplier(material.karat)
    const costPerGram = pureMetalPrice * karatMultiplier
    const weight = parseFloat(material.weight || 0)

    return total + costPerGram * weight
  }, 0)
}

// Total cost = precious materials + origin
export const calculateTotalCost = (
  preciousMaterialCost = 0,
  originCost = 0
) => {
  return parseFloat(preciousMaterialCost) + parseFloat(originCost)
}
