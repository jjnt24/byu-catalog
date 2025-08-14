import { useEffect } from "react";
import { initGA, logPageView } from "./analytics";
import { useLocation } from "react-router-dom";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Landing from "./Landing";
// import HomePage from "./HomePage";
import PriceListPage from "./PriceListPage";
import { CartProvider } from "./CartContext";
import { Button, Space } from "antd";
import CartPage from "./CartPage";
import Login from "./Login";

function AnalyticsTracker({ children }) {
  const location = useLocation();

  useEffect(() => {
    initGA();
  }, []);

  useEffect(() => {
    logPageView(location.pathname + location.search);
  }, [location]);

  return children;
}

function App() {
  return (
    <CartProvider>
      <div style={{ backgroundColor: "#fff", color: "#000", minHeight: "100vh" }}>
        <Router>
          <AnalyticsTracker>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/catalog" element={<PriceListPage withCart={true} />} />
              <Route path="/cart" element={<CartPage />} />
            </Routes>
          </AnalyticsTracker>
        </Router>
      </div>
    </CartProvider>
  );
}

export default App;
