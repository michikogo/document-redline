import React, { useEffect, useState } from "react";
import { getDocuments } from "../api/client";
import type { DocumentSummary } from "../api/client";

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

  if (error) return <p style={{ color: "#ef4444", fontSize: 13 }}>{error}</p>;

  if (documents.length === 0)
    return <p style={{ color: "#9ca3af", fontSize: 13 }}>No documents yet.</p>;

  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {documents.map((doc) => (
        <li
          key={doc.id}
          onClick={() => onSelect(doc.id)}
          style={{
            padding: "10px 12px",
            borderRadius: 6,
            cursor: "pointer",
            marginBottom: 4,
            background: selectedId === doc.id ? "#eff6ff" : "transparent",
            borderLeft: selectedId === doc.id ? "3px solid #3b82f6" : "3px solid transparent",
          }}
        >
          <div style={{ fontWeight: 500, fontSize: 14, color: "#111827" }}>
            {doc.title}
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
            v{doc.version} · {new Date(doc.updated_at).toLocaleDateString()}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default DocumentList;
