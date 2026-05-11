import React, { useState } from "react";
import DocumentList from "./components/DocumentList";
import DocumentViewer from "./components/DocumentViewer";
import styles from "./App.module.css";

const App = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarHeading}>Documents</h2>
        <DocumentList selectedId={selectedId} onSelect={setSelectedId} />
      </aside>
      <main className={styles.main}>
        {selectedId ? (
          <DocumentViewer documentId={selectedId} />
        ) : (
          <p className={styles.empty}>Select a document to get started.</p>
        )}
      </main>
    </div>
  );
};

export default App;
