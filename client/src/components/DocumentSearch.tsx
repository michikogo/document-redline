import React, { useState } from "react";
import { searchDocument } from "../api/client";
import type { SearchResult } from "../api/client";
import styles from "../styles/DocumentSearch.module.css";

type Props = {
  documentId: string;
  onResults: (results: SearchResult | null, query: string) => void;
};

const DocumentSearch = ({ documentId, onResults }: Props) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) {
      onResults(null, "");
      return;
    }
    setLoading(true);
    try {
      const result = await searchDocument(documentId, q);
      onResults(result, q);
    } catch {
      onResults(null, "");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    onResults(null, "");
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        className={styles.input}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search in this document…"
      />
      {query && (
        <button
          type="button"
          className={styles.clearButton}
          onClick={handleClear}
        >
          ×
        </button>
      )}
      <button className={styles.button} type="submit" disabled={loading}>
        {loading ? "…" : "Search"}
      </button>
    </form>
  );
};

export default DocumentSearch;
