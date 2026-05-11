import React, { useEffect, useReducer } from "react";
import { getDocument, Document } from "../api/client";

type State =
  | { status: "loading" }
  | { status: "ok"; doc: Document }
  | { status: "error"; message: string };

type Props = {
  documentId: string;
};

const DocumentViewer = ({ documentId }: Props) => {
  const [state, dispatch] = useReducer(
    (_prev: State, next: State) => next,
    { status: "loading" },
  );

  useEffect(() => {
    dispatch({ status: "loading" });
    getDocument(documentId)
      .then((doc) => dispatch({ status: "ok", doc }))
      .catch((err) => dispatch({ status: "error", message: err.message }));
  }, [documentId]);

  if (state.status === "error")
    return <p style={{ color: "#ef4444" }}>{state.message}</p>;
  if (state.status === "loading")
    return <p style={{ color: "#9ca3af" }}>Loading...</p>;

  const { doc } = state;

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ margin: "0 0 4px", fontSize: 20, color: "#111827" }}>
          {doc.title}
        </h1>
        <span style={{ fontSize: 12, color: "#6b7280" }}>
          Version {doc.version} · Updated{" "}
          {new Date(doc.updated_at).toLocaleString()}
        </span>
      </div>
      <pre
        style={{
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          background: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: 6,
          padding: 16,
          fontSize: 14,
          lineHeight: 1.6,
          color: "#374151",
        }}
      >
        {doc.content}
      </pre>
    </div>
  );
};

export default DocumentViewer;
