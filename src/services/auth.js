import User from "./api"

export const SignUpUser = async (data) => {
  try {
    const res = await User.post("/auth/sign-up", data)
    return res.data
  } catch (error) {
    const message =
      error.response?.data?.msg ||
      error.response?.data?.error ||
      "Sign-up failed."
    throw new Error(message)
  }
}

export const SignInUser = async (data) => {
  try {
    const res = await User.post("/auth/sign-in", data)
    localStorage.setItem("token", res.data.token)
    return res.data.user
  } catch (error) {
    const message =
      error.response?.data?.msg ||
      error.response?.data?.error ||
      "Invalid Credentials!"
    throw new Error(message)
  }
}

export const CheckSession = async () => {
  try {
    const res = await User.get("/auth/session")
    return res.data
  } catch (error) {
    throw error
  }
}
