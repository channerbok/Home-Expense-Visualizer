import React, { useState } from "react";
import Papa, { ParseResult } from "papaparse";
import ExpenseVisualizer from "./ExpenseVisualizer";

interface ExpenseRow {
  "Posting Date": string;
  Amount: string;
  Reference: string;
  Description: string;
  Category: string;
}

interface CleanedExpense {
  postingdate: Date;
  category: string;
  reference: string;
  amount: number;
}

export default function CsvUploader() {
  const [parsedData, setParsedData] = useState<CleanedExpense[]>([]);

  function HandleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: ParseResult<ExpenseRow>) => {
        const cleaned = results.data
          .filter((row) => row.Amount && parseFloat(row.Amount) > 0)
          .map((row) => ({
            postingdate: row["Posting Date"]
              ? new Date(row["Posting Date"])
              : new Date(),
            amount: parseFloat(row.Amount),
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
  

  return (
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

      {/* Table if data exists */}
      {parsedData.length > 0 && (
        <>
        <ExpenseVisualizer data={parsedData} />
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {parsedData.map((item, index) => (
                <tr key={index}>
                  <td>{item.postingdate.toLocaleDateString()}</td>
                  <td>{item.category}</td>
                  <td>{item.reference}</td>
                  <td>${item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Render the visualizer */}
          
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
  );
}
