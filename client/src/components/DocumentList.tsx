import React, { useEffect, useState } from "react";
import { getDocuments } from "../api/client";
import type { DocumentSummary } from "../api/client";
import styles from "./DocumentList.module.css";

type Props = {
  selectedId: string | null;
  onSelect: (id: string) => void;
};

const DocumentList = ({ selectedId, onSelect }: Props) => {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDocuments()
      .then(setDocuments)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (documents.length === 0) return <p className={styles.empty}>No documents yet.</p>;

  return (
    <ul className={styles.list}>
      {documents.map((doc) => (
        <li
          key={doc.id}
          onClick={() => onSelect(doc.id)}
          className={`${styles.item} ${selectedId === doc.id ? styles.itemSelected : ""}`}
        >
          <div className={styles.title}>{doc.title}</div>
          <div className={styles.meta}>
            v{doc.version} · {new Date(doc.updated_at).toLocaleDateString()}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default DocumentList;
