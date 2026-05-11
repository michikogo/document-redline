import React, { useEffect, useReducer, useRef, useState } from "react";
import { getDocument } from "../api/client";
import type { Document, SearchResult } from "../api/client";
import DocumentSearch from "./DocumentSearch";
import DocumentSearchResults from "./DocumentSearchResults";
import styles from "../styles/DocumentViewer.module.css";

type State =
  | { status: "loading" }
  | { status: "ok"; doc: Document }
  | { status: "error"; message: string };

type Props = {
  documentId: string;
  overrideDoc?: Document;
  onOpenDrawer: (prefill?: string) => void;
  onDocLoaded?: (doc: Document) => void;
  onSearchActive?: (active: boolean) => void;
};

const DocumentViewer = ({
  documentId,
  overrideDoc,
  onOpenDrawer,
  onDocLoaded,
  onSearchActive,
}: Props) => {
  const [state, dispatch] = useReducer((_prev: State, next: State) => next, {
    status: "loading",
  });
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const contentRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    dispatch({ status: "loading" });
    setSearchResult(null);
    setSearchQuery("");
    getDocument(documentId)
      .then((doc) => {
        dispatch({ status: "ok", doc });
        onDocLoaded?.(doc);
      })
      .catch((err) => dispatch({ status: "error", message: err.message }));
  }, [documentId]);

  useEffect(() => {
    if (overrideDoc) {
      dispatch({ status: "ok", doc: overrideDoc });
      onDocLoaded?.(overrideDoc);
    }
  }, [overrideDoc]);

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    const selected = selection.toString().trim();
    if (!selected || !contentRef.current?.contains(selection.anchorNode))
      return;
    onOpenDrawer(selected);
  };

  const handleSearchResults = (result: SearchResult | null, query: string) => {
    setSearchResult(result);
    setSearchQuery(query);
    onSearchActive?.(result !== null);
  };

  if (state.status === "error")
    return <p className={styles.error}>{state.message}</p>;
  if (state.status === "loading")
    return <p className={styles.loading}>Loading...</p>;

  const { doc } = state;

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>{doc.title}</h1>
          <span className={styles.meta}>
            Version {doc.version} · Updated{" "}
            {new Date(doc.updated_at).toLocaleString()}
          </span>
        </div>
        <button
          className={styles.applyButton}
          onClick={() => onOpenDrawer(undefined)}
        >
          Update Doc
        </button>
      </div>
      <DocumentSearch documentId={documentId} onResults={handleSearchResults} />
      {searchResult ? (
        <DocumentSearchResults result={searchResult} query={searchQuery} />
      ) : (
        <pre
          ref={contentRef}
          className={styles.content}
          onMouseUp={handleMouseUp}
        >
          {doc.content}
        </pre>
      )}
    </div>
  );
};

export default DocumentViewer;
