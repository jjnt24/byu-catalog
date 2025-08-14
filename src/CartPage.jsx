import { Table, InputNumber, Button, Space, Flex, Radio, Modal } from "antd";
import { useContext, useState, useEffect, useRef } from "react";
import { CartContext } from "./CartContext";
import { useNavigate, useLocation } from "react-router-dom";
import { DeleteOutlined } from "@ant-design/icons";

export default function CartPage() {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [distanceText, setDistanceText] = useState("");
  const { cart, updateQty, removeFromCart, setCart } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const storedData = JSON.parse(localStorage.getItem("userData") || "{}");
  const { namaKamu, nomorHandphone } = location.state || storedData;

  const deliveryInputRef = useRef(null);

  useEffect(() => {
    const loadScript = (url) => {
      return new Promise((resolve, reject) => {
        const existingScript = document.querySelector(`script[src="${url}"]`);
        if (existingScript) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = url;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject();
        document.body.appendChild(script);
      });
    };

    const initAutocomplete = () => {
      if (!window.google || !deliveryInputRef.current) return;

      // Create a new session token for this autocomplete instance
      const sessionToken = new window.google.maps.places.AutocompleteSessionToken();

      const autocomplete = new window.google.maps.places.Autocomplete(deliveryInputRef.current, {
        types: ["geocode", "establishment"],
        componentRestrictions: { country: "ID" },
        sessionToken: sessionToken
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address) {
          setDeliveryAddress(place.formatted_address);
          setSearchValue(place.formatted_address);
        }
      });
    };

    const apiKey = "AIzaSyDUkcBMt2-6ZkxhfI5BKBQjVbXVaybGzu4";
    const mapsUrl = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;

    loadScript(mapsUrl)
      .then(() => initAutocomplete())
      .catch(() => console.error("Failed to load Google Maps script"));
  }, []);

  const calculateDistance = () => {
    if (!window.google || !deliveryAddress) return;
    const service = new window.google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [deliveryAddress],
        destinations: ["Byusoul Taman Siswa, Yogyakarta, Indonesia"],
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === "OK") {
          const element = response.rows[0].elements[0];
          if (element.status === "OK") {
            setDistanceText(element.distance.text);
          }
        }
      }
    );
  };

  useEffect(() => {
    calculateDistance();
  }, [deliveryAddress]);

  const totalQty = cart.reduce((sum, item) => sum + Number(item.qty || 0), 0);

  const columns = [
    {
      title: "Nama Produk",
      dataIndex: "Nama Produk",
      key: "Nama Produk",
      width: 500, // adjust as needed
      sorter: (a, b) => a["Nama Produk"]?.localeCompare(b["Nama Produk"]),
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: "bold" }}>{record.Brand}</div>
          <div>{record["Nama Produk"]}</div>
        </div>
      ),
    },

    {
      title:"Harga",
      dataIndex:"Harga Byusoul",
      key:"Harga Byusoul",
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ textDecoration: record["Harga Promo"] ? "line-through" : "none" }}>
            {record["Harga Byusoul"]?.toLocaleString()}
          </div>
          {record["Harga Promo"] && (
            <div style={{ backgroundColor: "yellow", display: "inline-block", padding: "2px 4px", marginTop: 2 }}>
              {record["Harga Promo"]?.toLocaleString()}
            </div>
          )}
        </div>
      ),
      sorter: (a, b) => a["Harga Byusoul"] - b["Harga Byusoul"],
    },
    {
      title: "Qty",
      key: "qty",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <InputNumber
            min={1}
            value={record.qty}
            onChange={(value) => updateQty(record.key, value)}
            style={{ width: 70, backgroundColor: "#fff", color: "#000" }}
          />
          <Button 
            size="small" 
            danger 
            onClick={() => removeFromCart(record.key)} 
            style={{ padding: 0, width: 24, height: 24, display: "flex", justifyContent: "center", alignItems: "center" }}
            aria-label="Remove item"
          >
            <DeleteOutlined style={{ fontSize: 14 }} />
          </Button>
        </div>
      ),
    },
    
  ];

  const total = cart.reduce((sum, item) => {
    const parsePrice = (val) => {
      if (!val) return 0;
      return Number(String(val).replace(/[^\d]/g, "")) || 0;
    };
    const price = parsePrice(item["Harga Promo"]) || parsePrice(item["Harga Byusoul"]);
    const qty = Number(item.qty) || 0;
    return sum + price * qty;
  }, 0);

  return (
    <div 
        style={{ 
            padding: 15,
            maxHeight: "100vh", // batas tinggi, biar ga kepenuhan layar
            overflowY: "auto", // scroll kalau konten melebihi tinggi 
        }}
    >
        {namaKamu && (
          <div style={{ backgroundColor: "#fee4f1ff", padding: "12px 12px 1px 15px", marginBottom: "8px", borderRadius: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ textAlign: "left" }}>
                <h2 style={{ marginBottom: "0px" }}>Halo, <strong>{namaKamu}</strong>!</h2>
                <p style={{ marginTop: 0 }}>Nomor Kontak: {nomorHandphone}</p>
              </div>
            </div>
          </div>
        )}
        <div style={{ marginBottom: "8px" }}>
          <h2>Keranjang ({totalQty})</h2>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <Button danger onClick={() => setCart([])}>Hapus Keranjang</Button>
          <Button onClick={() => navigate("/catalog", { state: { namaKamu, nomorHandphone } })}>Kembali ke Price List</Button>
        </div>
        <div style={{ maxHeight: "100vh", overflowY: "auto" }}>
          <Table
            columns={columns}
            dataSource={cart}
            rowKey="key"
            pagination={false}
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
          <div style={{
              textAlign: "left",
              marginTop: 16,
              border: "1px solid #ccc",
              padding: "15px",
              borderRadius: "6px",
              backgroundColor: "#f9f9f9"
            }}>
            <div style={{ marginBottom: 16 }}>
              <strong>Metode pengiriman:</strong>
              <select
                value={selectedShipping}
                onChange={(e) => setSelectedShipping(e.target.value)}
                style={{ width: "100%", marginTop: 8, padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "16px", backgroundColor: "#fff", color: "#000" }}
              >
                <option value="">Pilih metode pengiriman</option>
                <option value="Same-day/instant">Same-day/instant</option>
                  <option value="Reguler (2-3 hari)">Reguler (2-3 hari)</option>
                <option value="Ambil di store">Ambil di store</option>
              
              </select>
            </div>
            {selectedShipping !== "Ambil di store" && (
              <div>
                <label htmlFor="deliveryAddress" style={{ fontWeight: "bold", display: "block", marginBottom: 8 }}>
                  Alamat Pengiriman: {distanceText ? `(${distanceText})` : ""}
                </label>
                <input
                  id="deliveryAddress"
                  type="text"
                  placeholder="Masukkan alamat pengiriman"
                  ref={deliveryInputRef}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    fontSize: "16px",
                    backgroundColor: "#fff",
                    color: "#000",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            )}
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", alignItems: "center", gap: 20, marginTop: 8 }}>
          <div style={{ fontWeight: "bold", width: "100%", maxWidth: "200px", marginBottom: 8, textAlign: "right" }}>
            Total: Rp {total.toLocaleString()}
            {selectedShipping === "Same-day/instant" && (() => {
              let distanceNumber = null;
              if (distanceText) {
                // Extract number, handle both commas and dots
                const match = distanceText.match(/[\d.,]+/);
                if (match) {
                  distanceNumber = parseFloat(match[0].replace(",", "."));
                }
              }
              return distanceNumber !== null && distanceNumber < 8 ? (
                <div style={{ color: "red", fontWeight: "bold", marginTop: 4 }}>
                  Gratis Ongkir
                </div>
              ) : null;
            })()}
          </div>
          <Button
            type="primary"
            size="large"
            style={{ width: "100%", maxWidth: "200px", marginBottom: 8, backgroundColor: "#1890ff", borderColor: "#1890ff", display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={async () => {
              let orderText = `*Hai Minsoul, aku mau pesan barang ini ya. Boleh tolong di cek?*\n\n`;
              orderText += `Nama: ${namaKamu}\nNomor HP: ${nomorHandphone}\nPesanan:\n`;
              cart.forEach((item, idx) => {
                const normalPrice = item["Harga Byusoul"];
                const promoPrice = item["Harga Promo"];
                let line = `${idx + 1}. ${item["Nama Produk"]}`;
                if (promoPrice) {
                  line += ` - HARGA PROMO: ${promoPrice}`;
                } else {
                  line += ` - Harga: ${normalPrice}`;
                }
                line += ` - Qty: ${item.qty}\n`;
                orderText += line;
              });
              orderText += `\nAlamat Pengiriman: ${deliveryAddress}`;
              if (distanceText) {
                orderText += `\nJarak ke Byusoul Taman Siswa: ${distanceText}`;
              }
              orderText += `\nMetode Pengiriman: ${selectedShipping}`;
              navigator.clipboard.writeText(orderText);
              setShowPopup(true);
              setTimeout(() => {
                window.open(`https://wa.me/6285190077091?text=${encodeURIComponent(orderText)}`, "_blank");
              }, 4000);
            }}
          >
            Konfirmasi Pesanan
          </Button>
        </div>
        {showPopup && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: "white",
              color: "#000",
              padding: 30,
              borderRadius: 12,
              textAlign: "center",
              maxWidth: "90%",
            }}>
              <img src="/Logo Long White.png" style={{ width: 150, height: 70, objectFit: "contain", marginBottom: 10 }} />
              <p style={{ fontSize: "20px", fontWeight: "bold" }}>Order kamu sudah di catat ya, Byuties!</p>
              <p>Kamu akan segera diarahkan ke WA Byusoul.</p>
              <Button type="primary" style={{ marginTop: 10 }} onClick={() => setShowPopup(false)}>Saya Mengerti</Button>
            </div>
          </div>
        )}
    </div>
  )
}
