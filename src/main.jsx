import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { ThemeProvider } from "./context/ThemeContext.jsx"
import { UserProvider } from "./context/UserContext"
import App from "./App.jsx"

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <UserProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </UserProvider>
  </BrowserRouter>
)
