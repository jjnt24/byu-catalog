import React, { useContext, useEffect, useState, useMemo } from "react";
import { Table, Input, Button, Space, Flex, Badge } from "antd";
import * as XLSX from "xlsx";
import { useDebounce } from "use-debounce";
import { CartContext } from "./CartContext";
import { useNavigate, useLocation } from "react-router-dom";
import { DeleteOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import MobileScrollable from "./MobileScrollable";

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

  const brandOptions = Array.from(new Set(data.map(item => item.Brand))).filter(Boolean);

  const filteredData = useMemo(() => {
    if (!debouncedSearch && !selectedBrand) return [];
    return data.filter((item) => {
      const matchesBrand = selectedBrand ? item.Brand === selectedBrand : true;
      if (!debouncedSearch) return matchesBrand;
      const target = `${item.Brand} ${item["Nama Produk"]}`.toLowerCase();
      const searchWords = debouncedSearch.toLowerCase().split(" ").filter(Boolean);
      const matchesSearch = searchWords.every((word) => target.includes(word));
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
      sorter: (a, b) => a["Nama Produk"]?.localeCompare(b["Nama Produk"]),
      onHeaderCell: () => ({ style: { minWidth: 150 } }),
      onCell: () => ({ style: { minWidth: 150 } }),
    },
    {
      title:"Harga Byu",
      dataIndex:"Harga Byusoul",
      key:"Harga Byusoul",
      width: "20%",
      sorter: (a, b) => a["Harga Byusoul"] - b["Harga Byusoul"],
      render: (_, record) => {
        const inCart = cart.find((c) => c.key === record.key);
        return (
          <div>
            <div style={{ textDecoration: record["Harga Promo"] ? "line-through" : "none" }}>
              {record["Harga Byusoul"]?.toLocaleString()}
            </div>
            {record["Harga Promo"] && (
              <div style={{ backgroundColor: "yellow", display: "inline-block", padding: "2px 4px", marginTop: 2 }}>
                {record["Harga Promo"]?.toLocaleString()}
              </div>
            )}
            <div style={{ marginTop: 8 }}>
              {inCart ? (
                <Space>
                  <Input
                    type="number"
                    min={1}
                    max={9}
                    value={inCart.qty}
                    onChange={(e) => updateQty(record.key, Number(e.target.value))}
                    style={{ width: 70 }}
                  />
                  <Button
                    danger
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => removeFromCart(record.key)}
                  />
                </Space>
              ) : (
                <Button size="small" onClick={() => {
                  addToCart(record);
                  // create flying animation element
                  const flying = document.createElement('div');
                  flying.innerText = '+';
                  flying.style.position = 'absolute';
                  flying.style.left = `${window.innerWidth / 2}px`;
                  flying.style.top = `${window.innerHeight / 2}px`;
                  flying.style.fontSize = '16px';
                  flying.style.transition = 'all 0.8s ease-in-out';
                  document.body.appendChild(flying);
                  const cartBtn = document.querySelector('#cart-button');
                  const rect = cartBtn.getBoundingClientRect();
                  requestAnimationFrame(() => {
                    flying.style.left = `${rect.left + rect.width/2}px`;
                    flying.style.top = `${rect.top + rect.height/2}px`;
                    flying.style.opacity = 0;
                    flying.style.transform = 'scale(0.2)';
                  });
                  setTimeout(() => {
                    document.body.removeChild(flying);
                  }, 800);
                }}>+</Button>
              )}
            </div>
          </div>
        );
      },
    },
  ]

  return (
    <div style={{ width: "100%", minHeight: "100vh", backgroundColor: "#fff", color: "#000", colorScheme: "light" }}>
      <MobileScrollable style={{ padding: 16 }}>
        {namaKamu && (
          <div style={{ backgroundColor: "#fee4f1ff", padding: "12px 12px 1px 15px", marginBottom: "16px", borderRadius: "8px" }}>
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
          Silakan pilih produk yang ingin kamu beli, lalu klik tombol <strong>"+"</strong> untuk memasukkan ke keranjang belanja<br />
        
        </p>
    
        <MobileScrollable style={{ position: "sticky", top: 0, backgroundColor: "white", zIndex: 100, marginBottom: 16 }}>
          <Flex justify="space-between" align="flex-end" style={{ flexWrap: "nowrap" }}>
          <div style={{ marginBottom: 8, marginRight: 16, flex: 1, minWidth: 100 }}>
            <div style={{ fontWeight: "bold", marginBottom: 4 }}>Brand</div>
            <select
              value={selectedBrand || ""}
              onChange={(e) => setSelectedBrand(e.target.value || null)}
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
        {!loading && (searchText || selectedBrand) ? (
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
    </div>
  );
}
