"use client";
import CsvUploader from "./CsvUploader";

export default function UploadPage() {
  return (
    <main className="upload-page">
      <h1>Bank Statement Visualizer</h1>
      <CsvUploader />
      <style jsx>{`
        .upload-page {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          background-color: #f0f4f8; /* soft blue-gray */
          min-height: 100vh;
          font-family: sans-serif;
        }

        h1 {
          font-size: 1.75rem;
          margin-bottom: 1rem;
          color: #333;
        }
      `}</style>
    </main>
  );
}

