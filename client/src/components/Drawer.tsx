import React from "react";
import styles from "./Drawer.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

const Drawer = ({ open, onClose, children }: Props) => (
  <div className={`${styles.drawer} ${open ? styles.drawerOpen : ""}`}>
    <div className={styles.header}>
      <h3 className={styles.heading}>Update Doc</h3>
      <button
        className={styles.closeButton}
        onClick={onClose}
        aria-label="Close"
      >
        ✕
      </button>
    </div>
    <div className={styles.body}>{children}</div>
  </div>
);

export default Drawer;
