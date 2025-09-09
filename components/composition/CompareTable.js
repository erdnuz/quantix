
import { Ranking } from '../primitive';
import styles from './rtable.module.css'


const formatNumber = (number) => {
    number = Number(number);
    if (number >= 1e12) return `${(number / 1e12).toFixed(1)}T`;
    if (number >= 1e9) return `${(number / 1e9).toFixed(1)}B`;
    if (number >= 1e6) return `${(number / 1e6).toFixed(1)}M`;
    if (number >= 1e3) return `${(number / 1e3).toFixed(1)}K`;
    return `${number.toFixed(2)}`;
  };
  const formatPercent = (number) => {
    return `${(Number(number)*100).toFixed(2)}%`;
  };

function Row({ metric, col, data, isOverall, goodBad=true, percent=false, type=0}) {
    
    return (
        <div className={`row ${styles.row}`}>
            <div className="metrics-column" style={{ flex: 1, minWidth: '60px'}}>
                <h3 className={`${isOverall ? 'subhead' : 'body'} ${styles.metricName} ${isOverall?styles.large:''}`}>
                    {metric}
                </h3>
            </div>
            <div className={`row ${styles.row}`} style={{flex:data.length}}>
            {(data.map((ticker)=>
            <div className="column" style={{ flex: 1 }}>
                <Ranking score={ticker[type===0?col+"_OVER":col]} large={isOverall} goodBad={goodBad} number={type==0?percent?formatPercent(ticker[col]):formatNumber(ticker[col]):null}/>
            </div>))}
            </ div>
        </div>
    );
}


export function CompareTable({ currentTab, options, data = [], style=0, header = "" }) {

    if (! data) return null;

    return (
        <div className="metrics-container" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Header Row */}
            <div className="row" style={{ display: 'flex', gap: '16px', flex: 1, marginBottom: '8px' }}>
                <div className="column" style={{ flex: 1, minWidth:'60px', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
                    <h2 className={`subtitle ${styles.q}`} >{header}</h2>
                </div>
                {data.map((ticker) => {
                    return (
                        
                        <div
                            className={`column ${styles.col}`}
                            style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}
                        >
                            <h3 className={`subhead ${styles.tick}`}>{ticker?.ticker}</h3>
                        </div>
                    );
                })}

                
            </div>
            {options[currentTab].map((v) => {
    if (data.some((t) => t?.[v[1]])) {
        
    
        return (
            <Row
                key={v[1]} 
                metric={v[0]}
                col={v[1]}
                data={data}

                goodBad={!v[2]}
                percent={v[3]}
                isOverall={style === 1 && v[0] === "Overall"}
                type={style}
            />
        );
    }
    return null;
})}

            
        </div>
    );
}
