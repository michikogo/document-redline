import React, { useState } from "react";
import DocumentList from "./components/DocumentList";
import DocumentViewer from "./components/DocumentViewer";
import ChangeForm from "./components/ChangeForm";
import ChangeLog from "./components/ChangeLog";
import Drawer from "./components/Drawer";
import type { Document } from "./api/client";
import styles from "./styles/App.module.css";

const App = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [updatedDoc, setUpdatedDoc] = useState<Document | undefined>();
  const [changeLogKey, setChangeLogKey] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTarget, setDrawerTarget] = useState<string | undefined>();
  const [drawerKey, setDrawerKey] = useState(0);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setUpdatedDoc(undefined);
    setDrawerOpen(false);
  };

  const handleOpenDrawer = (prefill?: string) => {
    if (prefill === undefined && drawerOpen) {
      setDrawerOpen(false);
      return;
    }
    setDrawerTarget(prefill);
    setDrawerKey((k) => k + 1);
    setDrawerOpen(true);
  };

  const handleChangeSuccess = (doc: Document) => {
    setUpdatedDoc(doc);
    setChangeLogKey((k) => k + 1);
    setDrawerOpen(false);
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
            <DocumentViewer
              documentId={selectedId}
              overrideDoc={updatedDoc}
              onOpenDrawer={handleOpenDrawer}
            />
            <ChangeLog documentId={selectedId} refreshKey={changeLogKey} />
          </>
        ) : (
          <p className={styles.empty}>Select a document to get started.</p>
        )}
      </main>
      {selectedId && (
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <ChangeForm
            key={drawerKey}
            documentId={selectedId}
            initialTarget={drawerTarget}
            onSuccess={handleChangeSuccess}
          />
        </Drawer>
      )}
    </div>
  );
};

export default App;
