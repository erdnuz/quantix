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
import { AssetTab, FullETF, FullStock } from '../../../types';
import { getCompareData } from '../../../services/firebase/api';
import { METRICS, Q, tabOptions } from '../../../options';

const Compare: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<AssetTab>('Profile');
  const [tickers, setTickers] = useState<FullStock[] | FullETF[]>([]);
  const [corr, setCorr] = useState<Record<string, Record<string, number>>>({});
  const [chartData, setChartData] = useState<Record<string, { time: string; value: number }[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [prices, setPrices] = useState<Record<string, number>>({});

  const searchParams = useSearchParams();
  const t = searchParams.getAll('t');
  const initial = t ? (Array.isArray(t) ? t : [t]) : null;

  const addTicker = async (
    ticker: string,
    setData: React.Dispatch<React.SetStateAction<FullStock[] | FullETF[]>>
  ) => {
    const d = await getAssetData({ ticker });
    if (!d) return;

    setData((prev) => {
      if (d.assetClass === 'Equity') {
        return [...(prev as FullStock[]), d as FullStock];
      } else {
        return [...(prev as FullETF[]), d as FullETF];
      }
    });
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
    <div className="flex flex-col gap-16 bg-surface-light min-h-screen">
      <Hero 
        title="Compare Assets" 
        subtitle="Compare the Best Stocks, ETFs, and Mutual Funds" 
      />

      <div className="flex flex-col gap-6 w-full p-6 sm:p-12">
        <div className="flex flex-wrap justify-center gap-6">
          {tickers.map((competitor, index) => (
            <Link key={index} href={`/metrics/${competitor.ticker}/`}>
              <Card
                ticker={competitor.ticker}
                name={competitor.name}
                size={competitor.size}
                assetClass={competitor.assetClass}
                category={competitor.category}
                sector=""
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
            label="Add Asset" 
            onClick={handleClick} 
          />}
        </div>
      </div>

      {tickers.length > 1 ? (
        loading ? (
          <div className="flex justify-center mt-12">
            <Loading />
          </div>
        ) : (
          <div className="flex flex-col gap-8 p-12 sm:p-24">
            <TabGroup<AssetTab>
              currentTab={currentTab}
              onSelect={setCurrentTab}
              options={tabOptions(tickers[0].assetClass).filter(o => o !== 'Q-Scores')}
            />

            <CompareTable 
              currentTab={currentTab} 
              options={METRICS(tickers[0].assetClass)} 
              data={tickers} 
            />

            <div className="mt-6">
              <h1 className="text-2xl font-semibold text-primary-light mb-3">Chart</h1>
              <CompareChart 
                lines={chartData} 
                loaded={Object.keys(chartData).length > 0} 
              />
            </div>

            <CompareTable 
              currentTab={'Q-Scores'} 
              options={Q} 
              data={tickers} 
              style={1} 
              header="Q-Scores" 
            />

            {tickers.some((ticker) => ticker.assetClass === 'Equity' && (ticker as any)?.numAn > 0) && (
              <AnalysisCompare 
                tickers={tickers} 
                prices={prices} 
              />
            )}

            <div className="mt-6">
              <h1 className="text-2xl font-semibold text-primary-light mb-3">Correlation</h1>
              <CorrelationTable 
                data={corr} 
              />
            </div>
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center mt-12 text-center text-secondary-light">
          <h1 className="text-3xl font-bold mb-2">Nothing to show...</h1>
          <h2 className="text-xl">Add at least 2 assets to start comparing</h2>
        </div>
      )}
    </div>
  );
};

export default Compare;
