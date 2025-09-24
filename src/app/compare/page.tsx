'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {  useSearchParams } from 'next/navigation';
import {
  CompareTable,
  Hero,
  CompareChart,
  CorrelationTable,
  AnalysisCompare
} from '../../components/composition';
import { Button, Card, Search, Loading } from '../../components/primitive';
import { getAssetData } from '../../../services/firebase/db';
import { AssetTab, FullETF, FullStock, ProxyAsset } from '../../../types';
import { getCompareData } from '../../../services/firebase/api';
import {  ETF_METRICS, Q_ETF, Q_STOCK, STOCK_METRICS, tabOptions } from '../../../options';
import { ResponsiveTabs } from '@/components/primitive/TabGroup';

const Compare: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<AssetTab>('Profile');
  const [tickers, setTickers] = useState<(FullStock | FullETF)[]>([]);
  const [corr, setCorr] = useState<Record<string, Record<string, number>>>({});
  const [chartData, setChartData] = useState<Record<string, { time: string; value: number }[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [prices, setPrices] = useState<Record<string, number>>({});

  const searchParams = useSearchParams();

  useEffect(() => {
    const t = searchParams.getAll('t');
    if (t.length && tickers.length === 0) {
      addTickers(t, setTickers);
    }
  }, [searchParams]);

  useEffect(() => {
    if (tickers.length === 0) {
      // Clear the query string without reloading
      const url = new URL(window.location.href);
      url.searchParams.delete('t');
      window.history.replaceState(null, '', url.toString());
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.delete('t'); // clear existing tickers
    tickers.forEach((t) => url.searchParams.append('t', t.ticker));

    window.history.replaceState(null, '', url.toString());
  }, [tickers]);


  const addTicker = async (
    ticker: string,
    setData: React.Dispatch<React.SetStateAction<(FullStock | FullETF)[]>>
  ) => {
    const d = await getAssetData({ ticker });
    if (!d) return;
    if(tickers[0]&&tickers[0].assetClass != d.assetClass) return;
  
    setData((prev) => [...prev, d as FullStock | FullETF]);
  };

  


  const addTickers = async (tickers: string[], setData: React.Dispatch<React.SetStateAction<(FullStock | FullETF)[]>>) => {
    const data: (FullStock | FullETF)[] = [];
    for (const t of tickers) {
      const d = await getAssetData({ticker:t});
      if (d) data.push(d as FullStock | FullETF);
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
    if (tickers.length > 0) {
      setLoading(true);
      getCompareData({tickers:tickers.map((t) => t.ticker)}).then((data) => {
        if (data) {
          const dataList: Record<string, { time: string; value: number }[]> = Object.keys(data.plot).reduce(
            (acc: Record<string, { time: string; value: number }[]>, ticker) => {
              acc[ticker] = Object.entries(data.plot[ticker]).map(([time, value]) => ({
                time,
                value: Number(value),
              }));
              return acc;
            },
            {}
          );


          setChartData(dataList);
          setCorr(data.corr);
          setPrices(data.prices);
          setLoading(false);
        }
      });
    }
  }, [tickers]);

  return (
    <div className="flex flex-col min-h-screen">
      <Hero 
        title="Compare Assets" 
        subtitle="Compare the Best Stocks, ETFs, and Mutual Funds" 
      />

      <div className="flex flex-col gap-6 w-full p-6">
        <div
          className="
            grid gap-4 sm:gap-6 mt-4
            grid-cols-1
            sm:grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
            xl:grid-cols-5
            justify-items-center
          "
        >
          {tickers.map((competitor, index) => (
            <Link key={index} href={`/metrics/${competitor.ticker}/`} className="w-full">
              <Card
                ticker={competitor.ticker}
                name={competitor.name}
                size={competitor.size}
                assetClass={competitor.assetClass}
                category={competitor.category}
                sector={competitor.sector}
              />
            </Link>
          ))}
        </div>


        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-4 justify-center items-center w-full">
          <Button 
            label="Clear Selection" 
            type="secondary" 
            onClick={() => setTickers([])} 
            className="bg-primary-light text-light hover:bg-accent-light"
          />
          {tickers.length <5 &&<Search 
            filter= {(asset : ProxyAsset)=>{
              
              if (tickers?.[0]) {
                console.log(asset.assetClass, tickers[0].assetClass)
                return asset.assetClass == tickers[0].assetClass && !tickers.some((t)=>t.ticker==asset.ticker)
              }
              return true
            }}
            label="Add Asset" 
            onClick={handleClick} 
          />}
        </div>
      </div>

      {tickers.length > 1 ? (
        loading ? (
          <div className="flex justify-center mt-2 sm:mt-6">
            <Loading />
          </div>
        ) : (
          <div className="flex flex-col gap-4 p-6 sm:gap-8 sm:p-12">


            <ResponsiveTabs<AssetTab>
              currentTab={currentTab}
              onSelect={setCurrentTab}
              options={tabOptions(tickers[0].assetClass).filter(o => o !== 'Q-Scores')}
            />

            {tickers[0].assetClass=='Equity'?<CompareTable<FullStock>
              currentTab={currentTab} 
              options={STOCK_METRICS} 
              data={tickers as FullStock[]} 
            />:<CompareTable<FullETF>
              currentTab={currentTab} 
              options={ETF_METRICS} 
              data={tickers  as FullETF[]} 
            />}

            <div className="mt-6">
              <h1 className="text-lg sm:text-2xl font-semibold mb-3">Chart</h1>
              <CompareChart 
                lines={chartData} 
              />
            </div>

            {tickers[0].assetClass=='Equity'?<CompareTable<FullStock>
              currentTab={'Q-Scores'} 
              options={Q_STOCK} 
              data={tickers as FullStock[]} 
              style={1} 
              header="Q-Scores" 
            />:<CompareTable<FullETF>
              currentTab={'Q-Scores'} 
              options={Q_ETF} 
              data={tickers as FullETF[]} 
              style={1} 
              header="Q-Scores" 
            />}

            {tickers.some((ticker) => ticker.assetClass === 'Equity' && (ticker as FullStock)?.numAn > 0) && (
              <AnalysisCompare 
                tickers={tickers} 
                prices={prices} 
              />
            )}

            <div className="mt-6">
              <h1 className="text-lg sm:text-2xl font-semibold mb-3">Correlation</h1>
              <CorrelationTable 
                data={corr} 
              />
            </div>
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h1 className="text-xl sm:text-3xl font-bold mb-2">Nothing to show...</h1>
          <h2 className="text-base sm:text-xl">Add at least 2 assets to start comparing</h2>
        </div>
      )}
    </div>
  );
};

export default Compare;
