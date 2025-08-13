import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
// import HomePage from "./HomePage";
import PriceListPage from "./PriceListPage";
import { CartProvider } from "./CartContext";
import { Button, Space } from "antd";
import CartPage from "./CartPage";
import Login from "./Login";

function App() {
  return (
    <CartProvider>
      <Router>
        {/* <nav style={{ padding: 10, background: "#f0f0f0", marginBottom: 20 }}>
          <Link to="/" style={{ marginRight: 10 }}>
            Home
          </Link>
          <Link to="/catalog">Price List</Link>
        </nav> */}

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/catalog" element={<PriceListPage withCart={true} />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
