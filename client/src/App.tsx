import React, { useState } from "react";
import DocumentList from "./components/DocumentList";
import DocumentViewer from "./components/DocumentViewer";
import ChangeForm from "./components/ChangeForm";
import ChangeLog from "./components/ChangeLog";
import Drawer from "./components/Drawer";
import SearchBar from "./components/SearchBar";
import SearchResults from "./components/SearchResults";
import NewDocumentModal from "./components/NewDocumentModal";
import type { Document, SearchResult } from "./api/client";
import { searchDocuments } from "./api/client";
import styles from "./styles/App.module.css";

const App = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNewDoc, setShowNewDoc] = useState(false);
  const [docListKey, setDocListKey] = useState(0);
  const [updatedDoc, setUpdatedDoc] = useState<Document | undefined>();
  const [changeLogKey, setChangeLogKey] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTarget, setDrawerTarget] = useState<string | undefined>();
  const [drawerKey, setDrawerKey] = useState(0);
  const [selectedDocContent, setSelectedDocContent] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setUpdatedDoc(undefined);
    setSelectedDocContent("");
    setDrawerOpen(false);
    setSearchResults(null);
    setSearchQuery("");
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

  const handleDocCreated = (doc: Document) => {
    setDocListKey((k) => k + 1);
    setShowNewDoc(false);
    handleSelect(doc.id);
  };

  const handleSearch = async (q: string) => {
    if (!q) {
      setSearchResults(null);
      setSearchQuery("");
      return;
    }
    setSearchQuery(q);
    const results = await searchDocuments(q);
    setSearchResults(results);
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarHeading}>Documents</h2>
          <button
            className={styles.newDocButton}
            onClick={() => setShowNewDoc(true)}
          >
            + New
          </button>
        </div>
        <SearchBar onSearch={handleSearch} />
        {searchResults ? (
          <SearchResults
            results={searchResults}
            query={searchQuery}
            onSelectDocument={handleSelect}
          />
        ) : (
          <DocumentList
            key={docListKey}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        )}
      </aside>
      <main className={styles.main}>
        {selectedId ? (
          <>
            <DocumentViewer
              documentId={selectedId}
              overrideDoc={updatedDoc}
              onOpenDrawer={handleOpenDrawer}

              onDocLoaded={(doc) => setSelectedDocContent(doc.content)}
=======
              onSearchActive={(active) => { if (active) setDrawerOpen(false); }}
>>>>>>> 51ae1d9 (feat: close drawer when document search results appear)
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
            documentContent={selectedDocContent}
            initialTarget={drawerTarget}
            onSuccess={handleChangeSuccess}
          />
        </Drawer>
      )}
      {showNewDoc && (
        <NewDocumentModal
          onClose={() => setShowNewDoc(false)}
          onCreated={handleDocCreated}
        />
      )}
    </div>
  );
};

export default App;
