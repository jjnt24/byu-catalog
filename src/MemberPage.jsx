import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EditOutlined, InstagramFilled, PlayCircleFilled, DownOutlined } from "@ant-design/icons";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { db } from "./firebase";
import { collection, doc, getDoc, getDocs, setDoc, query, orderBy } from "firebase/firestore";

const containerStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  height: "100dvh",
  width: "100vw",
  overflowY: "auto",
  background: "linear-gradient(to bottom, #fff0f6, #fff)",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  flexDirection: "column",
  padding: "24px 8px",
  boxSizing: "border-box",
};

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
  const [memberSince, setMemberSince] = useState(null);
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]); 
  const [expandedTransactions, setExpandedTransactions] = useState([]); // array of expanded tx indices

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
          if (data.accountCreationDate) {
            setMemberSince(data.accountCreationDate.toDate());
          }
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
      loadTransactions(user.uid); // <- fetch transactions from Firestore
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

  useEffect(() => {
    // Scroll to top after all content/data loads
    const timeout = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 200);
    return () => clearTimeout(timeout);
  }, []);


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

  async function loadTransactions(uid) {
    if (!uid) return;

    try {
      // Reference to MemberData/{uid}/transactions
      const txRef = collection(db, "MemberData", uid, "transactions");

      // Create a query to order by transactionDate descending
      const q = query(txRef, orderBy("transactionDate", "desc"));

      // Fetch documents
      const snapshot = await getDocs(q);

      // Transform documents into transactions
      const txList = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        const totalQty = Array.isArray(data.items)
          ? data.items.reduce((sum, item) => sum + (item.qty || 0), 0)
          : 0;
        return {
          date: data.transactionDate?.toDate ? data.transactionDate.toDate() : null,
          value: data.totalAmount,
          quantity: totalQty,
          items: Array.isArray(data.items)
            ? data.items.map(it => ({
                itemName: it.name,
                qty: it.qty,
                itemPrice: it.itemPrice,
                subtotalPrice: it.subtotalPrice,
              }))
            : [],
        };
      });

      setTransactions(txList);

      // If no memberSince date is set yet, use the earliest transaction date as fallback
      if (!memberSince && txList.length > 0) {
        const sortedDates = txList
          .map(tx => tx.date)
          .filter(date => date !== null)
          .sort((a, b) => a - b);
        
        if (sortedDates.length > 0) {
          setMemberSince(sortedDates[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load transactions:", err);
    }
  }
  return (
    <div style={containerStyle}>
      <div style={{
        background: "white",
        borderRadius: "16px",
        padding: "24px",
        width: "100%",
        maxWidth: "400px",
        boxShadow: "0 4px 12px rgba(245,34,45,0.05)",
        marginBottom: "20px"
      }}>
        <h2 style={{ 
          textAlign: "center", 
          marginTop: 0, 
          marginBottom: 4,
          fontSize: "1.6em",
          background: "linear-gradient(45deg, #eb2f96, #f759ab)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          Hi, {name}
        </h2>
        
        <div style={{ 
          textAlign: "center", 
          margin: "20px 0",
          padding: "16px",
          background: "linear-gradient(135deg, #fff0f6, #ffadd2)",
          borderRadius: "12px",
          border: "1px solid rgba(245,34,45,0.1)",
          boxShadow: "0 2px 8px rgba(245,34,45,0.06)",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ 
            fontSize: "1.1em", 
            fontWeight: "600", 
            color: "#eb2f96",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>
            Byu Points
          </div>
          <div style={{ 
            fontSize: "2em", 
            fontWeight: "bold",
            color: "#c41d7f",
            marginTop: "8px",
            position: "relative",
            zIndex: 1
          }}>
            {transactions.reduce((total, { value }) => {
              const points = value >= 50000 ? Math.floor(value / 50000) * 20 : 0;
              return total + points;
            }, 0)}
          </div>
          <div style={{
            position: "absolute",
            top: 0,
            left: "-100%",
            width: "50%",
            height: "100%",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
            animation: "shine 2s infinite",
            transform: "skewX(-20deg)",
          }} />
          <style>
            {`
              @keyframes shine {
                0% { left: -100%; }
                100% { left: 200%; }
              }
            `}
          </style>
        </div>

        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          color: "#666",
          fontSize: "0.95em"
        }}>
          <p style={{ 
            textAlign: "center", 
            margin: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px"
          }}>
            <span style={{ opacity: 0.7 }}>📅</span>
            Member Sejak: {memberSince ? memberSince.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
          </p>
          <p style={{ 
            textAlign: "center", 
            margin: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px"
          }}>
            <span style={{ opacity: 0.7 }}>📱</span>
            {phoneNumber ? phoneNumber.replace(/^\+62/, '0') : "-"}
          </p>
        </div>
      </div>
      <button
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          color: "#eb2f96",
          cursor: "pointer",
          fontSize: "0.9em",
          marginTop: 4,
          marginBottom: 8,
          userSelect: "none",
          background: "white",
          border: "1px solid #eb2f96",
          borderRadius: "20px",
          padding: "6px 16px",
          transition: "all 0.3s ease",
          boxShadow: "0 2px 6px rgba(235,47,150,0.1)",
          ":hover": {
            background: "#eb2f96",
            color: "white"
          }
        }}
        onClick={() => setShowOverlay(true)}
      >
        <EditOutlined />
        Edit Profil
      </button>
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
        <div style={{ 
          marginTop: 24,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>
          {phoneNumber && (
            <img
              src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${phoneNumber.replace(/^\+62/, '0')}&scale=4&height=20&includetext=false&filetype=svg&backgroundcolor=ffffff`}
              alt="Barcode"
              style={{ 
                width: "300px", 
                height: "80px", 
                objectFit: "contain",
                filter: "contrast(1.1)",
                imageRendering: "optimizeQuality",
                margin: "0 auto" // Add horizontal auto margins
              }}
            />
          )}
        </div>
        <h3 style={{ 
          marginTop: 24, 
          marginBottom: 16,
          fontSize: "1.3em",
          color: "#eb2f96",
          textAlign: "left",
          width: "100%",
          maxWidth: "400px"
        }}>Transaksi Sebelumnya</h3>
        {transactions.map(({ date, value, quantity, items }, index) => {
          const isExpanded = expandedTransactions.includes(index);
          return (
            <div key={index} style={{ 
              width: "100%", 
              maxWidth: "400px",
              background: "white",
              borderRadius: "12px",
              marginBottom: "12px",
              boxShadow: "0 2px 8px rgba(235,47,150,0.08)",
              overflow: "hidden"
            }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "16px",
                  borderBottom: isExpanded ? "1px solid #ffd6e7" : "none",
                  alignItems: "center",
                  cursor: "pointer",
                  transition: "background-color 0.2s ease",
                  ":hover": {
                    backgroundColor: "#fff0f6"
                  }
                }}
                onClick={() => {
                  setExpandedTransactions((prev) =>
                    prev.includes(index)
                      ? prev.filter((i) => i !== index)
                      : [...prev, index]
                  );
                }}
              >
                <div>
                  <div style={{ 
                    fontWeight: "600",
                    color: "#eb2f96",
                    marginBottom: "4px"
                  }}>
                    {date ? date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "-"}
                  </div>
                  <div style={{ 
                    fontSize: "1.1em",
                    fontWeight: "500",
                    color: "#262626",
                    marginBottom: "4px"
                  }}>
                    Rp {(Math.ceil(value / 100) * 100).toLocaleString("id-ID", { maximumFractionDigits: 0 })}
                  </div>
                  <div style={{ 
                    fontSize: "0.9em",
                    color: "#8c8c8c"
                  }}>Qty: {quantity}</div>
                </div>
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 12 
                }}>
                  {value >= 50000 && (
                    <div style={{ 
                      background: "#fff0f6", 
                      border: "1px solid #ffadd2",
                      borderRadius: "16px",
                      padding: "4px 12px",
                      color: "#c41d7f",
                      fontWeight: "500",
                      fontSize: "0.9em"
                    }}>
                      +{Math.floor(value / 50000) * 20} Points
                    </div>
                  )}
                  <DownOutlined 
                    style={{ 
                      fontSize: "14px",
                      color: "#8c8c8c",
                      transition: "all 0.2s ease",
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    }} 
                  />
                </div>
              </div>
              {isExpanded && (
                <div style={{
                  background: "#fafafa",
                  padding: "16px",
                  fontSize: "0.96em"
                }}>
                  <div style={{ 
                    fontWeight: "600", 
                    marginBottom: "12px",
                    color: "#262626"
                  }}>Item yang Dibeli:</div>
                  {items.length === 0 && (
                    <div style={{ 
                      color: "#8c8c8c",
                      fontStyle: "italic",
                      textAlign: "center",
                      padding: "12px"
                    }}>Tidak ada item.</div>
                  )}
                  <div style={{ 
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px"
                  }}>
                    {items.map((item, idx) => {
                      const qty = item.qty || 0;
                      const perPcs = item.itemPrice;
                      const total = item.subtotalPrice || 0;
                      return (
                        <div key={idx} style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 12px",
                          background: "white",
                          borderRadius: "8px",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                        }}>
                          <div>
                            <div style={{ 
                              fontWeight: 500,
                              color: "#262626",
                              marginBottom: "4px"
                            }}>{item.itemName || "-"}</div>
                            <div style={{ 
                              fontSize: "0.9em",
                              color: "#8c8c8c"
                            }}>
                              {qty} x Rp {perPcs?.toLocaleString?.("id-ID", { maximumFractionDigits: 0 })}
                            </div>
                          </div>
                          <div style={{ 
                            textAlign: "right",
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                            color: "#1890ff"
                          }}>
                            Rp {total.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Show grand total for the transaction */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "16px",
                    padding: "12px",
                    background: "#f0f5ff",
                    borderRadius: "8px",
                    fontWeight: "bold"
                  }}>
                    <div style={{ color: "#262626" }}>Total Transaksi</div>
                    <div style={{ 
                      color: "#1890ff",
                      fontSize: "1.1em",
                      whiteSpace: "nowrap" 
                    }}>
                      Rp {(Math.ceil(value / 100) * 100).toLocaleString("id-ID", { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {/* Navigation Buttons */}
        <div style={{ 
          width: "100%", 
          display: "flex", 
          justifyContent: "center", 
          gap: "12px",
          marginTop: 32,
          padding: "0 16px"
        }}>
          <button
            style={{
              flex: 1,
              padding: "12px",
              fontSize: "1em",
              background: "white",
              color: "#eb2f96",
              border: "1px solid #eb2f96",
              borderRadius: "8px",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(235,47,150,0.1)",
              maxWidth: "200px",
              transition: "all 0.2s ease",
              ":hover": {
                background: "#fff0f6"
              }
            }}
            onClick={() => {
              navigate("/", { replace: true });
            }}
          >
            Kembali ke Home
          </button>
          <button
            style={{
              flex: 1,
              padding: "12px",
              fontSize: "1em",
              background: "#eb2f96",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(235,47,150,0.2)",
              maxWidth: "200px",
              transition: "all 0.2s ease",
              ":hover": {
                background: "#c41d7f"
              }
            }}
            onClick={() => {
              navigate("/catalog");
            }}
          >
            Belanja Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}