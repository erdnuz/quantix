"use client"
import { CompareTable, Hero, CompareChart, CorrelationTable, AnalysisCompare } from '../../components/composition';
import { Button, TabGroup, Card, Search, Loading } from '../../components/primitive';
import React, { useEffect, useState } from 'react';
import { getAssetData, getStockIdsAndNames, getCompareData } from '../../services/firebase/db';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import styles from './compare.module.css'
// Simulated fetchInfo function
const addTicker = async (ticker, setData) => {   
    const d = await getAssetData(ticker);
    if (d) {
        setData((prev) => {
           return [...prev, d]
        })
    }
};

const addTickers = async (tickers, setData) => {  
    const data = []
    for (const t of tickers) {
        const d = await getAssetData(t)
        data.push(d)
    }

    if (data.length>1) {
        setData(data)
    }
};

const Q = 
[[ //Q-Score
    ['Overall', 'OVERALL'],
    ['Growth', 'G'],
    ['Risk', 'R'],
    ['Perf.', 'PE'],
    ['Val.', 'V'],
    ['Prof.', 'PR'],
    ['Lev.', 'L'],
]]

const METRICS =[
    [ // Profile
        ['Market Corr.', 'market-corr', true, true],
        ['Market Cap', 'market-cap-usd', true],
        ['Net Assets', 'assets-usd', true],
        ['Div. Yield', 'yield', true, true],
        ['Expense Ratio', 'expenses', false, true],
        ['Turnover Ratio', 'turnover', true, true],
        ['Holding Div.','holding-diversity', true, true],
        ['Sector Div.', 'sector-diversity', true, true],
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



const Compare = () => {
    const [currentTab, setCurrentTab] = useState(0);
    const [tickers, setTickers] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [corr, setCorr] = useState([]);
    const [chartData, setChartData] = useState({});
    const [loading, setLoading] = useState(true);
    const [prices, setPrices] = useState({});

    

    function handleClick(ticker) {
        if (tickers.length > 4) {
            alert("You may only compare 5 assets at once.")
        } else {
            if (tickers.map((t) => t.ticker).includes(ticker)) {
                return null;
            }
            addTicker(ticker, setTickers);
            
        }
    }
    
    const t = useSearchParams().getAll('t');
    console.log(t);
    const initial = t? Array.isArray(t) ? t : [t]: null;

    const tabOptions = tickers?.[0]?.V
        ? ['Profile', 'Growth', 'Perf.', 'Risk', 'Val.', 'Prof.', 'Lev.'] : ['Profile', 'Growth', 'Performance', 'Risk']
    
    useEffect(() => {
        if (initial && tickers.length === 0) { 
            addTickers(initial, setTickers)
            
        }
    }, [initial]);

    useEffect(()=>{
        getStockIdsAndNames().then(
          (data) => setSuggestions(data)
        )
      }, [])

    useEffect(()=>{
        if (tickers) {
            setLoading(true);
            getCompareData(tickers.map((t)=>t.ticker)).then((data)=>{
                if (data) {
                    
                    const dataList = Object.keys(data.plot).reduce((acc, ticker) => {
                        acc[ticker] = Object.entries(data.plot[ticker]).map(([time, value]) => ({
                          time: time,
                          value: value
                        }));
                        return acc;
                      }, {});
                      
                    setChartData(dataList);
                    setCorr(data.corr)
                    setPrices(data.prices)
                    
                    setLoading(false);
                
                }
                
            })
        }
        
    }, [tickers])



    return (
        <div>       
            <Hero title="Compare Assets" subtitle='Compare the Best Stocks, ETFs, and Mutual Funds' />                 
            <div className='container' style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignContent: 'left' }}>
            
                <div>
                    <div className={styles.tagGroup} >
                        {tickers?.map((competitor, index) => (
                            <Link className={styles.tag} href={`/metrics/${competitor.ticker}/`}>
                            
                            {competitor.ticker} 
                            
                            </Link>
                            
                        ))}
                        {tickers?.map((competitor, index) => (
                            <Link className={styles.card} href={`/metrics/${competitor.ticker}/`}>
                            
                            <Card 
                                key={index} 
                                ticker={competitor.ticker} 
                                name={competitor.name} 
                                sector={competitor.category||competitor.sector}
                                marketCap={competitor['market-cap-usd'] || competitor['assets-usd']}
                                currency={competitor.currency}
                            />
                            </Link>
                            
                        ))}
                    </div>
                    <div className={styles.add} >
                    <div style={{width:'fit-content'}}>
                    <Button 
                        label="Clear Selection" 
                        type="secondary"
                        onClick={() => {
                            initial = [];
                            setTickers([]);
                        }} 
                    />
                    </div>
                    <div style={{width:'fit-content'}}>
                    <Search 
                        label="Add Asset" 
                        suggestions={suggestions}
                        onClick = {
                            handleClick
                        }
                    />
                    </div>
                    </div>
                </div>

                {tickers?.length > 1 ?

                loading?<Loading />:
                <div style={{display:'flex', gap:'16px', flexDirection:"column"}}>
                    <TabGroup
                        currentTab={currentTab}
                        onSelect={setCurrentTab}
                        options={tabOptions}
                    />

                    <CompareTable currentTab={currentTab} options={METRICS} data={tickers}/>
                    
                    <div style={{marginTop:'16px'}}>
                        <h1 className="head">Chart</h1>
                        {/* Render Chart only if exchange and ticker are available */}
                        {tickers && <CompareChart lines={chartData} loaded={Object.keys(chartData).length}/>}
                               
                    </div>
                    <CompareTable currentTab ={0} options={Q} data={tickers} style={1} header="Q" />
                    {tickers?.some((ticker)=> ticker?.['num-an'] > 0)?
                    <AnalysisCompare tickers={tickers} prices={prices}/>:null}
                    <div style={{marginTop:'16px'}}>
                    <h1 className="head" style={{margin: 0}}>Correlation</h1>
                    <CorrelationTable data={corr} /> 
                    </div>         
                </div> : 
                <div style={{ 
                    display: 'flex', 
                    marginTop: '32px', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    alignItems: 'center', // Full viewport height for proper vertical centering
                    textAlign: 'center' // Ensures text is centered horizontally inside the container
                }}>
                    <h1 className="head">Nothing to show...</h1>
                    <h2 className="subhead">Add at least 2 assets to start comparing</h2>
                </div>
                }
                
            </div> 
        </div>
    );
}

export default Compare;
