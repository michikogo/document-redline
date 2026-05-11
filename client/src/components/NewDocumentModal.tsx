import React, { useState, useEffect, useRef } from "react";
import { createDocument } from "../api/client";
import type { Document } from "../api/client";
import styles from "../styles/NewDocumentModal.module.css";

type Props = {
  onClose: () => void;
  onCreated: (doc: Document) => void;
};

const NewDocumentModal = ({ onClose, onCreated }: Props) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const doc = await createDocument(title.trim(), content.trim());
      onCreated(doc);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.backdrop} onMouseDown={onClose}>
      <div
        className={styles.modal}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-doc-title"
      >
        <div className={styles.header}>
          <h2 id="new-doc-title" className={styles.heading}>
            New Document
          </h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="doc-title">
              Title
            </label>
            <input
              ref={titleRef}
              id="doc-title"
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. NDA Agreement"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="doc-content">
              Content
            </label>
            <textarea
              id="doc-content"
              className={styles.textarea}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste document text here…"
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading || !title.trim() || !content.trim()}
            >
              {loading ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewDocumentModal;
