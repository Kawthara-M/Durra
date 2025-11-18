import User from "./api"

export const getComparison = async () => {
  try {
    const res = await User.get("/comparsion")
    return res.data.comparsion
  } catch (err) {
    if (err.response?.status === 404) return null
    throw err
  }
}

export const addToComparison = async (jewelryId) => {
  const existing = await getComparison()

  if (!existing) {
    const res = await User.post("/comparsion", { jewelryId })
    return res.data.comparsion
  }

  const existingIds = existing.jewelry.map((j) =>
    typeof j === "string" ? j : j._id
  )

  if (existingIds.includes(jewelryId)) {
    return existing
  }

  const updatedIds = [...existingIds, jewelryId]

  const res = await User.put("/comparsion", {
    jewelry: updatedIds,
  })
  return res.data.comparsion
}

export const removeFromComparison = async (jewelryId) => {
  const existing = await getComparison()
  if (!existing) return null

  const existingIds = existing.jewelry.map((j) =>
    typeof j === "string" ? j : j._id
  )

  const updatedIds = existingIds.filter((id) => id !== jewelryId)

  const res = await User.put("/comparsion", {
    jewelry: updatedIds,
  })
  return res.data.comparsion
}
