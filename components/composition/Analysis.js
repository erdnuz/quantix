import React from 'react';
import styles from './analysis.module.css';

export function Analysis({ className='', price, numAnalysts, rec, minTarget, maxTarget, meanTarget }) {
  const formatPercentage = (value) => {
    const percentage = ((value - 1) * 100).toFixed(2);
    const colorClass = percentage >= 0 ? 'positive' : 'negative';
    return <span className={colorClass}>({percentage}%)</span>;
  };



  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.header}>
        <h3 className="head" style={{
          margin: 0,
          flex: 1,
        }}>Analysis</h3>
        <p className={`small ${styles.smallM}`} >
          {numAnalysts} Analysts
        </p>
      </div>

      <div className={styles.section}>
        <h2 className="body" style={{
            margin: '0 0 5px',
            flex: 1
          }}>Recommendation</h2>
        <p
          className={`recommendation body ${
            rec < 3
              ? 'positive'
              : rec < 4
              ? styles.hold
              : rec < 6
              ? 'negative'
              : 'subtle'
          }`}
          style={{
            margin: 0,
            flex: 1
          }}
        >
          {rec < 2
            ? 'Strong Buy'
            : rec < 3
            ? 'Buy'
            : rec < 4
            ? 'Hold'
            : rec < 5
            ? 'Sell'
            : rec < 6
            ? 'Strong Sell'
            : 'NaN'}
        </p>
      </div>

      <div className={styles.section}>
        <h2 className="body" style={{
            margin: '0 0 5px',
            flex: 1
          }}>Max. Price Target</h2>
        <p className="body" style={{
            margin: 0,
            flex: 1
          }}>
          {maxTarget ? maxTarget.toFixed(2) : "NaN"} {formatPercentage(maxTarget / price)}
        </p>
      </div>

      <div className={styles.section}>
        <h2 className="body" style={{
            margin: '0 0 5px',
            flex: 1
          }}>Mean Price Target</h2>
        <p className="body" style={{
            margin: 0,
            flex: 1
          }}>
          {meanTarget ? meanTarget.toFixed(2) : "NaN"} {formatPercentage(meanTarget / price)}
        </p>
      </div>

      <div className={styles.section}>
        <h2 className="body" style={{
            margin: '0 0 5px',
            flex: 1
          }}>Min. Price Target</h2>
        <p className="body" style={{
            margin: 0,
            flex: 1
          }}>
          {minTarget ? minTarget.toFixed(2) : "NaN"} {formatPercentage(minTarget / price)}
        </p>
      </div>
    </div>
  );
}
