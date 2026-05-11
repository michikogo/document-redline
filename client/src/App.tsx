import React from "react";

const App = () => {
  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>
      <aside style={{ width: 280, borderRight: "1px solid #e5e7eb", padding: 16, overflowY: "auto" }}>
        <h2 style={{ margin: "0 0 16px", fontSize: 16 }}>Documents</h2>
      </aside>
      <main style={{ flex: 1, padding: 24, overflowY: "auto" }}>
        <p style={{ color: "#6b7280" }}>Select a document to get started.</p>
      </main>
    </div>
  );
};

export default App;
