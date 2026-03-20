import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/login";
import Register from "./pages/register";
import Products from "./pages/products";
import Orders from "./pages/orders";
import Dashboard from "./pages/dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import Cart from "./pages/cart";
import Analytics from "./pages/analytics";

function App() {
  return (
    <CartProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            } />
            <Route path="/cart" element={
              <ProtectedRoute userOnly>
                <Cart />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute adminOnly>
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </CartProvider>
  );
}

export default App;