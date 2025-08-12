import React, { useState } from "react";
import Papa, { ParseResult } from "papaparse";
import ExpenseVisualizer from "./ExpenseVisualizer";

interface ExpenseRow {
  "Posting Date": string;
  Amount: string;
  "Credit Debit Indicator": string; 
  Reference: string;
  Description: string;
  Category: string;
}

interface CleanedExpense {
  postingdate: Date;
  category: string;
  indicator:string;
  reference: string;
  amount: number;
}

export default function CsvUploader() {
  const [parsedData, setParsedData] = useState<CleanedExpense[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("All");

  function HandleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: ParseResult<ExpenseRow>) => {
        const cleaned = results.data
          .filter(row => { 
            const category = row.Category?.trim().toLowerCase() || "";
            return row.Amount && parseFloat(row.Amount) > 0 && category !== "deposit" && category !== "deposits" && category !== "transfers";
            })
          .map((row) => ({
            postingdate: row["Posting Date"]
              ? new Date(row["Posting Date"])
              : new Date(),
            amount: parseFloat(row.Amount),
            indicator: row["Credit Debit Indicator"]?.trim() || "",
            reference: row.Reference?.trim() || row.Description?.trim() || "",
            category: row.Category?.trim() || "Uncategorized",
          }));

        setParsedData(cleaned);
      },
      error: (error) => {
        console.error("Error parsing CSV", error);
      },
    });
  }

  // Filter data based on selected month
  const filteredData =
    selectedMonth === "All"
      ? parsedData
      : parsedData.filter(
          (expense) =>
            expense.postingdate.getMonth() + 1 === Number(selectedMonth)
        );
  const totalIncome = filteredData
    .filter(item => item.indicator.toLowerCase() === "credit") 
    .reduce((sum, item) => sum + item.amount, 0);

  const totalSpent = filteredData
    .filter(item => item.indicator.toLowerCase() === "debit") 
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <div>
      {/* Month Filter */}
      <div
        style={{
          margin: "1rem 0",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <label htmlFor="month-select" style={{ fontWeight: "600" }}>
          Filter by Month:
        </label>
        <select
          id="month-select"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={{
            padding: "6px 10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "1rem",
            cursor: "pointer",
            backgroundColor: "white",
            minWidth: "140px",
          }}
        >
          <option value="All">All Months</option>
          <option value="1">January</option>
          <option value="2">February</option>
          <option value="3">March</option>
          <option value="4">April</option>
          <option value="5">May</option>
          <option value="6">June</option>
          <option value="7">July</option>
          <option value="8">August</option>
          <option value="9">September</option>
          <option value="10">October</option>
          <option value="11">November</option>
          <option value="12">December</option>
        </select>
      </div>

      <div className="uploader">
        {/* Custom-styled file input */}
        <label htmlFor="file-upload" className="custom-upload">
          Upload CSV
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".csv"
          onChange={HandleFile}
          style={{ display: "none" }}
        />

        {/* Table and Visualizer */}
        {filteredData.length > 0 && (
          <>
            <ExpenseVisualizer data={filteredData} />
            <table>
              <thead>
                <tr>
                  <td colSpan={3} style={{ textAlign: "right", fontWeight: "600" }}>Total Income:</td>
                  <td style={{ textAlign: "left", fontWeight: "600" }}>${totalIncome.toFixed(2)}</td>
                  <td></td>
                </tr>
                <tr>
                  <td colSpan={3} style={{ textAlign: "right", fontWeight: "600" }}>Total Spent:</td>
                  <td style={{ textAlign: "left", fontWeight: "600" }}>${totalSpent.toFixed(2)}</td>
                  <td></td>
                </tr>
              </thead>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Indicator</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.postingdate.toLocaleDateString()}</td>
                    <td>{item.indicator}</td>
                    <td>{item.category}</td>
                    <td>{item.reference}</td>
                    <td>${item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

          </>
        )}

        <style jsx>{`
          .uploader {
            border: 1px solid #ccc;
            padding: 20px;
            background-color: #fafafa;
            border-radius: 8px;
            margin-top: 2rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          }

          .custom-upload {
            display: inline-block;
            padding: 6px 14px;
            font-size: 0.875rem;
            background-color: #0070f3;
            color: white;
            border-radius: 4px;
            cursor: pointer;
            margin-bottom: 1rem;
          }

          .custom-upload:hover {
            background-color: #005dc1;
          }

          table {
            border-collapse: collapse;
            width: 100%;
            margin-top: 20px;
          }

          th,
          td {
            border: 1px solid #ccc;
            padding: 8px 12px;
            text-align: left;
          }

          th {
            background-color: #f5f5f5;
          }
        `}</style>
      </div>
    </div>
  );
}
