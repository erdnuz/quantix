import React from "react";
import styles from "@styles/comp/base.module.css";
import { IconArrowLeft } from "../icons"; // Import your arrow icon

export function BaseDialog({ onReturn, onClose, children, isOpen=true }) {
  if (!isOpen) {
    return;
  }
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          {/* Render the back arrow if onReturn is provided */}
          {onReturn && (
            <div className={styles.back} onClick={onReturn}>
              <IconArrowLeft size="28" isClickable={true} />
            </div>
          )}
          <div className={styles.content}>{children}</div>
        </div>
      </div>
    </div>
  );
}

