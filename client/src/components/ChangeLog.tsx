import React, { useEffect, useState } from "react";
import { getChanges } from "../api/client";
import type { Change } from "../api/client";
import styles from "../styles/ChangeLog.module.css";

type Props = {
  documentId: string;
  refreshKey: number;
};

const ChangeLog = ({ documentId, refreshKey }: Props) => {
  const [changes, setChanges] = useState<Change[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getChanges(documentId)
      .then(setChanges)
      .catch((err) => setError(err.message));
  }, [documentId, refreshKey]);

  return (
    <section className={styles.section}>
      <h3 className={styles.heading}>Change Log</h3>
      {error && <p className={styles.empty}>{error}</p>}
      {!error && changes.length === 0 && (
        <p className={styles.empty}>No changes yet.</p>
      )}
      <ul className={styles.list}>
        {changes.map((c) => (
          <li key={c.id} className={styles.item}>
            <div className={styles.change}>
              <span className={styles.target}>{c.target_text}</span>
              <span className={styles.arrow}>→</span>
              <span className={styles.replacement}>{c.replacement}</span>
              <span className={styles.occurrence}>
                (occurrence {c.occurrence})
              </span>
            </div>
            <div className={styles.timestamp}>
              {new Date(c.applied_at).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ChangeLog;
