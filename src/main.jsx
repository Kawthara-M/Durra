import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { ThemeProvider } from "./context/ThemeContext.jsx"
import { UserProvider } from "./context/UserContext"
import { CartProvider } from "./context/CartContext.jsx"
import App from "./App.jsx"

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <UserProvider>
      <CartProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </CartProvider>
    </UserProvider>
  </BrowserRouter>
)
