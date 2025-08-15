import { useEffect, useState } from "react";
import { initGA, logPageView } from "./analytics";
import { useLocation, Navigate } from "react-router-dom";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Landing from "./Landing";
// import HomePage from "./HomePage";
import PriceListPage from "./PriceListPage";
import { CartProvider } from "./CartContext";
import { Button, Space } from "antd";
import CartPage from "./CartPage";
import MemberPage from "./MemberPage";
import MemberLogin from "./MemberLogin";
import MemberRegister from "./MemberRegister";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

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
  // Wrapper component for protecting the member page using Firebase Auth
  function ProtectedMemberPage() {
    const [user, setUser] = useState(undefined);
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
      });
      return () => unsubscribe();
    }, []);
    if (user === undefined) {
      // Still loading auth state
      return null;
    }
    if (!user) {
      return <Navigate to="/memberlogin" />;
    }
    return <MemberPage />;
  }

  return (
    <CartProvider>
      <div style={{ backgroundColor: "#fff", color: "#000", minHeight: "100vh" }}>
        <Router>
          <AnalyticsTracker>
            <Routes>
              
              <Route path="/" element={<Landing />} />
              <Route path="/memberlogin" element={<MemberLogin />} />
              <Route path="/catalog" element={<PriceListPage withCart={true} />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/register" element={<MemberRegister />} />
              <Route
                path="/memberpage"
                element={<ProtectedMemberPage />}
              />
              <Route
                path="*"
                element={
                  localStorage.getItem("isLoggedIn") === "true" ? (
                    <Navigate to="/memberpage" />
                  ) : (
                    <Navigate to="/" />
                    
                  )
                }
              />
              
            </Routes>
          </AnalyticsTracker>
        </Router>
      </div>
    </CartProvider>
  );
}

export default App;
