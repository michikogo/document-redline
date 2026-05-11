import React, { useState } from "react";
import DocumentList from "./components/DocumentList";
import DocumentViewer from "./components/DocumentViewer";

const App = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif", background: "#fff", color: "#111827" }}>
      <aside
        style={{
          width: 280,
          background: "#fff",
          borderRight: "1px solid #e5e7eb",
          padding: 16,
          overflowY: "auto",
        }}
      >
        <h2 style={{ margin: "0 0 16px", fontSize: 16, color: "#111827" }}>
          Documents
        </h2>
        <DocumentList selectedId={selectedId} onSelect={setSelectedId} />
      </aside>
      <main style={{ flex: 1, padding: 24, overflowY: "auto", background: "#fff" }}>
        {selectedId ? (
          <DocumentViewer documentId={selectedId} />
        ) : (
          <p style={{ color: "#6b7280" }}>Select a document to get started.</p>
        )}
      </main>
    </div>
  );
};

export default App;
