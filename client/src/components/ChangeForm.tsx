import React, { useState } from "react";
import { applyChanges } from "../api/client";
import type { Document } from "../api/client";
import styles from "../styles/ChangeForm.module.css";

type Props = {
  documentId: string;
  initialTarget?: string;
  onSuccess: (updated: Document) => void;
};

const ChangeForm = ({ documentId, initialTarget, onSuccess }: Props) => {
  const [targetText, setTargetText] = useState(initialTarget ?? "");
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
      onSuccess(updated);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label className={styles.label}>Target text</label>
        <textarea
          className={styles.textarea}
          value={targetText}
          onChange={(e) => setTargetText(e.target.value)}
          placeholder="Text to replace"
          required
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Occurrence</label>
        <input
          className={styles.input}
          type="number"
          min={1}
          value={occurrence}
          onChange={(e) => setOccurrence(Number(e.target.value))}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Replacement</label>
        <textarea
          className={styles.textarea}
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
        {loading ? "Applying..." : "Apply"}
      </button>
    </form>
  );
};

export default ChangeForm;
