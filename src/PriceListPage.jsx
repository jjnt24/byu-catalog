import React, { useEffect, useState } from "react";
import { Table, Input } from "antd";
import * as XLSX from "xlsx";

export default function PriceListPage() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");

  // useEffect(() => {
  //   fetch("/data/priceList.xlsx")
  //     .then((res) => res.arrayBuffer())
  //     .then((arrayBuffer) => {
  //       const workbook = XLSX.read(arrayBuffer, { type: "array" });
  //       const sheetName = workbook.SheetNames[0];
  //       const sheet = workbook.Sheets[sheetName];
  //       const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  //       setData(jsonData);
  //     })
  //     .catch((err) => console.error("Error loading Excel file:", err));
  // }, []);

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

  const filteredData = data.filter((row) =>
    Object.values(row)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const columns =
    filteredData.length > 0
      ? Object.keys(filteredData[0]).map((key) => ({
          title: key,
          dataIndex: key,
          key,
        }))
      : [];

  return (
    <div style={{ padding: 20 }}>
      <h2>Price List</h2>
      <Input.Search
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 16, maxWidth: 300 }}
        allowClear
      />
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey={(record, index) => index}
        pagination={{ pageSize: 5 }}
        bordered
      />
    </div>
  );
}
