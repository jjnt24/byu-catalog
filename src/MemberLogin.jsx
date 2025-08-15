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
  padding: "0 8px",
};

const formStyle = {
  background: "#fff",
  borderRadius: "12px",
  padding: "28px 20px",
  boxShadow: "0 4px 16px rgba(0,0,0,0.09), 0 1.5px 4px rgba(0,0,0,0.08)",
  border: "1px solid #e5e8ef",
  width: "100%",
  maxWidth: "370px",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  gap: "14px",
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
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/memberpage");
    } catch (err) {
      setError("Email atau password salah");
    }
  };

  const handleCreateAccount = () => {
    navigate("/register");
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
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="Masukkan email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label htmlFor="password" style={labelStyle}>
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Masukkan password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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