import { Table, InputNumber, Button, Space, Flex, Radio, Modal } from "antd";
import { useContext, useState } from "react";
import { CartContext } from "./CartContext";
import { useNavigate, useLocation } from "react-router-dom";

export default function CartPage() {
  const [showPopup, setShowPopup] = useState(false);
  const { cart, updateQty, removeFromCart, setCart } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const storedData = JSON.parse(localStorage.getItem("userData") || "{}");
  const { namaKamu, nomorHandphone } = location.state || storedData;

  const columns = [
    
    {
        "title":"Brand",
        "dataIndex":"Brand",
        "key":"Brand",
        "width": 150, // fixed width
        sorter: (a, b) => a["Brand"]?.localeCompare(b["Brand"]),
    },
    {
        "title":"Nama Produk",
        "dataIndex":"Nama Produk",
        "key":"Nama Produk",
        "width": 500, // fixed width
        sorter: (a, b) => a["Nama Produk"]?.localeCompare(b["Nama Produk"]),
    },

    {
        "title":"Harga",
        "dataIndex":"Harga Byusoul",
        "key":"Harga Byusoul",
        "width": 150, // fixed width
        render: item => item.toLocaleString(),
        sorter: (a, b) => a["Harga Byusoul"] - b["Harga Byusoul"],
    },
    {
      title: "Harga Promo",
      dataIndex: "Harga Promo",
      key: "Harga Promo",
      width: 150,
      render: (item) => item?.toLocaleString(),
      sorter: (a, b) => a["Harga Promo"] - b["Harga Promo"],
    },
    {
      title: "Quantity",
      key: "qty",
      render: (_, record) => (
        <InputNumber
          min={1}
          value={record.qty}
          onChange={(value) => updateQty(record.key, value)}
        />
      ),
    },
    
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button danger onClick={() => removeFromCart(record.key)}>
          Remove
        </Button>
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
            padding: 20,
            maxHeight: "90vh", // batas tinggi, biar ga kepenuhan layar
            overflowY: "auto", // scroll kalau konten melebihi tinggi 
        }}
    >
        {namaKamu && (
          <div style={{ backgroundColor: "#fee4f1ff", padding: "16px", marginBottom: "16px", borderRadius: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ textAlign: "left" }}>
                <h2>Halo, <strong>{namaKamu}</strong>!</h2>
                <p>Nomor Kontak: {nomorHandphone}</p>
              </div>
            </div>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <h2>Keranjang</h2>
            <Space>
                <Button onClick={() => navigate("/catalog", { state: { namaKamu, nomorHandphone } })}>Kembali ke Price List</Button>
            </Space>
        </div>
        <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
          <Table columns={columns} dataSource={cart} rowKey="key" pagination={false} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginTop: 16, gap: 16 }}>
          <div style={{ fontWeight: "bold" }}>
            Total: Rp {total.toLocaleString()}
          </div>
          <Button
            type="primary"
            size="large"
            onClick={async () => {
              const selectedShipping = document.querySelector('input[name="radio-group"]:checked')?.nextSibling?.textContent || '';
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
              orderText += `\nTotal: Rp ${total.toLocaleString()}\nMetode Pengiriman: ${selectedShipping}`;
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
        <div style={{
            textAlign: "left",
            marginTop: 16,
            border: "1px solid #ccc",
            padding: "12px",
            borderRadius: "6px",
            backgroundColor: "#f9f9f9"
          }}>
          <div>
            <strong>Metode pengiriman:</strong>
            <Radio.Group defaultValue="Online delivery" style={{ display: "flex", flexDirection: "column", marginTop: 8, fontSize: "16px", lineHeight: "1.8" }}>
              <Radio value="Online delivery">Online delivery (Gojek/Grab/Maxim)</Radio>
              <Radio value="Pick up store">Pick up store: Byusoul Taman Siswa (<a href="https://maps.app.goo.gl/thFLGFGjtMXLjDsf7" target="_blank" rel="noopener noreferrer">Gmaps</a>)</Radio>
              <Radio value="Long distance">Kirim jarak jauh (JNE, J&amp;T, dll.)</Radio>
              <Radio value="Free same day">FREE ONGKIR same day (minimal Rp 50k) untuk pengiriman dalam Ring Road Jogja</Radio>
              <Radio value="Other">Lainnya</Radio>
            </Radio.Group>
          </div>
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
              padding: 32,
              borderRadius: 12,
              textAlign: "center",
              maxWidth: "90%",
            }}>
              <img src="/Logo Long White.png" style={{ width: 150, height: 150, objectFit: "contain", marginBottom: 16 }} />
              <p style={{ fontSize: "20px", fontWeight: "bold" }}>Order kamu sudah di catat ya, Byuties!</p>
              <p>Kamu akan diarahkan ke WA Byusoul dalam 3 detik.</p>
              <Button type="primary" style={{ marginTop: 16 }} onClick={() => setShowPopup(false)}>Saya Mengerti</Button>
            </div>
          </div>
        )}
    </div>
  )
}
