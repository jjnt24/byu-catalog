import React, { useContext, useEffect, useState } from "react";
import { Table, Input, Button, Space, Flex } from "antd";
import * as XLSX from "xlsx";
import { CartContext } from "./CartContext";
import { useNavigate } from "react-router-dom";
import { DeleteOutlined } from "@ant-design/icons";

export default function PriceListPage({withCart=false}) {
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const { cart, addToCart, updateQty, removeFromCart } = useContext(CartContext);
  const navigate = useNavigate();

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
      });
  }, []);

  // const filteredData = data.filter((row) =>
  //   Object.values(row)
  //     .join(" ")
  //     .toLowerCase()
  //     .includes(searchText.toLowerCase())
  // );

  const filteredData = data.filter((item) => {
    const target = `${item["Brand"]} ${item["Nama Produk"]}`.toLowerCase(); // combine fields if needed
    const searchWords = searchText.toLowerCase().split(" ").filter(Boolean);

    // Check if every search word exists somewhere in the target string
    return searchWords.every((word) => target.includes(word));
  });

  // const columns =
  //   filteredData.length > 0
  //     ? Object.keys(filteredData[0]).map((key) => ({
  //         title: key,
  //         dataIndex: key,
  //         key,
  //       }))
  //     : [];
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
      "title":"Harga Byusoul",
      "dataIndex":"Harga Byusoul",
      "key":"Harga Byusoul",
      "width": 150, // fixed width
      sorter: (a, b) => a["Harga Byusoul"] - b["Harga Byusoul"],
      render: item => item.toLocaleString(),
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
          <Button onClick={() => addToCart(record)}>Add to Cart</Button>
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
      <Flex justify="space-between" align="center">

        <h2>Price List</h2>
        <Button onClick={() => navigate("/cart")}>Check Cart</Button>
      </Flex>
      <Input.Search
        placeholder="Search..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 16, maxWidth: 300 }}
        allowClear
      />
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey={(record, index) => index}
        pagination={{ pageSize: 5 }}
        bordered
        scroll={{ x: "100%" }} // allow horizontal scroll if needed
        style={{
          width: "100%", // fit table to container
          tableLayout: "fixed", // makes column widths fixed
        }}
      />
    </div>
  );
}
