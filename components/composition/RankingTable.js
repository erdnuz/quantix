import { Ranking } from '../primitive';
import styles from './rtable.module.css'
function Row({ metric, col, data, isOverall, percent, goodBad=true, type=0}) {
    const formatNumber = (number) => {
        if (number >= 1e12) return `${(number / 1e12).toFixed(1)}T`;
        if (number >= 1e9) return `${(number / 1e9).toFixed(1)}B`;
        if (number >= 1e6) return `${(number / 1e6).toFixed(1)}M`;
        if (number >= 1e3) return `${(number / 1e3).toFixed(1)}K`;
        return `${number.toFixed(2)}`;
      };
      const formatPercent = (number) => {
        return `${(number*100).toFixed(2)}%`;
      };
    return (
        <div className={`row ${styles.row}`} >
            <div className="metrics-column" style={{ flex: 1 }}>
                <h3 className={`${isOverall ? 'subhead' : 'body'} ${styles.metricName} ${isOverall?styles.large:''}`} style={{ margin: 0, fontWeight: 'bold' }}>
                    {metric}
                </h3>
            </div>
            {type === 0 &&
            <div className={`column ${styles.valCol}`}>
                <h3 className={`body ${styles.metricValue}`} style={{ margin: 0 }}>{percent?formatPercent(data[col.replace("-usd","")]):formatNumber(data[col.replace("-usd","")])}</h3>
            </div>}
            <div className="column" style={{ flex: 1 }}>
                <Ranking score={data[col+"_SECT"]} large={isOverall} goodBad={goodBad}/>
            </div>
            <div className="column" style={{ flex: 1 }}>
                <Ranking score={data[type=== 0?col+"_OVER": col]} large={isOverall} goodBad={goodBad}/>
            </div>
        </div>
    );
}


export function RankingTable({ currentTab, options, data = [], t=0, header = "" }) {

    if (! data) return null;

    return (
        <div className="metrics-container" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Header Row */}
            <div className="row" style={{ display: 'flex', gap: '16px', flex: 1, marginBottom: '8px' }}>
                <div className="column" style={{ flex: 1, alignItems: 'flex-start', justifyContent: 'flex-end' }}>
                    <h2 className={`subtitle ${styles.header}`}>{header}</h2>
                </div>
                {t === 0 && <div style={{ flex: 1 }}></div>}
                <div  className={`column ${styles.col}`}>
                    <h3 className={`head ${styles.colName}`}>{data?.V?'Sector':'Category'}</h3>
                </div>
                <div  className={`column ${styles.col}`} >
                    <h3 className={`head ${styles.colName}`}>Overall</h3>
                </div>
            </div>
            {options[currentTab].map((v) => {
    if (data[v[1]]) {
        return (
            <Row
                key={v[1]} 
                metric={v[0]}
                col={v[1]}
                data={data}
                percent={v[3]}
                goodBad={!v[2]}
                isOverall={t=== 1 && v[0] === "Overall"}
                type={t}
            />
        );
    }
    return null; // Optionally return null if you want to render nothing when `data[v[1]]` is falsy
})}

            
        </div>
    );
}
