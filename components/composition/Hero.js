import React from 'react';
import styles from './hero.module.css';

export function Hero({title, subtitle="none"}) {
  return (
    <div className={styles.container}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle !== "none" ? (
        <h2 className={styles.subtitle}>{subtitle}</h2>
    ) : null}
    </div>
  );
};
