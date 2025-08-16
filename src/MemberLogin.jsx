import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

const containerStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  height: "100dvh", // Use dynamic viewport height for mobile browser bars
  width: "100vw",
  overflow: "hidden",
  background: "#f7f9fb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  padding: "0 8px",
  boxSizing: "border-box",
};

const formStyle = {
  background: "#fff",
  borderRadius: "12px",
  padding: "20px 12px",
  boxShadow: "0 4px 16px rgba(0,0,0,0.09), 0 1.5px 4px rgba(0,0,0,0.08)",
  border: "1px solid #e5e8ef",
  width: "100%",
  maxWidth: "360px",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const labelStyle = {
  fontWeight: 500,
  fontSize: "15px",
  marginBottom: "4px",
};

const inputStyle = {
  width: "100%",
  padding: "14px 12px",
  borderRadius: "8px",
  border: "1px solid #d9d9d9",
  fontSize: "16px",
  marginBottom: "6px",
  outline: "none",
  background: "#fafbfc",
  boxSizing: "border-box",
  transition: "all 0.2s",
  ":focus": {
    borderColor: "#f82896",
    boxShadow: "0 0 0 3px rgba(248, 40, 150, 0.1)",
  }
};

const buttonStyle = {
  width: "100%",
  padding: "14px",
  background: "#f82896",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
  fontSize: "17px",
  marginTop: "10px",
  cursor: "pointer",
  letterSpacing: "0.02em",
  transition: "all 0.2s",
  boxShadow: "0 4px 12px rgba(248, 40, 150, 0.2)",
};

const createAccountButtonStyle = {
  ...buttonStyle,
  background: "#f82896",
  opacity: 0.9,
  marginTop: "8px",
};

const errorStyle = {
  color: "#e53935",
  background: "#fff4f4",
  padding: "8px 10px",
  borderRadius: "6px",
  fontSize: "14px",
  marginBottom: "6px",
  textAlign: "center",
  border: "1px solid #ffcdd2",
};

function MemberLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();


  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // Automatically append pseudo-email domain if missing
      const loginEmail = email.includes("@") ? email : email + "@byumember.com";
      // Convert DD/MM/YYYY to DDMMYYYY for authentication
      const passForAuth = password.replace(/\//g, "");
      await signInWithEmailAndPassword(auth, loginEmail, passForAuth);
      navigate("/memberpage");
    } catch (err) {
      setError("Email atau tanggal lahir salah");
    }
  };

  const handleCreateAccount = () => {
    navigate("/register");
  };

  // Helper to convert YYYY-MM-DD to DDMMYYYY
  const convertDateToDDMMYYYY = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return day + month + year;
  };

  // Helper to convert DDMMYYYY back to YYYY-MM-DD for display (not used here but for completeness)
  const convertDDMMYYYYToDate = (ddmmyyyy) => {
    if (!ddmmyyyy || ddmmyyyy.length !== 8) return "";
    const day = ddmmyyyy.substring(0, 2);
    const month = ddmmyyyy.substring(2, 4);
    const year = ddmmyyyy.substring(4, 8);
    return `${year}-${month}-${day}`;
  };

  // To display the date input, convert stored password DDMMYYYY to YYYY-MM-DD
  const displayDateValue = () => {
    if (!password || password.length !== 8) return "";
    const year = password.substring(4, 8);
    const month = password.substring(2, 4);
    const day = password.substring(0, 2);
    return `${year}-${month}-${day}`;
  };

  return (
    <div style={containerStyle}>
      <style>{`
        html, body {
          height: 100vh !important;
          overflow: hidden !important;
          margin: 0;
          padding: 0;
        }
      `}</style>
      <form style={formStyle} className="member-login-form" onSubmit={handleLogin} autoComplete="on">
        <style>{`
          @media (min-width: 600px) {
            .member-login-form {
              max-width: 400px !important;
              padding: 32px 24px !important;
            }
          }
        `}</style>
        <h2 style={{ textAlign: "center", fontWeight: 700, marginBottom: "10px", fontSize: "1.5rem" }}>
          Login Akun Byuties
        </h2>
        {error && <div style={errorStyle}>{error}</div>}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label htmlFor="email" style={labelStyle}>
            Nomor Handphone
          </label>
          <input
            id="email"
            type="text"
            autoComplete="email"
            placeholder="Masukkan nomor handphone"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", position: "relative" }}>
          <label htmlFor="password" style={labelStyle}>
            Tanggal Lahir
          </label>
          <div style={{ width: "100%" }}>
            <input
              id="password"
              type="text"
              autoComplete="current-password"
              placeholder="DD/MM/YYYY"
              value={password}
              onChange={e => {
                // Only allow numbers and /
                let val = e.target.value.replace(/[^0-9/]/g, "");
                // Auto-insert / as user types
                if (val.length === 2 && password.length === 1) val += "/";
                if (val.length === 5 && password.length === 4) val += "/";
                // Keep value in DD/MM/YYYY format
                setPassword(val);
              }}
              maxLength={10}
              style={inputStyle}
            />
          </div>
        </div>
        <button type="submit" style={buttonStyle}>
          Login
        </button>
        <div style={{ textAlign: "center", marginTop: "12px" }}>
          <span style={{ fontSize: "15px" }}>
            Belum punya akun?{' '}
            <a href="#" style={{ color: "#f82896", textDecoration: "underline", cursor: "pointer", fontWeight: 600 }}
              onClick={e => { e.preventDefault(); navigate("/register"); }}>
              Daftar
            </a>
          </span>
        </div>
      </form>
      <div style={{ marginTop: "16px", textAlign: "center" }}>
        <a href="#" 
          onClick={e => { e.preventDefault(); navigate("/"); }}
          style={{ 
            color: "#6c757d",
            textDecoration: "none",
            fontSize: "14px",
            cursor: "pointer",
            opacity: 0.8,
            transition: "opacity 0.2s",
            ":hover": {
              opacity: 1
            }
          }}
        >
          Kembali ke Halaman Utama
        </a>
      </div>
    </div>
  );
}

export default MemberLogin;