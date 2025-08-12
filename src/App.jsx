import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";

export default function PriceListPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/data/pricelist.xlsx") // path inside public folder
      .then((res) => res.arrayBuffer())
      .then((arrayBuffer) => {
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        setData(jsonData);
      })
      .catch((err) => console.error("Error loading Excel file:", err));
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h2>Price List</h2>
      {data.length > 0 ? (
        <table
          style={{
            marginTop: "20px",
            borderCollapse: "collapse",
            width: "100%",
          }}
        >
          <thead>
            <tr>
              {Object.keys(data[0]).map((key) => (
                <th
                  key={key}
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px",
                    background: "#f0f0f0",
                  }}
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                {Object.values(row).map((val, j) => (
                  <td
                    key={j}
                    style={{ border: "1px solid #ccc", padding: "8px" }}
                  >
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
}
