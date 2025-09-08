import { useState } from "react"
import SignIn from "../components/SignIn"
import SignUp from "../components/SignUp"

const Authentication = () => {
  const [showSignUp, setShowSignUp] = useState(false)

  return (
    <>
      {showSignUp ? (
        <SignUp setShowSignUp={setShowSignUp} />
      ) : (
        <SignIn setShowSignUp={setShowSignUp} />
      )}
    </>
  )
}

export default Authentication
