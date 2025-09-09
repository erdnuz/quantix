import React from 'react';
import styles from './analysis.module.css'; // Import the CSS file

export function AnalysisCompare({ tickers, prices }) {
  const formatPercentage = (value) => {
    const percentage = ((value - 1) * 100).toFixed(2);
    const colorClass = percentage >= 0 ? 'positive' : 'negative';
    return <span className={colorClass}>({percentage}%)</span>;
  };

  const metrics = [
    { title: 'Rec.', key: 'an-rec' },
    { title: 'Max. Target', key: 'an-max' },
    { title: 'Mean Target', key: 'an-avg' },
    { title: 'Min. Target', key: 'an-min' },
  ];

  const renderValue = (key, ticker) => {
    const value = ticker[key];
    if (key === 'an-rec') {
      return (
        <h3
          className={`body ${styles.fix} ${
            value < 3 ? 'positive' : value < 4 ? styles.hold : value < 6 ? 'negative' : 'nan'
          }`}
          style={{ margin: 0 }}
        >
          {value < 2
            ? 'Strong Buy'
            : value < 3
            ? 'Buy'
            : value < 4
            ? 'Hold'
            : value < 5
            ? 'Sell'
            : value < 6
            ? 'Strong Sell'
            : 'NaN'}
        </h3>
      );
    } else {
      return (
        <h3 className={`body ${styles.fix}`} style={{ margin: 0 }}>
          {value ? Number(value).toFixed(2) : 'NaN'}{' '}
          {value ? formatPercentage(value / prices[ticker.ticker]) : null}
        </h3>
      );
    }
  };

  return (
    <div className={styles["compareContainer"]}>
      <div className="ticker-analysis">
        {/* Header */}
        <div
          className={styles["header"]}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 0',
          }}
        >
          <h1 className={`head ${styles.header}`} style={{ margin: 0, flex: 1 }}>Ticker</h1>
          {metrics.map((metric, i) => (
            <h2 key={i} className={`subhead ${styles.metric}`} style={{ margin: 0, flex: 1, textAlign: 'center' }}>
              {metric.title}
            </h2>
          ))}
        </div>

        {/* Ticker Rows */}
        {tickers.map((ticker, i) => (
          <div
            key={i}
            className={styles.section}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 0',
            }}
          >
            <h2 className={`body ${styles.fix}`} style={{ margin: 0, flex: 1 }}>{ticker.ticker}</h2>
            {metrics.map((metric, j) => (
              <div key={j} style={{ flex: 1, textAlign: 'center' }}>
                {renderValue(metric.key, ticker)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
