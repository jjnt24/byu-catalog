import { Table, InputNumber, Button, Space, Flex } from "antd";
import { useContext } from "react";
import { CartContext } from "./CartContext";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const { cart, updateQty, removeFromCart, setCart } = useContext(CartContext);
  const navigate = useNavigate();

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

  return (
    <div 
        style={{ 
            padding: 20,
            maxHeight: "90vh", // batas tinggi, biar ga kepenuhan layar
            overflowY: "auto", // scroll kalau konten melebihi tinggi 
        }}
    >
        <Flex justify="space-between" align="center">
            <h2>Keranjang</h2>
            <p style={{ fontStyle: "italic" }}>
              Screenshot list ini ke WhatsApp <strong>0851-9007-7091</strong> untuk checkout ya, Byuties
            </p>
            <Space>
                <Button onClick={() => setCart([])} danger>Hapus Keranjang</Button>
                <Button onClick={() => navigate("/")}>Kembali ke Price List</Button>
            </Space>
        </Flex>
        <Table columns={columns} dataSource={cart} rowKey="key" />
        <div style={{
            textAlign: "left",
            marginTop: 16,
            border: "1px solid #ccc",
            padding: "12px",
            borderRadius: "6px",
            backgroundColor: "#f9f9f9"
          }}>
          <p>
            <strong>Metode pengiriman:</strong><br />
            - Online delivery (Gojek/Grab/Maxim)<br />
            - Pick up store: Byusoul Taman Siswa (
            <a href="https://maps.app.goo.gl/thFLGFGjtMXLjDsf7" target="_blank" rel="noopener noreferrer">Gmaps</a>
            )<br />
            - Kirim jarak jauh (JNE, J&amp;T, dll.)<br />
            - FREE ONGKIR same day (minimal Rp 50k) untuk pengiriman dalam Ring Road Jogja
          </p>
        </div>
    </div>
  )
}
