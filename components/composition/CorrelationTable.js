import styles from './corr.module.css'
import React from 'react'
function interpolateColor(n, neutral = false) {
    // Good-bad color scheme
    const c1 = [190, 15, 15]; //  #c00f0c
    const c2 = [150, 150, 150]; // #949494
    const c3 = [0, 90, 50]; // #02542d

    let r, g, b;

    if (n <= 0) {
        // Interpolate between red and yellow
        let factor = (n + 1) / 1;
        r = Math.round(c1[0] + factor * (c2[0] - c1[0]));
        g = Math.round(c1[1] + factor * (c2[1] - c1[1]));
        b = Math.round(c1[2] + factor * (c2[2] - c1[2]));
    } else {
        // Interpolate between yellow and green
        let factor = n;
        r = Math.round(c2[0] + factor * (c3[0] - c2[0]));
        g = Math.round(c2[1] + factor * (c3[1] - c2[1]));
        b = Math.round(c2[2] + factor * (c3[2] - c2[2]));
    }

    return `rgb(${r}, ${g}, ${b})`;
}

export const CorrelationTable = ({ data = {} }) => {
    if (!data || Object.keys(data).length === 0) return null;

    const tickers = [...Object.keys(data).filter((ticker) => ticker !== "^GSPC"), "^GSPC"];

    return (
        <div className="metrics-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px'}}>
            {/* Correlation Table */}
            <div className="table-container" style={{
                display: 'grid', 
                gridTemplateColumns: `auto repeat(${tickers.length}, 1fr)`, 
                gap: '8px', 
                alignItems: 'center',
                borderRadius: '8px', 
                border: 'none'
            }}>
                <div className="empty-cell"></div>
                {tickers.map(ticker => (
                    <div className={styles.metCol} key={ticker} style={{ textAlign: 'center' }}>
                        <h3 className={`body ${styles.ind}`} style={{ margin: 0}}>{ticker.replace("^GSPC", "S&P 500")}</h3>
                    </div>
                ))}

                {tickers.filter((ticker) => {return ticker != "^GSPC"}).map((ticker) => (
                    <React.Fragment key={ticker}>
                        <div className="table-row-label" style={{ textAlign: 'right', paddingRight: '4px' }}>
                            <h3 className={`body ${styles.ind}`} style={{ margin: 0 }}>{ticker}</h3>
                        </div>
                        {tickers.map((targetTicker) => (
                            <div
                                className={`small ${styles.cell}`}
                                key={targetTicker}
                                style={{
                                    backgroundColor: interpolateColor(data[ticker][targetTicker]),
                                    
                                }}
                                title={`Correlation: ${data[ticker][targetTicker]}`}
                            >
                                {(100*data[ticker][targetTicker]).toFixed(0)}
                            </div>
                        ))}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};
