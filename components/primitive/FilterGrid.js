import React from 'react';
import styles from './fgrid.module.css'; // Optional: For styling purposes.

export function FilterGrid({ rows, cols, selected, setSelected }) {
    return (
        <div className={styles["filter-grid"]}>
            {/* Top labels */}
            <div className={styles["grid-header"]}>
                <div className={styles["empty-cell"]}></div> {/* Empty cell for top-left corner */}
                {cols.map((col, j) => (
                    <div key={`col-${j}`} className={styles["header-label"]}>
                        {col}
                    </div>
                ))}
            </div>
            {/* Grid with left labels and cells */}
            {rows.map((row, i) => (
                <div key={`row-${i}`} className={styles["grid-row"]}>
                    {/* Left label */}
                    <div className={styles["left-label"]}>
                        {row}
                    </div>
                    {/* Grid cells */}
                    {cols.map((_, j) => (
                        <div
                            key={`cell-${i}-${j}`}
                            className={`${styles["grid-cell"]} ${selected.includes(i * rows.length + j) ? styles["selected"] : ''}`}
                            onClick={() => {
                                if (selected.includes(3 * i + j)) {
                                    setSelected((prev) => prev.filter((index) => index !== 3 * i + j));
                                } else {
                                    setSelected((prev) => [...prev, 3 * i + j]);
                                }
                            }}
                        ></div>
                    ))}
                </div>
            ))}
        </div>
    );
}
