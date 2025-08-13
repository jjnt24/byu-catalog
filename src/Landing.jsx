import React, { useState, useEffect } from "react";
import "@fontsource/nunito";
import { useNavigate } from "react-router-dom";

const images = [
  "/Shopping.png",
  "/Detective.png",
  "/Wearing Makeup.png"
];

const Landing = () => {
  const [current, setCurrent] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [namaKamu, setNamaKamu] = useState("");
  const [nomorHandphone, setNomorHandphone] = useState("");
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [showPromoBar, setShowPromoBar] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowPromoBar(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleLihatProduk = () => {
    let valid = true;
    if (namaKamu.trim().length < 3) {
      setNameError("Nama tidak valid");
      valid = false;
    } else {
      setNameError("");
    }

    const phoneLength = nomorHandphone.trim().length;
    if (phoneLength < 8 || phoneLength > 14) {
      setPhoneError("Nomor tidak valid");
      valid = false;
    } else {
      setPhoneError("");
    }

    if (!valid) return;

    navigate("/catalog", {
      state: {
        namaKamu,
        nomorHandphone,
        searchValue // pass the Landing search input
      }
    });
    setShowLoginPopup(false);
  };

  return (
    <div
      style={{
        backgroundColor: "#f5f5f5",
        color: "#000",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Nunito', sans-serif",
        padding: "0 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {showPromoBar && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            backgroundColor: "#f82896ff",
            color: "#fff",
            textAlign: "center",
            padding: "6px 10px",
            zIndex: 2000,
            fontWeight: "bold",
            fontStyle: "italic",
            fontSize: "14px",
            animation: "slideDown 0.5s ease-out"
          }}
        >
          ONGOING PROMO 8.8 + HUT RI DISC UP TO 80%, FOLLOW{" "}
          <a
            href="https://www.instagram.com/byusoul_id/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#fff", textDecoration: "underline", fontWeight: "bold", fontStyle: "italic" }}
          >
            @byusoul_id
          </a>{" "}
          UNTUK INFO LEBIH LANJUT
        </div>
      )}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
          }

          @keyframes slideDown {
            0% { transform: translateY(-100%); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>
      <div style={{ position: "relative", width: "100%", maxWidth: "400px", height: "250px", marginBottom: "20px" }}>
        {images.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt=""
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              borderRadius: "15px",
              opacity: current === idx ? 1 : 0,
              transition: "opacity 1s ease-in-out",
              filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))",
            }}
          />
        ))}
      </div>
      
      <h1 style={{ textAlign: "center", margin: "0 10px", marginBottom: "20px", fontWeight: 900 }}>
        Welcome to Byusoul!
      </h1>
      <div style={{ width: "100%", maxWidth: "400px", position: "relative", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Lagi cari produk apa, Byuties?"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 70px 12px 16px", // adjust right padding for button
            borderRadius: "25px",
            border: "1px solid #ccc",
            outline: "none",
            fontSize: "16px",
            boxSizing: "border-box",
            backgroundColor: "#fff",
            color: "#000",
          }}
        />
        <button
          style={{
            position: "absolute",
            right: "5px",
            top: "50%",
            transform: "translateY(-50%)",
            padding: "0 16px",
            height: "40px",
            borderRadius: "20px",
            border: "none",
            backgroundColor: "#f82896",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            fontWeight: 600,
            fontSize: "14px",
          }}
          onClick={() => setShowLoginPopup(true)}
        >
          Cari
        </button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", rowGap: "20px", justifyContent: "center" }}>
        {["Lip","Sunscreen","Face Wash","Azarine","Mykonos","Glad2Glow","Anting","Bando","Slavina","Facetology","Pinkflash","Skin1004"].map((item, idx) => (
          <div
            key={idx}
            onClick={() => setSearchValue(item)}
            style={{
              padding: "6px 12px",
              borderRadius: "20px",
              backgroundColor: "#fff",
              color: "#f82896",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "14px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              animation: `float 3s ease-in-out ${0.2 * idx}s infinite`,
            }}
          >
            {item}
          </div>
        ))}
      </div>

      {/* Move informational texts here */}
      <div style={{ marginTop: "20px", textAlign: "center", fontSize: "14px", lineHeight: "1.5" }}>
        <div>
          Lokasi Store Byusoul:{" "}
          <a
            href="https://maps.app.goo.gl/J1HZKjRzbqhQY1Vo6"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#f82896", textDecoration: "underline" }}
          >
            Byusoul Taman Siswa
          </a>
        </div>
        <div>Coming Soon: Program Membership Byusoul</div>
      </div>

      {showLoginPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "12px",
              width: "350px",
              position: "relative",
            }}
          >
            <button
              onClick={() => setShowLoginPopup(false)}
              style={{
                position: "absolute",
                top: "10px",
                right: "12px",
                border: "none",
                background: "transparent",
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              ×
            </button>
            <h2 style={{ textAlign: "left", marginBottom: "10px" }}>
              Data Pemesan
            </h2>
            <input
              type="text"
              placeholder="Nama"
              value={namaKamu}
              onChange={(e) => setNamaKamu(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                marginBottom: "4px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                backgroundColor: "#fff",
                color: "#000",
              }}
            />
            {nameError && <div style={{ color: "red", fontSize: "12px", marginBottom: "8px" }}>{nameError}</div>}
            <input
              type="tel"
              placeholder="Nomor WhatsApp"
              value={nomorHandphone}
              onChange={(e) => setNomorHandphone(e.target.value.replace(/\D/, ""))}
              maxLength={14}
              style={{
                width: "100%",
                padding: "8px 12px",
                marginBottom: "4px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                backgroundColor: "#fff",
                color: "#000",
              }}
            />
            {phoneError && <div style={{ color: "red", fontSize: "12px", marginBottom: "8px" }}>{phoneError}</div>}
            <button
              style={{
                width: "150px",          // smaller width
                padding: "8px 12px",     // smaller padding
                borderRadius: "6px",
                backgroundColor: "#f82896",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                display: "block",        // center the button
                margin: "10px auto 0 auto", // center horizontally with top margin
              }}
              onClick={handleLihatProduk}
            >
              Mulai Pencarian
            </button>
          </div>
        </div>
      )}
      <div style={{ position: "absolute", bottom: "10px", width: "100%", textAlign: "center", color: "#888", fontSize: "12px" }}>
        Versi 1.0
      </div>
    </div>
  );
};

export default Landing;