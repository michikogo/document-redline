import React, { useState } from "react";
import { applyChanges } from "../api/client";
import type { Document } from "../api/client";
import useDebounce from "../hooks/useDebounce";
import styles from "../styles/ChangeForm.module.css";

const countOccurrences = (content: string, target: string): number => {
  if (!target.trim()) return 0;
  const lower = content.toLowerCase();
  const lowerTarget = target.toLowerCase();
  let count = 0;
  let idx = 0;
  while ((idx = lower.indexOf(lowerTarget, idx)) !== -1) {
    count++;
    idx += lowerTarget.length;
  }
  return count;
};

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
  documentContent?: string;
  initialTarget?: string;
  onSuccess: (updated: Document) => void;
};

const ChangeForm = ({
  documentId,
  documentContent = "",
  initialTarget,
  onSuccess,
}: Props) => {
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
          <ChangeRowItem
            key={row.id}
            row={row}
            index={i}
            showRemove={rows.length > 1}
            documentContent={documentContent}
            onUpdate={updateRow}
            onRemove={removeRow}
          />
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
          : rows.length > 1
            ? "Apply (" + rows.length + ")"
            : "Apply"}
      </button>
    </form>
  );
};

type RowProps = {
  row: ChangeRow;
  index: number;
  showRemove: boolean;
  documentContent: string;
  onUpdate: (id: string, field: keyof Omit<ChangeRow, "id">, value: string | number) => void;
  onRemove: (id: string) => void;
};

const ChangeRowItem = ({ row, index, showRemove, documentContent, onUpdate, onRemove }: RowProps) => {
  const debouncedTarget = useDebounce(row.target, 300);
  const occurrenceCount = countOccurrences(documentContent, debouncedTarget);

  return (
    <li className={styles.changeRow}>
      {showRemove && (
        <div className={styles.rowHeader}>
          <span className={styles.rowLabel}>Change {index + 1}</span>
          <button
            type="button"
            className={styles.removeButton}
            onClick={() => onRemove(row.id)}
            aria-label="Remove change"
          >
            x
          </button>
        </div>
      )}
      <div className={styles.field}>
        <label className={styles.label}>Target text</label>
        <textarea
          className={styles.textarea}
          value={row.target}
          onChange={(e) => onUpdate(row.id, "target", e.target.value)}
          placeholder="Text to replace"
        />
        {debouncedTarget && (
          <span
            className={
              occurrenceCount === 0
                ? styles.occurrenceWarn
                : styles.occurrenceHint
            }
          >
            {occurrenceCount === 0
              ? "not found in document"
              : occurrenceCount + " occurrence" + (occurrenceCount === 1 ? "" : "s") + " found"}
          </span>
        )}
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Occurrence</label>
        <input
          className={styles.input}
          type="number"
          min={1}
          value={row.occurrence}
          onChange={(e) => onUpdate(row.id, "occurrence", Number(e.target.value))}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Replacement</label>
        <textarea
          className={styles.textarea}
          value={row.replacement}
          onChange={(e) => onUpdate(row.id, "replacement", e.target.value)}
          placeholder="Replace with"
        />
      </div>
    </li>
  );
};

export default ChangeForm;
