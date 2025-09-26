import { useState } from "react"
import SignIn from "../components/SignIn"
import SignUp from "../components/SignUp"

const Authentication = () => {
  const [showSignUp, setShowSignUp] = useState(false)

  return (
    <>
      <div className="authentication-card">
        {showSignUp ? (
          <SignUp setShowSignUp={setShowSignUp} />
        ) : (
          <SignIn setShowSignUp={setShowSignUp} />
        )}
      </div>
    </>
  )
}

export default Authentication
