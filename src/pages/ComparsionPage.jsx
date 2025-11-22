import Comparsion from "../components/Comparsion"
import { useUser } from "../context/UserContext"

const ComparisonPage = () => {
  const { user } = useUser()
  if (!user) return
  return <Comparsion />
}

export default ComparisonPage
