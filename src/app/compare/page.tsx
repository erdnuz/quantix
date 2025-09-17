'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CompareTable,
  Hero,
  CompareChart,
  CorrelationTable,
  AnalysisCompare
} from '../../components/composition';
import { Button, TabGroup, Card, Search, Loading } from '../../components/primitive';
import { getAssetData } from '../../../services/firebase/db';
import { FullETF, FullStock } from '../../../types';
import { getCompareData } from '../../../services/firebase/api';



export const Q : [string, string, boolean, boolean][][]= [
  [
    ['Overall', 'OVERALL', false, false],
    ['Growth', 'G', false, false],
    ['Risk', 'R', false, false],
    ['Perf.', 'PE', false, false],
    ['Val.', 'V', false, false],
    ['Prof.', 'PR', false, false],
    ['Lev.', 'L', false, false]
  ]
];

export const METRICS : [string, string, boolean, boolean][][]=[ [ // Profile 
['Market Corr.', 'market-corr', true, true], 
['Market Cap', 'market-cap-usd', true, false], 
['Net Assets', 'assets-usd', true, false], 
['Div. Yield', 'yield', true, true], 
['Expense Ratio', 'expenses', false, true], 
['Turnover Ratio', 'turnover', true, true], 
['Holding Div.','holding-diversity', true, true], 
['Sector Div.', 'sector-diversity', true, true], 
['Volume', 'volume',true, false] ], 
[ //Growth 
['5y CAGR', 'cagr', false, true], 
['3y CAGR', '3y', false, true], 
['1y Return', 'yoy', false, true], 
['6mo CAGR', '6mo', false, true], 
['Div. Growth', 'div-g', false, true], ], 
[ //Performance 
['Alpha', 'alpha', false, true], 
['Sharpe', 'sharpe', false, true], 
['Sortino', 'sortino', false, true], 
['M-Squared', 'm-squared', false, true], 
['Omega', 'omega', false, false], 
['Calmar', 'calmar', false, false], 
['Martin', 'martin', false, false], ], 
[ //Risk 
['Beta', 'beta', true, false], 
['Deviation', 'std-dev', false, true], 
['Max. DD', 'max-d', false, true], 
['Avg. DD', 'avg-d', false, true], 
['VaR 1%', 'var1', false, true], 
['VaR 5%', 'var5', false, true], 
['VaR 10%', 'var10', false, true], ], 
//Valuation 
[ ['WACC', 'wacc', false, true], 
['Price to Earnings', 'p-earnings', false, false], 
['Price to Book', 'p-book', false, false], 
['Price to Sales', 'p-sales', false, false], 
['PE to Growth', 'peg', false, false], ], 
//Profitbility 
[ ['Profit Margin', 'profit-m', false, true], 
['ROE', 'roe', false, true], 
['ROA', 'roa', false, true], 
['Earnings Growth', 'earnings-g', false, true], 
['Revenue Growth', 'revenue-g', false, true], ], 
//Leverage 
[ ['Debt to Equity', 'debt-e', false, false], 
['Debt to Assets', 'debt-a', false, false], 
['Debt to EBITDA', 'debt-ebit', false, false], 
['Current Ratio', 'assets-l', false, false], 
['Altman Z-Score', 'altman-z', false, false], ], ]

const Compare: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [tickers, setTickers] = useState<FullStock[] | FullETF[]>([]);
  const [corr, setCorr] = useState<Record<string, Record<string, number>>>({});

  const [chartData, setChartData] = useState<Record<string, { time: string; value: number }[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [prices, setPrices] = useState<Record<string, number>>({});

  const searchParams = useSearchParams();
  const t = searchParams.getAll('t');
  const initial = t ? (Array.isArray(t) ? t : [t]) : null;

  const tabOptions = tickers?.[0]?.assetClass == "Equity"
    ? ['Profile', 'Growth', 'Perf.', 'Risk', 'Val.', 'Prof.', 'Lev.']
    : ['Profile', 'Growth', 'Performance', 'Risk'];

  const addTicker = async (ticker: string, setData: React.Dispatch<React.SetStateAction<FullStock[] | FullETF[]>>) => {
    const d = await getAssetData({ticker});
    if (d) setData((prev) => [...prev, d]);
  };

  const addTickers = async (tickers: string[], setData: React.Dispatch<React.SetStateAction<FullStock[] | FullETF[]>>) => {
    const data: FullStock[] | FullETF[] = [];
    for (const t of tickers) {
      const d = await getAssetData({ticker:t});
      if (d) data.push(d as any);
    }
    if (data.length > 1) setData(data);
  };

  const handleClick = (ticker: string) => {
    if (tickers.length > 4) {
      alert('You may only compare 5 assets at once.');
      return;
    }
    if (tickers.map((t) => t.ticker).includes(ticker)) return;
    addTicker(ticker, setTickers);
  };

  useEffect(() => {
    if (initial && tickers.length === 0) addTickers(initial, setTickers);
  }, [initial]);


  useEffect(() => {
    if (tickers.length > 0) {
      setLoading(true);
      getCompareData({tickers:tickers.map((t) => t.ticker)}).then((data) => {
        if (data) {
          const dataList = Object.keys(data.plot).reduce((acc: any, ticker) => {
            acc[ticker] = Object.entries(data.plot[ticker]).map(([time, value]) => ({ time, value }));
            return acc;
          }, {});
          setChartData(dataList);
          setCorr(data.corr);
          setPrices(data.prices);
          setLoading(false);
        }
      });
    }
  }, [tickers]);

  return (
    <div className="flex flex-col gap-16">
      <Hero title="Compare Assets" subtitle="Compare the Best Stocks, ETFs, and Mutual Funds" />

      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-wrap justify-center gap-4">
          
          {tickers.map((competitor, index) => (
                  <Link key={index} href={`/metrics/${competitor.ticker}/`}>
                    <Card ticker={competitor.ticker} name={competitor.name} size={competitor.size} assetClass={competitor.assetClass} category={competitor.category} />
                  </Link>
                ))}
         
        </div>

        <div className="flex flex-col sm:flex-row gap-6 mt-4 justify-center items-center w-full">
          <Button label="Clear Selection" type="secondary" onClick={() => setTickers([])} />
          <Search label="Add Asset" onClick={handleClick} />
        </div>
      </div>

      {tickers.length > 1 ? (
        loading ? (
          <Loading />
        ) : (
          <div className="flex flex-col gap-4">
            <TabGroup currentTab={currentTab} onSelect={setCurrentTab} options={tabOptions} />

            <CompareTable currentTab={currentTab} options={METRICS} data={tickers} />

            <div className="mt-4">
              <h1 className="text-2xl font-semibold mb-2">Chart</h1>
              <CompareChart lines={chartData} loaded={Object.keys(chartData).length > 0} />
            </div>

            <CompareTable currentTab={0} options={Q} data={tickers} style={1} header="Q" />

            {tickers.some((ticker) => ticker.assetClass == 'Equity' && (ticker as any)?.numAn > 0) && <AnalysisCompare tickers={tickers} prices={prices} />}

            <div className="mt-4">
              <h1 className="text-2xl font-semibold mb-2">Correlation</h1>
              <CorrelationTable data={corr} />
            </div>
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center mt-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Nothing to show...</h1>
          <h2 className="text-xl text-gray-500">Add at least 2 assets to start comparing</h2>
        </div>
      )}
    </div>
  );
};

export default Compare;
