'use client';

import { Chart, RankingTable, Analysis, PieChart } from '../../../components/composition';
import { Button, Card, Loading } from '../../../components/primitive';
import React, { useEffect, useState } from 'react';
import { getCompetitors, getAssetData } from '../../../../services/firebase/db';
import { BuySellDialog } from '../../../components/dialogs';
import { useAuth } from '../../../../services/useAuth';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getFastData } from '../../../../services/firebase/api';
import { AssetTab, FullETF, FullStock, ProxyAsset } from '../../../../types';
import {  ETF_METRICS, Q_ETF, Q_STOCK, STOCK_METRICS, tabOptions } from '../../../../options';
import { ResponsiveTabs } from '@/components/primitive/TabGroup';

const fetchInfo = async (
  ticker: string,
  setData: React.Dispatch<React.SetStateAction<FullStock | FullETF | null>>,
  setFastData: React.Dispatch<React.SetStateAction<{price:number, change:number, range:string} | null>>,
  setCompetitors: React.Dispatch<React.SetStateAction<ProxyAsset[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  setLoading(true);

  const fastDataPromise = getFastData({ticker, onSuccess:setFastData});
  const dataPromise = getAssetData({ticker}).then(async (data) => {
    if (data) {
      setData(data);
      const competitors = await getCompetitors({ticker:data.ticker});
      setCompetitors(competitors);
    }
  });

  await Promise.all([fastDataPromise, dataPromise]);
  setLoading(false);
};

const Metrics: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<AssetTab>('Profile');
  const [stockInfo, setStockInfo] = useState<FullStock | FullETF | null>(null);
  const [fastInfo, setFastInfo] = useState<{price:number, change:number, range:string} | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [competitors, setCompetitors] = useState<ProxyAsset[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const params = useParams();
  const ticker = params.symbol as string;
  const { currentUser } = useAuth();

  useEffect(() => {
    if (ticker) {
      fetchInfo(ticker, setStockInfo, setFastInfo, setCompetitors, setLoading);
    }
  }, [ticker]);

  return (
    <div className="flex flex-col gap-6 sm:gap-12 min-h-screen p-4 sm:p-8 md:p-12 bg-light dark:bg-dark">
      <BuySellDialog isOpen={dialogOpen} ticker={ticker} onClose={() => setDialogOpen(false)} />

      <div className="flex flex-col gap-6 w-full bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg p-4 sm:p-8 md:p-12 shadow-sm">
        {/* Header */}
        <div className="flex flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl  sm:text-3xl md:text-5xl font-bold text-primary-light dark:text-primary-dark">
              {stockInfo?.name}{' '}
              <span className="text-sm sm:text-base md:text-xl text-secondary-light dark:text-secondary-dark ">({ticker})</span>
            </h1>

            <div className="flex items-center gap-3">
              <h2 className="text-lg sm:text-xl md:text-2xl font-medium flex items-baseline text-primary-light dark:text-primary-dark">
                ${fastInfo?.price?.toFixed(2)}
              </h2>
              <span
                className={`text-xs sm:text-sm px-2 py-0.5 rounded-full border ${
                  Number(fastInfo?.change) >= 0
                    ? 'border-good-light bg-good-light/20 text-good-light dark:border-good-dark dark:bg-good-dark/20 dark:text-good-dark'
                    : 'border-bad-light bg-bad-light/20 text-bad-light dark:border-bad-dark dark:bg-bad-dark/20 dark:text-bad-dark'

                }`}
              >
                {fastInfo?.change !== undefined ? `${(100 * fastInfo.change).toFixed(2)}%` : ''}
              </span>
            </div>
          </div>

          {!loading && (
            <Button
              label="Add / Remove"
              disabled={!currentUser}
              onClick={() => currentUser && setDialogOpen(true)}
              className="text-sm sm:text-base sm:px-2 sm:py-1 bg-primary-light text-light hover:bg-accent-light dark:bg-primary-dark dark:text-dark dark:hover:bg-accent-dark"
            />
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loading />
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:gap-8">
            <ResponsiveTabs<AssetTab>
              currentTab={currentTab}
              onSelect={setCurrentTab}
              options={tabOptions(stockInfo?.assetClass || 'Equity').filter(o => o !== 'Q-Scores')}
            />

            {stockInfo?.assetClass == 'Equity'?<RankingTable<FullStock>
              currentTab={currentTab}
              options={STOCK_METRICS}
              data={stockInfo as FullStock}
            />:<RankingTable<FullETF>
              currentTab={currentTab}
              options={ETF_METRICS}
              data={stockInfo as FullETF}
            />}

            {/* Profile Details */}
            {currentTab === 'Profile' && (
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col gap-2 flex-1">
                  {[
                    ['Sector', stockInfo?.sector],
                    ['52 Week Range', fastInfo?.range],
                    ...(stockInfo?.category ? [['Category', stockInfo?.category]] : [])
                  ].map(([label, value]) => (
                    <div key={label as string} className="flex items-center gap-2 sm:gap-6 w-full">
                      <div className="w-[80px] sm:w-[140px]">
                        <h3 className="font-bold truncate text-xs sm:text-sm md:text-base text-primary-light dark:text-primary-dark">
                          {label}
                        </h3>
                      </div>
                      <div className="w-fit">
                        <h3 className="text-xs sm:text-sm md:text-base ">
                          {value}
                        </h3>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            
              <div className="mt-6">
                <h2 className="text-lg sm:text-2xl font-semibold text-primary-light dark:text-primary-dark mb-2">Chart</h2>
                {ticker && <Chart symbol={ticker} height="420px" />}
              </div>

            {/* Q-Scores Table */}
            <div className="mt-8">
              {stockInfo?.assetClass=='Equity'?<RankingTable<FullStock>
                currentTab={'Q-Scores'}
                options={Q_STOCK}
                data={stockInfo as FullStock}
                t={1}
                header="Q-Scores"
              />:<RankingTable<FullETF>
                currentTab={'Q-Scores'}
                options={Q_ETF}
                data={stockInfo as FullETF}
                t={1}
                header="Q-Scores"
              />}
            </div>

            {/* Charts / Analysis */}
                {stockInfo?.assetClass =='Equity' && Number(stockInfo['numAn' as keyof typeof stockInfo]) > 0 && fastInfo?.price ? (
                  <Analysis
                    className="flex flex-1"
                    price={fastInfo?.price}
                    numAnalysts={Number(stockInfo['numAn' as keyof typeof stockInfo])}
                    rec={Number(stockInfo['anRec' as keyof typeof stockInfo])}
                    minTarget={Number(stockInfo['anMin' as keyof typeof stockInfo])}
                    meanTarget={Number(stockInfo['anAvg' as keyof typeof stockInfo])}
                    maxTarget={Number(stockInfo['anMax' as keyof typeof stockInfo])}
                  />
                ) : null}

          

            {stockInfo?.assetClass === 'ETF' &&
  ((stockInfo['plotHoldings' as keyof typeof stockInfo]) ||
   (stockInfo['plotSectors' as keyof typeof stockInfo])) ? (
  <div className="mt-8 w-full flex flex-col gap-8">
    <h2 className="text-lg sm:text-xl font-semibold text-primary-light dark:text-primary-dark">
      Fund Holdings Breakdown
    </h2>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {stockInfo['plotHoldings' as keyof typeof stockInfo] && (
        <div className="p-4 rounded-lg">
          <PieChart
            title="Top Holdings"
            data={stockInfo['plotHoldings' as keyof typeof stockInfo] as unknown as Record<string, number>}
          />
        </div>
      )}
      {stockInfo['plotSectors' as keyof typeof stockInfo] && (
        <div className="p-4 rounded-lg">
          <PieChart
            title="Top Sectors"
            data={stockInfo['plotSectors' as keyof typeof stockInfo] as unknown as Record<string, number>}
          />
        </div>
      )}
    </div>
  </div>
) : null}




            {/* Competitors */}
            <div className="mt-8 max-w-full">
              <h3 className="text-lg sm:text-2xl font-semibold text-primary-light dark:text-primary-dark">Top Competitors</h3>
              <div
                className="
                  grid gap-2 sm:gap-4 mt-4
                  grid-cols-1
                  sm:grid-cols-2
                  md:grid-cols-3
                  lg:grid-cols-4
                "
              >
                {competitors?.map((competitor, index) => (
                  <Link key={index} href={`/metrics/${competitor.ticker}/`}>
                    <Card
                      ticker={competitor.ticker}
                      name={competitor.name}
                      size={competitor.size}
                      assetClass={competitor.assetClass}
                      category=""
                      sector=""
                    />
                  </Link>
                ))}
              </div>


              <div className="w-full mt-4">
                <Link
                  className="text-sm flex justify-center sm:text-base btn bg-brand-light text-light hover:bg-brand-hover dark:bg-brand-dark dark:text-dark dark:hover:bg-brand-hover rounded-lg px-2 py-1 sm:px-4 sm:py-2"
                  href={{ pathname: '/compare', query: { t: [ticker, ...competitors.map((c) => c.ticker)] } }}
                >
                  Compare to Peers
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Metrics;
