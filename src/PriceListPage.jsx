import React, { useContext, useEffect, useState, useMemo } from "react";
import { Table, Input, Button, Space, Flex, Select } from "antd";
import * as XLSX from "xlsx";
import { useDebounce } from "use-debounce";
import { CartContext } from "./CartContext";
import { useNavigate, useLocation } from "react-router-dom";
import { DeleteOutlined } from "@ant-design/icons";

export default function PriceListPage({withCart=false}) {
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch] = useDebounce(searchText, 300);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const { cart, addToCart, updateQty, removeFromCart } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { namaKamu, nomorHandphone } = location.state || {};

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

  const brandOptions = Array.from(new Set(data.map(item => item.Brand))).filter(Boolean);

  const filteredData = useMemo(() => {
    if (!debouncedSearch) return [];
    return data.filter((item) => {
      const target = `${item.Brand} ${item["Nama Produk"]}`.toLowerCase();
      const searchWords = debouncedSearch.toLowerCase().split(" ").filter(Boolean);
      const matchesSearch = searchWords.every((word) => target.includes(word));
      const matchesBrand = selectedBrand ? item.Brand === selectedBrand : true;
      return matchesSearch && matchesBrand;
    });
  }, [data, debouncedSearch, selectedBrand]);

  const columns = [
    {
      title:"Brand",
      dataIndex:"Brand",
      key:"Brand",
      width: "20%",
      sorter: (a, b) => a["Brand"]?.localeCompare(b["Brand"]),
    },
    {
      title:"Nama Produk",
      dataIndex:"Nama Produk",
      key:"Nama Produk",
      width: "40%",
      sorter: (a, b) => a["Nama Produk"]?.localeCompare(b["Nama Produk"]),
    },
    {
      title:"Harga Byusoul",
      dataIndex:"Harga Byusoul",
      key:"Harga Byusoul",
      width: "20%",
      sorter: (a, b) => a["Harga Byusoul"] - b["Harga Byusoul"],
      render: item => item?.toLocaleString(),
    },
    {
      title: "Harga Promo",
      dataIndex: "Harga Promo",
      key: "Harga Promo",
      width: "20%",
      sorter: (a, b) => a["Harga Promo"] - b["Harga Promo"],
      render: (item) => item ? item.toLocaleString() : "",
    },

    ...(true ? [{
      title: "",
      key: "action",
      render: (_, record) => {
        const inCart = cart.find((c) => c.key === record.key);
        return inCart ? (
          <Space>
            <Input
              type="number"
              min={1}
              value={inCart.qty}
      onChange={(e) => updateQty(record.key, Number(e.target.value))}
              style={{ width: 70 }}
            />
            {/* <Button onClick={() => removeFromCart(record.key)} danger>x</Button> */}
            <Button
              danger
              type="text"
              icon={<DeleteOutlined />}
              onClick={() => removeFromCart(record.key)}
            />
          </Space>
        ) : (
          <Button onClick={() => addToCart(record)}>Tambahkan</Button>
        );
      },
    }] : []),
  ]

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
              <h2>
                Halo, <strong>{namaKamu}</strong>!
              </h2>
              <p>
                Nomor Kontak: {nomorHandphone}
              </p>
            </div>
          </div>
        </div>
      )}
      <p style={{ fontStyle: "italic" }}>
        <strong>Selamat Datang di Byusoul Online Order!</strong><br />
        1. Cari produk dan klik "Tambahkan"<br />
        2. Klik “Lihat Keranjang”<br />
        3. Cek pesanan kamu dan klik "Konfirmasi Pesanan"
      </p>
  
      <Flex justify="space-between" align="flex-end" style={{ marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ marginBottom: 8, marginRight: 16, width: "100%", maxWidth: 250, flex: 1 }}>
          <div style={{ fontWeight: "bold", marginBottom: 4 }}>Brand</div>
          <Select
            placeholder="Filter Brand disini..."
            value={selectedBrand}
            onChange={(value) => setSelectedBrand(value)}
            allowClear
            style={{ width: "100%", fontSize: "16px" }}
            dropdownStyle={{ fontSize: "16px" }}
          >
            {brandOptions.map((brand) => (
              <Select.Option key={brand} value={brand}>
                {brand}
              </Select.Option>
            ))}
          </Select>
        </div>
        <div style={{ marginBottom: 8, width: "100%", maxWidth: 400, flex: 2 }}>
          <div style={{ fontWeight: "bold", marginBottom: 4 }}>Cari produk</div>
          <Input.Search
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: "100%", fontSize: "16px" }}
            allowClear
          />
        </div>
        <div style={{ marginBottom: 8, width: "100%", maxWidth: 250, display: "flex", justifyContent: "flex-end" }}>
          <Button 
            onClick={() => navigate("/cart", { state: { namaKamu, nomorHandphone } })} 
            style={{ backgroundColor: "#1890ff", color: "#fff", border: "none", width: 200 }}
          >
            Lihat Keranjang
          </Button>
        </div>
      </Flex>
      {!loading && searchText ? (
        <div style={{ width: "100%", margin: "0 auto" }}>
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey={(record, index) => index}
            pagination={false}
            bordered
            style={{
              width: "100%",
              tableLayout: "auto",
            }}
          />
        </div>
      ) : searchText ? (
        <p>Loading data...</p>
      ) : (
        <div style={{ backgroundColor: "rgba(0,0,0,0.05)", padding: 40, borderRadius: 8, textAlign: "center", color: "#555", minWidth: "100%" }}>
          Ketik produk yang ingin kamu cari...
        </div>
      )}
    </div>
  );
}
