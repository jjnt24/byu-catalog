import React, { useState } from "react";
import { Button } from "antd";
import "./LoginPopup.css"; // optional for styling

const LoginPopup = ({ onSubmit, onClose }) => {
  const [namaKamu, setNamaKamu] = useState("");
  const [nomorHandphone, setNomorHandphone] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit({ namaKamu, nomorHandphone });
  };

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <button className="popup-close" onClick={onClose}>
          ×
        </button>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Selamat datang di Byusoul Online!
        </h2>
        <p style={{ textAlign: "center", marginBottom: "20px" }}>
          Silakan isi data berikut untuk melanjutkan order ya Byuties!
        </p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="namaKamu">Nama Kamu</label>
            <input
              id="namaKamu"
              name="namaKamu"
              required
              minLength={3}
              value={namaKamu}
              onChange={(e) => setNamaKamu(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                backgroundColor: "#fff",
                color: "#000"
              }}
            />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="nomorHandphone">Nomor Handphone</label>
            <input
              id="nomorHandphone"
              name="nomorHandphone"
              type="tel"
              required
              maxLength={12}
              pattern="[0-9]*"
              value={nomorHandphone}
              onChange={(e) => setNomorHandphone(e.target.value.replace(/\D/, ""))}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                backgroundColor: "#fff",
                color: "#000"
              }}
            />
          </div>
          <Button type="primary" htmlType="submit" block>
            Lihat Produk
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPopup;
