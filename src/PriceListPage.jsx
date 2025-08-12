import React, { useEffect, useState } from "react";
import { Table, Input } from "antd";
import * as XLSX from "xlsx";

export default function PriceListPage() {
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState("");

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
        const rows = sliced.slice(1).map((row) =>
          Object.fromEntries(headers.map((h, i) => [h, row[i]]))
        );
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
    },
    {
      "title":"Nama Produk",
      "dataIndex":"Nama Produk",
      "key":"Nama Produk",
      "width": 500, // fixed width
    },
    {
      "title":"Harga Byusoul",
      "dataIndex":"Harga Byusoul",
      "key":"Harga Byusoul",
      "width": 150, // fixed width
    }
  ]

  return (
    <div style={{ padding: 20 }}>
      <h2>Price List</h2>
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
