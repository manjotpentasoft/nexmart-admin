import React from "react";

export default function DataTable({ columns = [], data = [], rowKey = "id" }) {
  return (
    <table className="categories-table">
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.key}>{c.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={typeof rowKey === "function" ? rowKey(row) : row[rowKey]}>
            {columns.map((c) => (
              <td key={c.key}>
                {c.renderCell ? c.renderCell(row) : row[c.key] ?? ""}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
