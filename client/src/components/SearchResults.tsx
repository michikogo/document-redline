import React from "react";
import type { SearchResult } from "../api/client";
import styles from "../styles/SearchResults.module.css";

type Props = {
  results: SearchResult[];
  query: string;
  onSelectDocument?: (id: string) => void;
};

const highlight = (text: string, query: string) => {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className={styles.highlight}>
        {part}
      </mark>
    ) : (
      part
    ),
  );
};

const SearchResults = ({ results, query, onSelectDocument }: Props) => {
  if (results.length === 0)
    return <p className={styles.empty}>No results for "{query}"</p>;

  return (
    <div className={styles.container}>
      {results.map((r) => (
        <div key={r.document_id} className={styles.result}>
          <button
            className={styles.title}
            onClick={() => onSelectDocument?.(r.document_id)}
          >
            {r.title}
          </button>
          <ul className={styles.snippets}>
            {r.snippets.map((snippet, i) => (
              <li key={i} className={styles.snippet}>
                <pre className={styles.pre}>{highlight(snippet, query)}</pre>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default SearchResults;
