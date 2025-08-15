import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EditOutlined, InstagramFilled, PlayCircleFilled } from "@ant-design/icons";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function MemberPage() {
  const [memberName] = useState("Member Name");
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const overlayRef = useRef(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState(memberName);
  const [address, setAddress] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [favoriteBrandInput, setFavoriteBrandInput] = useState("");
  const [favoriteBrands, setFavoriteBrands] = useState([]);
  const [job, setJob] = useState("");
  const [socialMedias, setSocialMedias] = useState([{ platform: '', handle: '' }]);
  const [uid, setUid] = useState(null);
  const navigate = useNavigate();

  // Firestore: Save member data
  async function saveMemberData() {
    if (!uid) return;
    const data = {
      name,
      phoneNumber,
      address,
      birthDate,
      job,
      favoriteBrands,
      socialMedias,
    };
    try {
      await setDoc(doc(db, "MemberData", uid), data, { merge: true });
    } catch (err) {
      console.error("Failed to save member data:", err);
    }
  }

  // Firestore: Load member data
  async function loadMemberData(user) {
    if (!user) return;
    try {
      const ref = doc(db, "MemberData", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        if (typeof data === "object" && data !== null) {
          if (typeof data.name === "string") setName(data.name);
          if (typeof data.address === "string") setAddress(data.address);
          if (typeof data.birthDate === "string") setBirthDate(data.birthDate);
          if (typeof data.job === "string") setJob(data.job);
          if (Array.isArray(data.favoriteBrands)) setFavoriteBrands(data.favoriteBrands);
          if (Array.isArray(data.socialMedias)) setSocialMedias(data.socialMedias);
          if (typeof data.phoneNumber === "string") setPhoneNumber(data.phoneNumber);
        }
      } else {
        // If no data, use defaults & set phone number from auth
        setName(user.displayName || memberName);
        setPhoneNumber(user.phoneNumber || "");
        setAddress("");
        setBirthDate("");
        setJob("");
        setFavoriteBrands([]);
        setSocialMedias([{ platform: '', handle: '' }]);
      }
    } catch (err) {
      console.error("Failed to load member data:", err);
    }
  }

  // On mount, check auth and load Firestore member data
  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/", { replace: true });
        return;
      }
      setUid(user.uid);
      setPhoneNumber(user.phoneNumber || "");
      loadMemberData(user);
    });
    return () => unsub();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (showOverlay) {
      // Trigger animation after mount
      const t = setTimeout(() => setOverlayOpen(true), 10);
      return () => clearTimeout(t);
    } else {
      setOverlayOpen(false);
    }
  }, [showOverlay]);

  useEffect(() => {
    if (socialMedias.length === 0) {
      setSocialMedias([{ platform: '', handle: '' }]);
    }
  }, [socialMedias]);

  const transactions = [
    { date: "2025-08-01", value: 50000, quantity: 2 },
    { date: "2025-07-28", value: 75000, quantity: 3 },
    { date: "2025-07-15", value: 30000, quantity: 1 },
  ];

  const addFavoriteBrand = () => {
    const trimmed = favoriteBrandInput.trim();
    if (trimmed && favoriteBrands.length < 10 && !favoriteBrands.includes(trimmed)) {
      setFavoriteBrands([...favoriteBrands, trimmed]);
      setFavoriteBrandInput("");
    }
  };

  const removeFavoriteBrand = (brand) => {
    setFavoriteBrands(favoriteBrands.filter((b) => b !== brand));
  };

  const updateSocialMedia = (index, field, value) => {
    const newSocialMedias = [...socialMedias];
    newSocialMedias[index] = { ...newSocialMedias[index], [field]: value };
    setSocialMedias(newSocialMedias);
  };

  const addSocialMediaEntry = () => {
    setSocialMedias([...socialMedias, { platform: '', handle: '' }]);
  };

  // Button: Check Firestore Data for current UID
  const checkFirestoreData = async () => {
    if (!uid) {
      console.warn("No UID available.");
      return;
    }
    try {
      const ref = doc(db, "MemberData", uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        console.log("Firestore document for UID", uid, ":", snap.data());
      } else {
        console.log("No document found in Firestore for UID", uid);
      }
    } catch (err) {
      console.error("Failed to fetch Firestore data for UID", uid, ":", err);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#fff",
        minHeight: "100vh",
        overflowX: "hidden",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 100,
          height: 100,
          borderRadius: "50%",
          backgroundColor: "#d3d3d3",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 50,
          userSelect: "none",
        }}
        aria-label="Profile picture placeholder"
      >
        👤
      </div>
      <h2 style={{ textAlign: "center", marginTop: 16, marginBottom: 4 }}>
        Hi, {name}
      </h2>
      {uid && (
        <>
          <p style={{ textAlign: "center", margin: 2, fontSize: "0.85em", color: "#555" }}>
            UID: {uid}
          </p>
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <button
              style={{
                padding: "6px 16px",
                fontSize: "0.95em",
                background: "#eee",
                color: "#333",
                border: "1px solid #ccc",
                borderRadius: "6px",
                cursor: "pointer",
                marginTop: "4px"
              }}
              onClick={checkFirestoreData}
            >
              Check Firestore Data
            </button>
          </div>
        </>
      )}
      <p style={{ textAlign: "center", margin: 2 }}>Member Sejak:</p>
      <p style={{ textAlign: "center", margin: 2 }}>Phone Number: {phoneNumber}</p>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          color: "#1890ff",
          cursor: "pointer",
          fontSize: "0.9em",
          marginTop: 4,
          marginBottom: 8,
          userSelect: "none"
        }}
        onClick={() => setShowOverlay(true)}
      >
        <EditOutlined style={{ marginRight: 4 }} />
        Edit Profil
      </span>
      <div style={{ position: "relative", width: "100%", maxWidth: "400px" }}>
        {showOverlay && (
          <div
            ref={overlayRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              backgroundColor: "#f0f0f0",
              maxHeight: overlayOpen ? "100vh" : "0",
              overflowY: overlayOpen ? "auto" : "hidden",
              transition: "max-height 0.5s ease",
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              padding: "16px"
            }}
          >
            <label style={{ marginBottom: "4px" }}>Nama</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                marginBottom: "12px",
                width: "100%",
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                boxSizing: "border-box",
                backgroundColor: "#fff",
                color: "#000"
              }}
            />
            <label style={{ marginBottom: "4px" }}>Nomor Handphone</label>
            <input
              type="text"
              value={phoneNumber}
              disabled
              style={{
                marginBottom: "12px",
                width: "100%",
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                boxSizing: "border-box",
                backgroundColor: "#e0e0e0",
                color: "#555"
              }}
            />
            <label style={{ marginBottom: "4px" }}>Alamat</label>
            <input
              type="text"
              placeholder="Masukkan alamat"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{
                marginBottom: "12px",
                width: "100%",
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                boxSizing: "border-box",
                backgroundColor: "#fff",
                color: "#000"
              }}
            />
            <label style={{ marginBottom: "4px" }}>Tanggal Lahir</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              style={{
                marginBottom: "12px",
                width: "100%",
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                boxSizing: "border-box",
                backgroundColor: "#fff",
                color: "#000"
              }}
            />
            <label style={{ marginBottom: "4px" }}>Brand Favorit</label>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                padding: "4px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                backgroundColor: "#fff",
                marginBottom: "12px"
              }}
            >
              {favoriteBrands.map((brand) => (
                <span
                  key={brand}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    backgroundColor: "#1890ff",
                    color: "#fff",
                    padding: "2px 6px",
                    borderRadius: "12px",
                    fontSize: "0.85em",
                    userSelect: "none",
                    marginRight: "6px",
                    marginBottom: "4px"
                  }}
                >
                  {brand}
                  <button
                    type="button"
                    onClick={() => removeFavoriteBrand(brand)}
                    style={{
                      marginLeft: "6px",
                      background: "transparent",
                      border: "none",
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: "bold",
                      lineHeight: 1,
                      fontSize: "1em",
                      padding: 0,
                      userSelect: "none"
                    }}
                    aria-label={`Remove ${brand}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={favoriteBrandInput}
                onChange={(e) => setFavoriteBrandInput(e.target.value)}
                style={{
                  flexGrow: 1,
                  border: "none",
                  outline: "none",
                  backgroundColor: "#fff",
                  color: "#000",
                  minWidth: "120px",
                  padding: "4px 8px",
                  fontSize: "1em"
                }}
                onKeyDown={(e) => { if(e.key === "Enter") { e.preventDefault(); addFavoriteBrand(); } }}
                placeholder="Tambah brand"
              />
            </div>
            <label style={{ marginBottom: "4px" }}>Pekerjaan</label>
            <input
              type="text"
              value={job}
              onChange={(e) => setJob(e.target.value)}
              style={{
                marginBottom: "12px",
                width: "100%",
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                boxSizing: "border-box",
                backgroundColor: "#fff",
                color: "#000"
              }}
            />
            <label style={{ marginBottom: "4px" }}>Social media</label>
            <div style={{ marginBottom: "12px" }}>
              {socialMedias.map((sm, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  {sm.platform === '' ? (
                    <select
                      value={sm.platform}
                      onChange={(e) => updateSocialMedia(index, 'platform', e.target.value)}
                      style={{
                        padding: "8px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        backgroundColor: "#fff",
                        color: "#000",
                        flexGrow: 1,
                      }}
                    >
                      <option value="" disabled>
                        Pilih platform
                      </option>
                      <option value="Instagram">Instagram</option>
                      <option value="Tiktok">Tiktok</option>
                    </select>
                  ) : (
                    <>
                      <div
                        style={{
                          backgroundColor: "#ff69b4",
                          color: "#fff",
                          padding: "0px 0px",
                          borderRadius: "6px",
                          fontWeight: "bold",
                          marginRight: "8px",
                          userSelect: "none",
                          minWidth: "44px",
                          minHeight: "44px",
                          textAlign: "center",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        {sm.platform === "Instagram" && (
                          <InstagramFilled style={{ color: "#fff", fontSize: "1.2em" }} />
                        )}
                        {sm.platform === "Tiktok" && (
                          // TikTokOutlined is not available, using PlayCircleFilled as placeholder
                          <PlayCircleFilled style={{ color: "#fff", fontSize: "1.2em" }} />
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
                        <span
                          style={{
                            backgroundColor: "#eee",
                            borderTopLeftRadius: "6px",
                            borderBottomLeftRadius: "6px",
                            padding: "8px",
                            border: "1px solid #ccc",
                            borderRight: "none",
                            color: "#555",
                            userSelect: "none",
                            fontSize: "1em",
                          }}
                        >
                          @
                        </span>
                        <input
                          type="text"
                          value={sm.handle}
                          onChange={(e) => updateSocialMedia(index, 'handle', e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              // Optionally, can add validation or move focus
                            }
                          }}
                          style={{
                            padding: "8px",
                            borderRadius: "0 6px 6px 0",
                            border: "1px solid #ccc",
                            borderLeft: "none",
                            width: "185px",
                            maxWidth: "100%",
                            fontSize: "1em",
                            backgroundColor: "#fff",
                            color: "#000",
                          }}
                          placeholder="Handle"
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
              {socialMedias.length > 0 && (
                <div
                  onClick={addSocialMediaEntry}
                  style={{
                    color: "#1890ff",
                    cursor: "pointer",
                    userSelect: "none",
                    fontSize: "0.9em",
                  }}
                >
                  + Tambahkan sosial media
                </div>
              )}
            </div>
            <div style={{ flex: 1 }} />
            <button
              style={{
                marginTop: "auto",
                marginBottom: "16px",
                alignSelf: "center",
                padding: "10px 24px",
                fontSize: "1em",
                background: "#1890ff",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
              onClick={async () => {
                await saveMemberData();
                setShowOverlay(false);
                setOverlayOpen(false);
              }}
            >
              Selesai
            </button>
          </div>
        )}
        <div style={{ marginTop: 24 }}>
          <img
            src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${phoneNumber}&scale=3&height=10&includetext=true&filetype=svg&backgroundcolor=ffffff`}
            alt="Barcode"
            style={{ width: "300px", height: "70px", objectFit: "contain" }}
          />
        </div>
        <p style={{ textAlign: "center", margin: 2 }}>Byu Points: 0</p>
        <h3 style={{ marginTop: 24, marginBottom: 8 }}>Transaksi Sebelumnya</h3>
        {transactions.map(({ date, value, quantity }, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              maxWidth: "400px",
              padding: "8px 0",
              borderBottom: "1px solid #ccc",
            }}
          >
            <div>
              <div style={{ fontWeight: "bold" }}>
                {new Date(date).toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
              <div style={{ fontSize: "0.85em" }}>Rp {value.toLocaleString()}</div>
              <div style={{ fontSize: "0.85em" }}>Qty: {quantity}</div>
            </div>
            <div style={{ color: "green", fontWeight: "bold", alignSelf: "center" }}>
              + {Math.floor(value / 2500)} Byu Point
            </div>
          </div>
        ))}
        {/* Logout Button */}
        <div style={{ width: "100%", display: "flex", justifyContent: "center", marginTop: 32 }}>
          <button
            style={{
              padding: "10px 24px",
              fontSize: "1em",
              background: "#1890ff",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              marginTop: "8px",
              minWidth: "120px",
            }}
            onClick={() => {
              // Optionally sign out user here, but for now just navigate
              navigate("/", { replace: true });
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}