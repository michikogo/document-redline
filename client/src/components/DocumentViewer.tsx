import React, { useEffect, useReducer } from "react";
import { getDocument } from "../api/client";
import type { Document } from "../api/client";
import styles from "./DocumentViewer.module.css";

type State =
  | { status: "loading" }
  | { status: "ok"; doc: Document }
  | { status: "error"; message: string };

type Props = {
  documentId: string;
  overrideDoc?: Document;
};

const DocumentViewer = ({ documentId, overrideDoc }: Props) => {
  const [state, dispatch] = useReducer((_prev: State, next: State) => next, {
    status: "loading",
  });

  useEffect(() => {
    dispatch({ status: "loading" });
    getDocument(documentId)
      .then((doc) => dispatch({ status: "ok", doc }))
      .catch((err) => dispatch({ status: "error", message: err.message }));
  }, [documentId]);

  useEffect(() => {
    if (overrideDoc) dispatch({ status: "ok", doc: overrideDoc });
  }, [overrideDoc]);

  if (state.status === "error")
    return <p className={styles.error}>{state.message}</p>;
  if (state.status === "loading")
    return <p className={styles.loading}>Loading...</p>;

  const { doc } = state;

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>{doc.title}</h1>
        <span className={styles.meta}>
          Version {doc.version} · Updated{" "}
          {new Date(doc.updated_at).toLocaleString()}
        </span>
      </div>
      <pre className={styles.content}>{doc.content}</pre>
    </div>
  );
};

export default DocumentViewer;
