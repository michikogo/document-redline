import React from "react";
import type { SearchResult } from "../api/client";
import styles from "../styles/DocumentSearchResults.module.css";

type Props = {
  result: SearchResult;
  query: string;
};

const highlight = (text: string, query: string) => {
  const lowerQuery = query.toLowerCase();
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining) {
    const idx = remaining.toLowerCase().indexOf(lowerQuery);
    if (idx === -1) {
      parts.push(remaining);
      break;
    }
    if (idx > 0) parts.push(remaining.slice(0, idx));
    parts.push(
      <mark key={key++} className={styles.highlight}>
        {remaining.slice(idx, idx + query.length)}
      </mark>,
    );
    remaining = remaining.slice(idx + query.length);
  }

  return parts;
};

const DocumentSearchResults = ({ result, query }: Props) => {
  if (result.snippets.length === 0) {
    return <p className={styles.empty}>No matches for "{query}"</p>;
  }

  return (
    <div className={styles.container}>
      <p className={styles.summary}>
        {result.snippets.length} match{result.snippets.length === 1 ? "" : "es"}{" "}
        for "{query}"
      </p>
      <ul className={styles.list}>
        {result.snippets.map((snippet, i) => (
          <li key={i} className={styles.snippet}>
            <pre className={styles.pre}>{highlight(snippet, query)}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocumentSearchResults;
