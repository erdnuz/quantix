import React from 'react';
import styles from './card.module.css'; // Import the CSS file

export function Card({ ticker, name, region="", sector = "", marketCap }) {
    const formatLargeNumber = (number) => {
        try {
        if (number >= 1e12) return `${(number / 1e12).toFixed(1)} T`;
        if (number >= 1e9) return `${(number / 1e9).toFixed(1)} B`;
        if (number >= 1e6) return `${(number / 1e6).toFixed(1)} M`;
        if (number >= 1e3) return `${(number / 1e3).toFixed(1)} K`;
        return `${number.toFixed(0)}`;
        } catch {
          return number
        }
      };
    return (
        <div 
        className={styles.container}
        style={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap', gap: '8px' }}
      >
        <h2 className={`subhead ${styles.tick}`} >{ticker}</h2>
        <h1 
          className={`head ${styles.name}`}
          >
          {name}
        </h1>
        {sector ? (
          <p className={`body ${styles.para}`} >
            {sector}
          </p>
        ) : null}
        {region ? (
          <p className={`body ${styles.para}`}>
            {region}
          </p>
        ) : null}
        <p className={`body ${styles.para}`} >
          {`${formatLargeNumber(marketCap)}`}
        </p>
      </div>
      
    );
}
