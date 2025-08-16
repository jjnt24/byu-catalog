import React, { useState, useEffect } from "react";
import ReactGA from "react-ga4";
import "@fontsource/nunito";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const [searchValue, setSearchValue] = useState("");
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [namaKamu, setNamaKamu] = useState(() => sessionStorage.getItem("byusoulNama") || "");
  const [nomorHandphone, setNomorHandphone] = useState(() => sessionStorage.getItem("byusoulNomor") || "");
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [fromPromoButton, setFromPromoButton] = useState(false);

  const navigate = useNavigate();

  const handleLihatProduk = () => {
    ReactGA.event({
      category: "Landing Page",
      action: "Click Mulai Pencarian",
      label: "Submit User Data"
    });

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

    // Save to session storage
    sessionStorage.setItem("byusoulNama", namaKamu);
    sessionStorage.setItem("byusoulNomor", nomorHandphone);

    navigate("/catalog", {
      state: {
        namaKamu,
        nomorHandphone,
        searchValue, // pass the Landing search input
        showPromoFilter: fromPromoButton // indicate if we should show promo items
      }
    });
    setShowLoginPopup(false);
    setFromPromoButton(false); // Reset after navigation
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Logo */}
      <img
        src="/LogoTransparan.png"
        alt="Byusoul Logo"
        style={{
          position: "fixed",
          top: isDesktop ? "32px" : "24px",
          left: "50%",
          transform: "translateX(-50%)",
          width: isDesktop ? "150px" : "120px",
          height: "auto",
          zIndex: 100
        }}
      />
      <div
        style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100dvh", // Use dynamic viewport height
        width: "100vw",
        backgroundColor: "white",
        color: "#000",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Nunito', sans-serif",
        padding: isDesktop ? "32px" : "16px",
        boxSizing: "border-box",
        overflowX: "hidden",
        overflowY: "auto" // Allow scrolling while maintaining fixed positioning
      }}
    >

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          html, body {
            height: 100dvh !important;
            overflow: hidden !important;
            margin: 0;
            padding: 0;
          }

          #root {
            height: 100dvh;
            width: 100vw;
            background-color: #f5f5f5;
            overflow: hidden;
          }

          @media screen and (max-height: 700px) {
            body {
              overflow-y: auto !important;
            }
          }

          @media screen and (min-width: 1200px) {
            .landing-container {
              max-width: 1200px;
              margin: 0 auto;
            }
          }
        `}
      </style>
      <div style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: isDesktop ? "24px" : "16px",
        }}>
        <img
          src="/Kucing Happy.png"
          alt="Kucing Happy"
          style={{
            width: isDesktop ? "320px" : "260px",
            height: "auto",
            objectFit: "contain",
            filter: "drop-shadow(0 -15px 20px rgba(248, 40, 150, 0.15))",
            transform: "translateZ(0)",
            position: "absolute",
            top: isDesktop ? "-40px" : "-30px",
            zIndex: 1,
          }}
        />
        <h1 style={{ 
            textAlign: "center", 
            margin: "0 10px",
            fontWeight: 900,
            fontSize: isDesktop ? "48px" : "40px",
            lineHeight: 1.1,
            maxWidth: isDesktop ? "800px" : "100%",
            letterSpacing: "-0.02em",
            color: "#000",
            textShadow: "0 2px 4px rgba(0,0,0,0.1)",
            position: "relative",
            zIndex: 2,
            marginTop: isDesktop ? "220px" : "180px", // Adjust based on image height
            transform: "translateZ(0)",
            fontFamily: "Nunito, sans-serif",
            fontWeight: 900
        }}>
          Welcome to Byusoul!
        </h1>
      </div>
      <div style={{ width: "100%", maxWidth: "400px", position: "relative", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Lagi cari produk apa, Byuties?"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
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
            transition: "all 0.3s ease",
            boxShadow: isSearchFocused ? "0 0 10px rgba(248, 40, 150, 0.2)" : "none",
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
          onClick={() => {
            ReactGA.event({
              category: "Landing Page",
              action: "Click Cari Button",
              label: "Navigate or Open Login Popup"
            });
            setFromPromoButton(false);
            
            // If we have stored user info, navigate directly
            if (sessionStorage.getItem("byusoulNama") && sessionStorage.getItem("byusoulNomor")) {
              navigate("/catalog", {
                state: {
                  namaKamu: sessionStorage.getItem("byusoulNama"),
                  nomorHandphone: sessionStorage.getItem("byusoulNomor"),
                  searchValue,
                  showPromoFilter: false
                }
              });
            } else {
              setShowLoginPopup(true);
            }
          }}
        >
          Cari
        </button>
      </div>
      {/* Action Buttons */}
      <style>{`
        @keyframes shine {
          0% {
            background-position: 200% center;
          }
          100% {
            background-position: -200% center;
          }
        }
        .login-button {
          font-family: "Nunito", sans-serif !important;
          background: linear-gradient(
            90deg, 
            #f82896 21%, 
            #ff4bab 24%, 
            #f82896 27%,
            #f82896 100%
          );
          background-size: 200% auto;
          animation: shine 5s linear infinite;
        }
        .login-button span {
          background: linear-gradient(
            90deg,
            #fff 40%,
            #ffe1ee 45%,
            #fff 50%,
            #fff 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          background-size: 200% auto;
          animation: shine 5s linear infinite;
          display: inline-block;
        }
      `}</style>
      {/* User info badge */}
      <div style={{
        position: "fixed",
        top: isDesktop ? "100px" : "85px", // Position below logo
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 99,
        width: "auto",
        minWidth: isDesktop ? "200px" : "180px",
      }}>
        {sessionStorage.getItem("byusoulNama") && (
          <div style={{
            backgroundColor: "#fee4f1",
            padding: "8px 16px",
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            fontSize: "14px",
            color: "#f82896",
            boxShadow: "0 2px 4px rgba(248, 40, 150, 0.1)",
            animation: "fadeIn 0.3s ease-out",
            whiteSpace: "nowrap"
          }}>
            <span style={{ fontSize: "16px" }}>👋</span>
            <span>Welcome back, <strong>{sessionStorage.getItem("byusoulNama")}</strong></span>
          </div>
        )}
      </div>
      <div style={{
        width: "100%",
        maxWidth: "400px",
        display: isSearchFocused ? "none" : "flex",
        gap: "8px",
        marginTop: "2px",
      }}>
        <button
          onClick={() => navigate('/memberlogin')}
          className="login-button"
          style={{
            flex: 1,
            height: "70px",
            padding: "8px",
            borderRadius: "20px",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            fontSize: "15px",
            fontFamily: '"Nunito", sans-serif',
            fontWeight: 900,
            boxShadow: "0 4px 12px rgba(248, 40, 150, 0.3)",
            transition: "transform 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            letterSpacing: "0.02em",
          }}
        >
          <span>👑 Byuties Login</span>
        </button>
        <button
          onClick={() => {
            ReactGA.event({
              category: "Landing Page",
              action: "Click Cek Promo",
              label: "Navigate or Open Login Popup"
            });
            setFromPromoButton(true);
            
            // If we have stored user info, navigate directly
            if (sessionStorage.getItem("byusoulNama") && sessionStorage.getItem("byusoulNomor")) {
              navigate("/catalog", {
                state: {
                  namaKamu: sessionStorage.getItem("byusoulNama"),
                  nomorHandphone: sessionStorage.getItem("byusoulNomor"),
                  searchValue,
                  showPromoFilter: true
                }
              });
            } else {
              setShowLoginPopup(true);
            }
          }}
          style={{
            flex: 1,
            height: "70px",
            padding: "8px",
            borderRadius: "20px",
            border: "none",
            backgroundColor: "white",
            color: "#333",
            cursor: "pointer",
            fontSize: "15px",
            fontWeight: "600",
            transition: "all 0.2s",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Cek Promo
        </button>
      </div>
      <div style={{ 
        display: isSearchFocused ? "flex" : "none",
        flexWrap: "wrap", 
        gap: "10px", 
        rowGap: "20px", 
        justifyContent: "center"
      }}>
        <style>{`
          @keyframes popIn {
            0% { 
              opacity: 0; 
              transform: scale(0.5); 
            }
            70% { 
              transform: scale(1.1); 
            }
            100% { 
              opacity: 1; 
              transform: scale(1); 
            }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
          }
        `}</style>
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
              opacity: 0,
              animation: isSearchFocused ? 
                `popIn 0.3s ${idx * 0.05}s forwards, float 3s ease-in-out ${0.2 * idx}s infinite` : 
                "none",
            }}
          >
            {item}
          </div>
        ))}
      </div>

      {/* Store location */}
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
      </div>

      {/* Version number - positioned at bottom */}
      <div style={{ 
          position: "fixed",
          bottom: isDesktop ? "24px" : "16px",
          left: 0,
          width: "100%",
          textAlign: "center", 
          color: "#888", 
          fontSize: "12px",
          padding: "10px 16px",
          boxSizing: "border-box",
          zIndex: 90,
      }}>
        Versi 1.1
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
            padding: "16px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "350px",
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
            <h2 style={{ textAlign: "left", marginBottom: "4px" }}>
              Data Pemesan
            </h2>
            <div style={{
              fontSize: "12px",
              color: "#666",
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}>
              <span style={{ color: "#f82896" }}>🔒</span>
              Information will be saved for this session
            </div>
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
      </div>
    </div>
  );
};

export default Landing;