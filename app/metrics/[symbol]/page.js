"use client"
import { Chart, RankingTable, Analysis, PieChart } from '../../../components/composition';
import { Button, TabGroup, Card, Loading } from '../../../components/primitive';
import React, { useEffect, useState } from 'react';
import { getFastData, getCompetitors, getAssetData } from '../../../services/firebase/db';
import { BuySellDialog } from '../../../components/dialogs';
import { useAuth } from '../../../services/useAuth';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import styles from './metrics.module.css'

// Simulated fetchInfo function
const fetchInfo = async (ticker, setData, setFastData, setCompetitors, setLoading) => {
    setLoading(true);
  
    const fastDataPromise = getFastData(ticker).then(setFastData);
    const dataPromise = getAssetData(ticker).then(async (data) => {
      setData(data);
      const competitors = await getCompetitors(data);
      setCompetitors(competitors);
    });
    await Promise.all([fastDataPromise, dataPromise]);
  
    setLoading(false);
  };
  





const Metrics = () => {
    const [currentTab, setCurrentTab] = useState(0);
    const [stockInfo, setStockInfo] = useState({});
    const [fastInfo, setFastInfo] = useState({});
    const [loading, setLoading] = useState({})
    const [competitors, setCompetitors] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);

    const params = useParams(); // Unwrap the Promise
    const ticker = params.symbol;

    const tabOptions = stockInfo?.V
        ? ['Profile', 'Growth', 'Performance', 'Risk', 'Valuation', 'Profitability', 'Leverage'] : ['Profile', 'Growth', 'Performance', 'Risk']
    
    const {currentUser} = useAuth()

    useEffect(() => {
        if (ticker) {
            fetchInfo(ticker, setStockInfo, setFastInfo, setCompetitors, setLoading);
        }
    }, [ticker]); //

    return (
        <div>      
    
            <BuySellDialog isOpen={dialogOpen} ticker={ticker} onClose={()=>setDialogOpen(false)}/>             
            <div className={styles.container}>
                <div className={styles.headRow} >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-start', justifyContent:'flex-end', textAlign: 'left'}}>
                        <h1 className="title" style={{ margin: '0 0 8px' }}>
                            {stockInfo?.name} <span style={{ color: 'var(--sds-color-text-default-secondary)', fontSize: '0.6em' }}>({ticker})</span>
                        </h1>
                        <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', justifyContent:'flex-end', alignItems:'center' }}>
                            {/* Price and Currency */}
                            <h2
                                className="subtitle"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'baseline',
                                    margin: '0px'
                                }}
                            >
                                {fastInfo?.price?.toFixed(2)}
                                <sub style={{ marginLeft: '4px', fontSize: '0.6em', color: 'var(--sds-color-text-default-secondary)' }}>
                                    {stockInfo?.currency}
                                </sub>
                            </h2>
                            <h2
                                className="subhead"
                                style={{
                                    color: fastInfo?.change >= 0 ? '#089981' : '#f23645',
                                    margin: '0',
                                    display: 'inline-block',
                                    height:'fit-content',
                                    padding: '0px 8px',
                                    border: `1px solid ${fastInfo?.change >= 0 ? '#089981' : '#f23645'}`,
                                    borderRadius: '12px',
                                    textAlign: 'center',
                                    lineHeight: '1.5',
                                    marginBottom:'4px',
                                    backgroundColor: fastInfo?.change >= 0 ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
                                }}
                            >
                                {fastInfo?.change !== undefined ? `${(100*fastInfo.change).toFixed(2)}%` : ''}
                            </h2>
                        </div>
                    </div>
                    {!loading &&
                    <div style={{ width: 'fit-content' }}>
                        <Button label="Add / Remove" disabled={currentUser === null} onClick={currentUser ? ()=>setDialogOpen(true): () => {}}/>
                    </div>}
                </div>

                {loading?<Loading />:
                <div className={styles.content}>
                    <TabGroup
                        currentTab={currentTab}
                        onSelect={setCurrentTab}
                        options={tabOptions}
                    />
                
                


                    <RankingTable currentTab={currentTab} options = {METRICS} data={stockInfo}/>
                    {currentTab === 0 ?

                        (<div style={{display:'flex'}}>
                        <div style={{ marginTop: '16px', flexDirection:'column', display: 'flex', flex: 1, gap: '8px'}}>
                            <div style={{display:'flex'}}>
                            <div style={{ flex: 1 }}>
                                <h3 className='body' style={{ margin: 0, fontWeight:'bold' }}>
                                    Region
                                </h3>
                            </div>
                            <div className="column" style={{ flex: 1 }}>
                                <h3 className="body" style={{ margin: 0 }}>{stockInfo?.region}</h3>
                            </div>
                            </div>
                            
                            <div style={{display:'flex'}}>
                            <div style={{ flex: 1 }}>
                                <h3 className='body' style={{ margin: 0, fontWeight:'bold' }}>
                                    {stockInfo?.sector ?  "Sector": "Category"}
                                </h3>
                            </div>
                            <div className="column" style={{ flex: 1 }}>
                                <h3 className="body" style={{ margin: 0 }}>{stockInfo?.sector || stockInfo?.category }</h3>
                            </div>
                            </div>
                            
                            <div style={{display:'flex'}}>
                            <div style={{ flex: 1 }}>
                                <h3 className='body' style={{ margin: 0, fontWeight:'bold' }}>
                                    52 Week Range
                                </h3>
                            </div>
                            <div className="column" style={{ flex: 1 }}>
                                <h3 className="body" style={{ margin: 0 }}>{fastInfo?.range || "NaN"} {stockInfo?.currency}</h3>
                            </div>
                            </div>

                            <div style={{display:'flex'}}>
                            <div style={{ flex: 1 }}>
                                <h3 className='body' style={{ margin: 0, fontWeight:'bold' }}>
                                    Exchange
                                </h3>
                            </div>
                            <div className="column" style={{ flex: 1 }}>
                                <h3 className="body" style={{ margin: 0 }}>{stockInfo?.exchange || "NaN"}</h3>
                            </div>
                            </div>
                            {stockInfo?.category?
                            <div style={{display:'flex'}}>
                            <div style={{ flex: 1 }}>
                                <h3 className='body' style={{ margin: 0, fontWeight:'bold' }}>
                                    Category
                                </h3>
                            </div>
                            <div className="column" style={{ flex: 1 }}>
                                <h3 className="body" style={{ margin: 0 }}>{stockInfo?.category || "NaN"}</h3>
                            </div>
                            </div>:null}

                            {stockInfo?.family?
                            <div style={{display:'flex'}}>
                            <div style={{ flex: 1 }}>
                                <h3 className='body' style={{ margin: 0, fontWeight:'bold' }}>
                                    Family
                                </h3>
                            </div>
                            <div className="column" style={{ flex: 1 }}>
                                <h3 className="body" style={{ margin: 0 }}>{stockInfo?.family || "NaN"}</h3>
                            </div>
                            </div>:null}
                        </div>
                        {stockInfo?.['num-an']?
                            <Analysis className={styles.analysis1} price={fastInfo?.price} numAnalysts={stockInfo?.['num-an']} rec={stockInfo?.['an-rec']} minTarget={stockInfo?.['an-min']} meanTarget={stockInfo?.['an-avg']} maxTarget={stockInfo?.['an-max']} />
                        :<div style={{display:'flex', flex:1}}></div>}
                        {stockInfo?.['plot-holdings']?
                        <PieChart title="Top Holdings" data={stockInfo?.['plot-holdings']}/>:null}
                        {stockInfo?.['plot-sectors']?
                        <PieChart title="Top Sectors" data={stockInfo?.['plot-sectors']}/>:null}
                    </div>):null}
                    {stockInfo.type!==2?
                    <div style={{marginTop:'16px'}}>
                        <h2 className="subtitle">Chart</h2>
                        {/* Render Chart only if exchange and ticker are available */}
                        {ticker && stockInfo?.exchange && (
                            <Chart
                                symbol={ticker.split(".").length > 1 ? `${EXCHANGE_MAP[stockInfo.exchange] || stockInfo.exchange}:${ticker.split(".")[0].replace("-", "_")}`: ticker}
                                height="420px"
                            />
                        )}
                    </div>:null}


                    <div style={{marginTop:'32px'}}>

                        <RankingTable currentTab ={0} options={Q} data={stockInfo} t={1} header="Q-Scores" />
                    </div>
                    {stockInfo?.['num-an']&&
                            <Analysis className={styles.analysis2} price={fastInfo?.price} numAnalysts={stockInfo?.['num-an']} rec={stockInfo?.['an-rec']} minTarget={stockInfo?.['an-min']} meanTarget={stockInfo?.['an-avg']} maxTarget={stockInfo?.['an-max']} />
                        }
                    <div style={{marginTop:'32px'}}>
                        <h3 className="subtitle">Top Competitors</h3>
                        
                        <div className={styles.comps}>
                            {competitors?.map((competitor, index) => (
                                <Link key={index}  href={`/metrics/${competitor.ticker}/`}>
                                <Card 
                                    ticker={competitor.ticker} 
                                    name={competitor.name} 
                                    marketCap={competitor.cap}
                                />
                                </Link>
                                
                            ))}
                        </div>
                        <div style={{minWidth: 'fit-content', width: '30%', marginTop:'16px'}}>
                        <Link className="btn brand" href={{pathname:'/compare', query: {t:[ticker, ...competitors.map(c => c.ticker)]}}} >
                            Compare to Peers
                        </Link>
                        
                        </div>
                    </div>
                </div>}
            </div>
        </div>
    );
}

export default Metrics;

const Q = 
[[ //Q-Score
    ['Overall', 'OVERALL'],
    ['Growth', 'G'],
    ['Risk', 'R'],
    ['Performance', 'PE'],
    ['Valuation', 'V'],
    ['Profitability', 'PR'],
    ['Leverage', 'L'],
]]

const METRICS =[
    [ // Profile
        ['Market Corr.', 'market-corr', true, true],
        ['Market Cap', 'market-cap-usd', true],
        ['Net Assets', 'assets-usd', true],
        ['Div. Yield', 'yield', true, true],
        ['Expense Ratio', 'expenses', false, true],
        ['Turnover Ratio', 'turnover', true, true],
        ['Volume', 'volume',true]
    ], 
    [ //Growth
        ['5y CAGR', 'cagr', false, true],
        ['3y CAGR', '3y', false, true],
        ['1y Return', 'yoy', false, true],
        ['6mo CAGR', '6mo', false, true],

        ['Div. Growth', 'div-g', false, true],
    ],
    [ //Performance
        ['Alpha', 'alpha', false, true],
        ['Sharpe', 'sharpe', false, true],
        ['Sortino', 'sortino', false, true],
        ['M-Squared', 'm-squared', false, true],
        ['Omega', 'omega', false, false],
        ['Calmar', 'calmar', false, false],
        ['Martin', 'martin', false, false],
    ],
    [ //Risk
        ['Beta', 'beta', true, false],
        ['Deviation', 'std-dev', false, true],
        ['Max. DD', 'max-d', false, true],
        ['Avg. DD', 'avg-d', false, true],
        ['VaR 1%', 'var1', false, true],
        ['VaR 5%', 'var5', false, true],
        ['VaR 10%', 'var10', false, true],
    ], //Valuation
    [
        ['WACC', 'wacc', false, true],
        ['Price to Earnings', 'p-earnings', false, false],
        ['Price to Book', 'p-book', false, false],
        ['Price to Sales', 'p-sales', false, false],
        ['PE to Growth', 'peg', false, false],
    ], //Profitbility
    [
        ['Profit Margin', 'profit-m', false, true],
        ['ROE', 'roe', false, true],
        ['ROA', 'roa', false, true],
        ['Earnings Growth', 'earnings-g', false, true],
        ['Revenue Growth', 'revenue-g', false, true],
    ], //Leverage
    [
        ['Debt to Equity', 'debt-e', false, false],
        ['Debt to Assets', 'debt-a', false, false],
        ['Debt to EBITDA', 'debt-ebit', false, false],
        ['Current Ratio', 'assets-l', false, false],
        ['Altman Z-Score', 'altman-z', false, false],
    ],
]

const EXCHANGE_MAP = {
    "JKT":"IDX",
    "TAI":"TWSE",
    "PAR":"EURONEXT",
    "JPX":"TSE",
    "SAU":"TADAWUL",
    "CPH":"OMXCOP",
    "NSI":"NSE",
    "IOB":"LSIN",
    "GER":"XETR",
    "ATH":"ATHEX",
    "MCE":"BME",
    "STO":"OMXSTO",
    "ISE":"EURONEXT",
    "WSE":"GPW",
    "LIS":"EURONEXT",
    "ICE":"OMXICE",
    "AMS":"EURONEXT",
    "KOE":"KRX",
    "KSC":"KRX",
    "TWO":"TPEX",
    "HEL":"OMXHEX",
    "TLV":"TASE",
    "SES":"SGX",
    "HKG":"HKEX",
    "TOR":"TSX"
}
