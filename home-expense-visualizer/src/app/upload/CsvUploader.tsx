import React, { useState } from "react";
import Papa, { ParseResult } from "papaparse";
import ExpenseVisualizer from "./ExpenseVisualizer";
import { categoryRules } from "../rules";

interface ExpenseRow {
  [key: string]: string; // flexible to handle any column names
}

interface CleanedExpense {
  postingdate: Date;
  category: string;
  indicator: string;
  reference: string;
  amount: number;
}

// Possible aliases for columns
const columnMap: Record<string, string[]> = {
  postingDate: ["Posting Date", "Date", "Transaction Date"],
  amount: ["Amount", "Instructed Amount", "Transaction Amount"],
  indicator: ["Credit Debit Indicator", "Withdrawal", "Type", "Transaction Type"],
  reference: ["Reference", "Details", "Description"],
  category: ["Category", "Type Group", "Type"]
};

// Get the first non-empty value from possible column names
function getColumn(row: ExpenseRow, options: string[]): string | undefined {
  for (const col of options) {
    if (col in row && row[col].trim() !== "") return row[col];
  }
  return undefined;
}

// Apply smarter categorization rules
function applyRules(description: string | undefined): string | null {
  if (!description) return null;
  const desc = description.toLowerCase();
  for (const keyword in categoryRules) {
    if (desc.includes(keyword)) return categoryRules[keyword];
  }
  return null;
}

export default function CsvUploader() {
  const [parsedData, setParsedData] = useState<CleanedExpense[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("All");
  const [selectedYear, setSelectedYear] = useState<string>("All");

  function HandleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: ParseResult<ExpenseRow>) => {
        const cleaned: CleanedExpense[] = [];

        results.data.forEach((row, index) => {
          const amountStr = getColumn(row, columnMap.amount);
          const amount = amountStr ? parseFloat(amountStr) : NaN;
          if (isNaN(amount) || amount <= 0) return;

          const dateStr = getColumn(row, columnMap.postingDate);
          const postingdate = dateStr ? new Date(dateStr) : new Date();
          if (isNaN(postingdate.getTime())) return;

          const indicator = getColumn(row, columnMap.indicator) || "";
          const reference = getColumn(row, columnMap.reference) || "";
          const initialCategory = getColumn(row, columnMap.category) || "Uncategorized";
          const smarterCategory = applyRules(reference) || initialCategory;
          const categoryNormalized = smarterCategory.trim();

          if (["deposit", "deposits", "transfers"].includes(categoryNormalized.toLowerCase())) return;

          cleaned.push({
            postingdate,
            amount,
            indicator,
            reference,
            category: categoryNormalized,
          });
        });

        setParsedData(cleaned);
      },
      error: (error) => console.error("Error parsing CSV", error),
    });
  }

  const filteredData = parsedData.filter((expense) => {
    const matchesMonth =
      selectedMonth === "All" || expense.postingdate.getMonth() + 1 === Number(selectedMonth);
    const matchesYear =
      selectedYear === "All" || expense.postingdate.getFullYear() === Number(selectedYear);
    return matchesMonth && matchesYear;
  });

  const totalIncome = filteredData
    .filter((item) => item.indicator.toLowerCase() === "credit")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalSpent = filteredData
    .filter((item) => item.indicator.toLowerCase() === "debit")
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <div>
      {/* Filters side by side */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", margin: "1rem 0" }}>
        {/* Month Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label htmlFor="month-select" style={{ fontWeight: "600" }}>Filter by Month:</label>
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
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
        </div>

        {/* Year Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label htmlFor="year-select" style={{ fontWeight: "600" }}>Filter by Year:</label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
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
            <option value="All">All Years Available</option>
            {[2025, 2024, 2023, 2022, 2021].map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="uploader">
        <label htmlFor="file-upload" className="custom-upload">Upload CSV</label>
        <input id="file-upload" type="file" accept=".csv" onChange={HandleFile} style={{ display: "none" }} />

        {filteredData.length > 0 && (
          <>
            <ExpenseVisualizer data={filteredData} selectedMonth={selectedMonth} selectedYear={selectedYear} />

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
          .custom-upload:hover { background-color: #005dc1; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 8px 12px; text-align: left; }
          th { background-color: #f5f5f5; }
        `}</style>
      </div>
    </div>
  );
}
