import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
// import HomePage from "./HomePage";
import PriceListPage from "./PriceListPage";

function App() {
  return (
    <Router>
      {/* <nav style={{ padding: 10, background: "#f0f0f0", marginBottom: 20 }}>
        <Link to="/" style={{ marginRight: 10 }}>
          Home
        </Link>
        <Link to="/catalog">Price List</Link>
      </nav> */}

      <Routes>
        <Route path="/" element={<PriceListPage />} />
        <Route path="/catalog" element={<PriceListPage />} />
      </Routes>
    </Router>
  );
}

export default App;
