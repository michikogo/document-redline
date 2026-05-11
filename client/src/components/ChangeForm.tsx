import React, { useState } from "react";
import { applyChanges } from "../api/client";
import type { Document } from "../api/client";
import styles from "../styles/ChangeForm.module.css";

type ChangeRow = {
  id: string;
  target: string;
  occurrence: number;
  replacement: string;
};

const makeRow = (target = ""): ChangeRow => ({
  id: crypto.randomUUID(),
  target,
  occurrence: 1,
  replacement: "",
});

type Props = {
  documentId: string;
  initialTarget?: string;
  onSuccess: (updated: Document) => void;
};

const ChangeForm = ({ documentId, initialTarget, onSuccess }: Props) => {
  const [rows, setRows] = useState<ChangeRow[]>([makeRow(initialTarget ?? "")]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const updateRow = (
    id: string,
    field: keyof Omit<ChangeRow, "id">,
    value: string | number,
  ) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  const addRow = () => setRows((prev) => [...prev, makeRow()]);

  const removeRow = (id: string) =>
    setRows((prev) => prev.filter((r) => r.id !== id));

  const isValid = rows.every((r) => r.target.trim() && r.replacement.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const updated = await applyChanges(
        documentId,
        rows.map((r) => ({
          operation: "replace" as const,
          target: { text: r.target, occurrence: r.occurrence },
          replacement: r.replacement,
        })),
      );
      onSuccess(updated);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <ul className={styles.rowList}>
        {rows.map((row, i) => (
          <li key={row.id} className={styles.changeRow}>
            {rows.length > 1 && (
              <div className={styles.rowHeader}>
                <span className={styles.rowLabel}>Change {i + 1}</span>
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => removeRow(row.id)}
                  aria-label="Remove change"
                >
                  ×
                </button>
              </div>
            )}
            <div className={styles.field}>
              <label className={styles.label}>Target text</label>
              <textarea
                className={styles.textarea}
                value={row.target}
                onChange={(e) => updateRow(row.id, "target", e.target.value)}
                placeholder="Text to replace"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Occurrence</label>
              <input
                className={styles.input}
                type="number"
                min={1}
                value={row.occurrence}
                onChange={(e) =>
                  updateRow(row.id, "occurrence", Number(e.target.value))
                }
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Replacement</label>
              <textarea
                className={styles.textarea}
                value={row.replacement}
                onChange={(e) =>
                  updateRow(row.id, "replacement", e.target.value)
                }
                placeholder="Replace with"
              />
            </div>
          </li>
        ))}
      </ul>
      <button type="button" className={styles.addButton} onClick={addRow}>
        + Add another change
      </button>
      {error && <p className={styles.error}>{error}</p>}
      <button
        className={styles.button}
        type="submit"
        disabled={loading || !isValid}
      >
        {loading
          ? "Applying..."
          : `Apply${rows.length > 1 ? ` (${rows.length})` : ""}`}
      </button>
    </form>
  );
};

export default ChangeForm;
