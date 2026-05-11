import React, { useState } from "react";
import { applyChanges } from "../api/client";
import type { Document } from "../api/client";
import styles from "./ChangeForm.module.css";

type Props = {
  documentId: string;
  onSuccess: (updated: Document) => void;
};

const ChangeForm = ({ documentId, onSuccess }: Props) => {
  const [targetText, setTargetText] = useState("");
  const [occurrence, setOccurrence] = useState(1);
  const [replacement, setReplacement] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const updated = await applyChanges(documentId, [
        {
          operation: "replace",
          target: { text: targetText, occurrence },
          replacement,
        },
      ]);
      setTargetText("");
      setReplacement("");
      setOccurrence(1);
      onSuccess(updated);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3 className={styles.heading}>Apply Change</h3>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Target text</label>
          <input
            className={styles.input}
            value={targetText}
            onChange={(e) => setTargetText(e.target.value)}
            placeholder="Text to replace"
            required
          />
        </div>
        <div className={styles.fieldNarrow}>
          <label className={styles.label}>Occurrence</label>
          <input
            className={styles.input}
            type="number"
            min={1}
            value={occurrence}
            onChange={(e) => setOccurrence(Number(e.target.value))}
          />
        </div>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Replacement</label>
        <input
          className={styles.input}
          value={replacement}
          onChange={(e) => setReplacement(e.target.value)}
          placeholder="Replace with"
        />
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <button
        className={styles.button}
        type="submit"
        disabled={loading || !targetText}
      >
        {loading ? "Applying…" : "Apply"}
      </button>
    </form>
  );
};

export default ChangeForm;
