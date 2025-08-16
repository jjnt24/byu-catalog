import React, { useContext, useEffect, useState, useMemo } from "react";
import { Table, Input, Button, Space, Flex, Badge } from "antd";
import * as XLSX from "xlsx";
import { useDebounce } from "use-debounce";
import { CartContext } from "./CartContext";
import { useNavigate, useLocation } from "react-router-dom";
import { DeleteOutlined, ShoppingCartOutlined, TagsOutlined } from "@ant-design/icons";
import MobileScrollable from "./MobileScrollable";

export default function PriceListPage({withCart=false}) {
  const { cart, addToCart, updateQty, removeFromCart } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { namaKamu, nomorHandphone, searchValue, showPromoFilter } = location.state || {};
  const [searchText, setSearchText] = useState(searchValue || "");
  const [data, setData] = useState([]);
  const [debouncedSearch] = useDebounce(searchText, 300);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [showLauncherPopup, setShowLauncherPopup] = useState(false);
  const [popupOpacity, setPopupOpacity] = useState(0);
  const [promoOnly, setPromoOnly] = useState(showPromoFilter || false);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Only show popup if not shown before in this session
      if (!sessionStorage.getItem("byusoulPopupShown")) {
        setShowLauncherPopup(true);
        setPopupOpacity(1);
        sessionStorage.setItem("byusoulPopupShown", "true");
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetch("/data/priceList.xlsx")
      .then((res) => res.arrayBuffer())
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        // Skip first 2 rows
        const sliced = json.slice(1);
        // Convert to objects with headers from row 3
        const headers = sliced[0];
        const rows = sliced.slice(1).map((row, index) => ({
          key: index + 1, // add unique key
          ...Object.fromEntries(headers.map((h, i) => [h, row[i]])),
        }))
        .filter(item => item.Brand && item.Brand.trim() !== ""); // remove if Brand is empty or null

        setData(rows);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // Fix iOS touch scroll inside Select dropdown
    const handleTouchMove = (e) => {
      e.stopPropagation();
    };
    const dropdown = document.querySelector('.ant-select-dropdown');
    if (dropdown) {
      dropdown.addEventListener('touchmove', handleTouchMove, { passive: false });
      return () => {
        dropdown.removeEventListener('touchmove', handleTouchMove);
      };
    }
  }, [selectedBrand]);

  // Handle promo filter highlight when coming from "Cek Promo" button
  useEffect(() => {
    if (showPromoFilter) {
      // Add visual feedback that the promo filter is on
      const promoButton = document.querySelector('[data-promo-button="true"]');
      if (promoButton) {
        promoButton.style.transform = 'scale(1.1)';
        setTimeout(() => {
          promoButton.style.transform = 'scale(1)';
        }, 300);
      }
    }
  }, [showPromoFilter]);

  const brandOptions = Array.from(new Set(data.map(item => item.Brand))).filter(Boolean);

  const filteredData = useMemo(() => {
    if (!debouncedSearch && !selectedBrand && !promoOnly) return [];
    return data.filter((item) => {
      const matchesBrand = selectedBrand ? item.Brand === selectedBrand : true;
      const matchesPromo = promoOnly ? Boolean(item["Harga Promo"]) : true;
      if (!debouncedSearch) return matchesBrand && matchesPromo;
      const target = `${item.Brand} ${item["Nama Produk"]}`.toLowerCase();
      const searchWords = debouncedSearch.toLowerCase().split(" ").filter(Boolean);
      const matchesSearch = searchWords.every((word) => target.includes(word));
      return matchesSearch && matchesBrand && matchesPromo;
    });
  }, [data, debouncedSearch, selectedBrand, promoOnly]);

  const columns = [
    {
      title:"Nama Produk",
      dataIndex:"Nama Produk",
      key:"Nama Produk",
      width: "30%",
      sorter: (a, b) => a["Nama Produk"]?.localeCompare(b["Nama Produk"]),
      onHeaderCell: () => ({ style: { minWidth: 150 } }),
      onCell: () => ({ style: { minWidth: 150 } }),
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: "bold" }}>{record.Brand}</div>
          <div>{record["Nama Produk"]}</div>
        </div>
      ),
    },
    {
      title:"Harga Byu",
      dataIndex:"Harga Byusoul",
      key:"Harga Byusoul",
      width: "6%",
      sorter: (a, b) => a["Harga Byusoul"] - b["Harga Byusoul"],
      render: (_, record) => {
        const hasPromo = Boolean(record["Harga Promo"]);
        return (
          <div>
            <div style={{ textDecoration: hasPromo ? "line-through" : "none", textDecorationColor: "rgba(0,0,0,0.3)", textDecorationThickness: "1px" }}>
              {record["Harga Byusoul"]?.toLocaleString()}
            </div>
            {record["Harga Promo"] && (
              <div style={{ color: "red", backgroundColor: "yellow", display: "inline-block", padding: "2px 4px", marginTop: 2 }}>
                {String(record["Harga Promo"]).replace(/Rp\s?/g, "").replace(/\./g, "")}
              </div>
            )}
            <div style={{ marginTop: 8 }}>
              <Button
                size="small"
                onClick={() => {
                  addToCart(record);
                  // Create flying "+" animation
                  const flying = document.createElement("div");
                  flying.innerText = "+";
                  flying.style.position = "absolute";
                  flying.style.left = `${window.innerWidth / 2}px`;
                  flying.style.top = `${window.innerHeight / 2}px`;
                  flying.style.fontSize = "16px";
                  flying.style.fontWeight = "bold";
                  flying.style.color = "#1890ff";
                  flying.style.transition = "all 0.8s ease-in-out";
                  flying.style.pointerEvents = "none";
                  document.body.appendChild(flying);

                  const cartBtn = document.querySelector("#cart-button");
                  if (cartBtn) {
                    const rect = cartBtn.getBoundingClientRect();
                    requestAnimationFrame(() => {
                      flying.style.left = `${rect.left + rect.width / 2}px`;
                      flying.style.top = `${rect.top + rect.height / 2}px`;
                      flying.style.opacity = 0;
                      flying.style.transform = "scale(0.2)";
                    });
                    setTimeout(() => {
                      document.body.removeChild(flying);
                    }, 800);
                  } else {
                    // fallback remove if cart button not found
                    setTimeout(() => document.body.removeChild(flying), 800);
                  }
                }}
              >
                +
              </Button>
            </div>
          </div>
        );
      },
    },
  ]

  return (
    <div style={{ width: "100%", minHeight: "100vh", backgroundColor: "#fff", color: "#000", colorScheme: "light" }}>
      {showLauncherPopup && (
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
            zIndex: 3000,
            opacity: popupOpacity,
            transition: "opacity 1.5s ease-in-out",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "400px",
              width: "90%",
              textAlign: "center",
            }}
          >
            <h2 style={{ marginBottom: "16px" }}>Selamat Datang di Byusoul Online!</h2>
            <ol style={{ textAlign: "left", marginBottom: "24px", paddingLeft: "20px" }}>
              <li>Cari barang berdasarkan nama produk lewat kolom yang tersedia</li>
              <li>Klik tombol <strong>"+"</strong> di sebelah harga untuk tambah ke keranjang</li>
              <li>Klik logo keranjang untuk cek belanjaan kamu</li>
            </ol>
            <button
              onClick={() => setShowLauncherPopup(false)}
              style={{
                backgroundColor: "#f82896",
                color: "#fff",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Oke Byuties!
            </button>
          </div>
        </div>
      )}
      <MobileScrollable style={{ padding: 16 }}>
        {namaKamu && (
          <div style={{ backgroundColor: "#fee4f1ff", padding: "12px 12px 1px 15px", marginBottom: "16px", borderRadius: "8px", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ textAlign: "left" }}>
                <h2 style={{ marginBottom: "0px" }}>
                  Halo, <strong>{namaKamu}</strong>!
                </h2>
                <p>
                  Nomor Kontak: {nomorHandphone}
                  {/* 
                  <a
                    onClick={() => navigate("/", { state: { showLoginPopup: true } })}
                    style={{ color: "#1890ff", textDecoration: "underline", cursor: "pointer", fontSize: "12px" }}
                  >
                    Ubah Data
                  </a>
                  */}
                  <br />
                </p>
              </div>
            </div>
            <Button
              onClick={() => window.open("https://wa.me/6285190077091?text=Hai%20Minsoul%2C%20bisa%20bantu%20aku%20pilih%20produk%3F%20Aku%20sedang%20belanja%20di%20katalog%20online%20Byusoul%20nih.%20Terimakasih%20kak", "_blank")}
              style={{
                borderColor: "#52c41a",
                color: "#52c41a",
                backgroundColor: "#fff",
                borderWidth: "1px",
                fontWeight: "bold",
                maxWidth: 200,
                position: "absolute",
                top: "50%",
                right: "12px",
                transform: "translateY(-50%)",
              }}
            >
              Konsultasi lewat WA
            </Button>
          </div>
        )}
        <p style={{ fontStyle: "normal" }}>
          <strong>Produk Byusoul</strong><br />
          <span style={{ color: "red", fontWeight: "normal" }}>
            Gratis ongkir untuk pengantaran 8 km dari Byusoul Taman Siswa
          </span>
        </p>
        
        <MobileScrollable style={{ position: "sticky", top: 0, backgroundColor: "white", zIndex: 100, marginBottom: 16 }}>
          <Flex justify="space-between" align="flex-end" style={{ flexWrap: "nowrap" }}>
          <div style={{ marginBottom: 8, marginRight: 16, flex: 1, minWidth: 100 }}>
            <div style={{ fontWeight: "bold", marginBottom: 4 }}>Brand</div>
            <select
              value={selectedBrand || ""}
              onChange={(e) => {
                setSelectedBrand(e.target.value || null);
                setSearchText("");
              }}
              style={{ 
                width: "100%", 
                fontSize: "16px", 
                padding: "4px", 
                borderRadius: "4px", 
                backgroundColor: "#fff", 
                color: "#000", 
                WebkitAppearance: "menulist-button", 
                appearance: "menulist-button" 
              }}
            >
              <option value="">Semua</option>
              {brandOptions.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 8, flex: 2, minWidth: 70, marginRight: 16, display: "flex", flexDirection: "column" }}>
            <label style={{ fontWeight: "bold", marginBottom: 4 }}>Cari produk</label>
            <input
              type="search"
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{
                width: "100%",
                maxWidth: "1500px",
                fontSize: "16px",
                padding: "4px 8px",
                borderRadius: "4px",
                border: "1px solid #d9d9d9",
              }}
            />
          </div>
          <div style={{ marginBottom: 8, display: "flex", justifyContent: "flex-end", minWidth: 100 }}>
            <Button
              size="small"
              onClick={() => setPromoOnly(!promoOnly)}
              data-promo-button="true"
              style={{
                border: promoOnly ? "none" : "1px solid #52c41a",
                color: "#52c41a",
                backgroundColor: promoOnly ? "#52c41a" : "transparent",
                width: 40,
                height: 40,
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 16,
                transition: "transform 0.3s ease-in-out"
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  lineHeight: 1,
                }}
              >
                <TagsOutlined style={{ fontSize: 20, color: promoOnly ? "#fff" : "#52c41a" }} />
                <span
                  style={{
                    fontSize: "8px",
                    marginTop: "2px",
                    color: promoOnly ? "#fff" : "#52c41a"
                  }}
                >
                  PROMO
                </span>
              </div>
            </Button>
            <Badge count={cart.reduce((acc, item) => acc + item.qty, 0)} size="small" style={{ marginRight: 8 }}>
              <Button 
                id="cart-button"
                size="small"
                onClick={() => navigate("/cart", { state: { namaKamu, nomorHandphone } })} 
                style={{ border: "1px solid #1890ff", color: "#1890ff", width: 40, height: 40, backgroundColor: "transparent", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", marginLeft: -10 }}
              >
                <ShoppingCartOutlined style={{ fontSize: 20 }} />
              </Button>
            </Badge>
          </div>
          </Flex>
        </MobileScrollable>
        {!loading && (searchText || selectedBrand || promoOnly) ? (
          <MobileScrollable style={{ width: "100%", margin: "0 auto" }}>
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey={(record, index) => index}
              pagination={{ pageSize: 5 }}
              bordered
              style={{
                width: "100%",
                tableLayout: "auto",
              }}
              scroll={{ x: "100%" }}
              components={{
                header: {
                  cell: ({ children, ...props }) => (
                    <th {...props} style={{ padding: "4px 8px" }}>
                      {children}
                    </th>
                  ),
                },
                body: {
                  cell: ({ children, ...props }) => (
                    <td {...props} style={{ padding: "4px 8px" }}>
                      {children}
                    </td>
                  ),
                },
              }}
            />
          </MobileScrollable>
        ) : searchText ? (
          <p>Loading data...</p>
        ) : (
          <div style={{ backgroundColor: "rgba(0,0,0,0.05)", padding: 40, borderRadius: 8, textAlign: "center", color: "#555", minWidth: "100%", marginTop: 16 }}>
            Ketik produk yang ingin kamu cari...
          </div>
        )}
      </MobileScrollable>
      <div style={{ marginTop: 32, marginRight: 16, display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <Button type="default" onClick={() => navigate("/")} style={{ backgroundColor: "#fff" }}>
          Kembali ke Halaman Utama
        </Button>
      </div>
    </div>
  );
}