import React, { useState } from "react";
import DocumentList from "./components/DocumentList";
import DocumentViewer from "./components/DocumentViewer";

const App = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      <aside
        style={{
          width: 280,
          flexShrink: 0,
          background: "var(--bg-sidebar)",
          borderRight: "1px solid var(--border)",
          padding: 16,
          overflowY: "auto",
        }}
      >
        <h2
          style={{
            margin: "0 0 16px",
            fontSize: 16,
            color: "var(--text-heading)",
            fontWeight: 600,
          }}
        >
          Documents
        </h2>
        <DocumentList selectedId={selectedId} onSelect={setSelectedId} />
      </aside>
      <main
        style={{
          flex: 1,
          padding: 24,
          overflowY: "auto",
          background: "var(--bg)",
        }}
      >
        {selectedId ? (
          <DocumentViewer documentId={selectedId} />
        ) : (
          <p style={{ color: "var(--text-muted)" }}>
            Select a document to get started.
          </p>
        )}
      </main>
    </div>
  );
};

export default App;
