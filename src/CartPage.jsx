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
      title: "Total",
      key: "total",
      render: (_, record) => Number(record.qty * record["Harga Byusoul"]).toLocaleString(),
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
            <h2>Cart</h2>
            <Space>
                <Button onClick={() => setCart([])} danger>Clear Cart</Button>
                <Button onClick={() => navigate("/")}>Back to Price List</Button>
            </Space>
        </Flex>
        <Table columns={columns} dataSource={cart} rowKey="key" />
    </div>
  )
}
