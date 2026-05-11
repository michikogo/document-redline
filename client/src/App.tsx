import React, { useState } from "react";
import DocumentList from "./components/DocumentList";
import DocumentViewer from "./components/DocumentViewer";
import ChangeForm from "./components/ChangeForm";
import ChangeLog from "./components/ChangeLog";
import type { Document } from "./api/client";
import styles from "./App.module.css";

const App = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [updatedDoc, setUpdatedDoc] = useState<Document | undefined>();
  const [changeLogKey, setChangeLogKey] = useState(0);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setUpdatedDoc(undefined);
  };

  const handleChangeSuccess = (doc: Document) => {
    setUpdatedDoc(doc);
    setChangeLogKey((k) => k + 1);
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarHeading}>Documents</h2>
        <DocumentList selectedId={selectedId} onSelect={handleSelect} />
      </aside>
      <main className={styles.main}>
        {selectedId ? (
          <>
            <DocumentViewer documentId={selectedId} overrideDoc={updatedDoc} />
            <ChangeForm documentId={selectedId} onSuccess={handleChangeSuccess} />
            <ChangeLog documentId={selectedId} refreshKey={changeLogKey} />
          </>
        ) : (
          <p className={styles.empty}>Select a document to get started.</p>
        )}
      </main>
    </div>
  );
};

export default App;
