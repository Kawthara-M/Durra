import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { ThemeProvider } from "./context/ThemeContext.jsx"
import { UserProvider } from "./context/UserContext"
import { OrderProvider } from "./context/OrderContext.jsx"
import App from "./App.jsx"

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <UserProvider>
      <OrderProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </OrderProvider>
    </UserProvider>
  </BrowserRouter>
)
