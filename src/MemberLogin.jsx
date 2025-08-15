import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

const containerStyle = {
  minHeight: "100vh",
  background: "#f7f9fb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  padding: "0 100px",
  width: "100vw",
};

const formStyle = {
  background: "#fff",
  borderRadius: "12px",
  padding: "28px 20px",
  boxShadow: "0 4px 16px rgba(0,0,0,0.09), 0 1.5px 4px rgba(0,0,0,0.08)",
  border: "1px solid #e5e8ef",
  width: "100%",
  maxWidth: "400px",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  gap: "5px",
};

const labelStyle = {
  fontWeight: 500,
  fontSize: "15px",
  marginBottom: "4px",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #d9d9d9",
  fontSize: "15px",
  marginBottom: "2px",
  outline: "none",
  background: "#fafbfc",
  boxSizing: "border-box",
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  background: "#1890ff",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  fontWeight: "bold",
  fontSize: "16px",
  marginTop: "8px",
  cursor: "pointer",
  letterSpacing: "0.02em",
  transition: "background 0.2s",
};

const createAccountButtonStyle = {
  ...buttonStyle,
  background: "#6c757d",
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
      await signInWithEmailAndPassword(auth, loginEmail, password);
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
      <form style={formStyle} onSubmit={handleLogin} autoComplete="on">
        <h2 style={{ textAlign: "center", fontWeight: 700, marginBottom: "10px", fontSize: "1.5rem" }}>
          Login
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
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label htmlFor="password" style={labelStyle}>
            Tanggal Lahir
          </label>
          <input
            id="password"
            type="date"
            autoComplete="current-password"
            placeholder="Masukkan password"
            value={displayDateValue()}
            onChange={(e) => setPassword(convertDateToDDMMYYYY(e.target.value))}
            style={inputStyle}
          />
        </div>
        <button type="submit" style={buttonStyle}>
          Login
        </button>
        <button type="button" style={createAccountButtonStyle} onClick={handleCreateAccount}>
          Create Account
        </button>
      </form>
    </div>
  );
}

export default MemberLogin;