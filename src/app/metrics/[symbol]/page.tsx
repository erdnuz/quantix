'use client';

import { Chart, RankingTable, Analysis, PieChart } from '../../../components/composition';
import { Button, TabGroup, Card, Loading } from '../../../components/primitive';
import React, { useEffect, useState } from 'react';
import { getCompetitors, getAssetData } from '../../../../services/firebase/db';
import { BuySellDialog } from '../../../components/dialogs';
import { useAuth } from '../../../../services/useAuth';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getFastData } from '../../../../services/firebase/api';
import { AssetTab } from '../../../../types';
import { METRICS, Q, tabOptions } from '../../../../options';

const fetchInfo = async (
  ticker: string,
  setData: React.Dispatch<React.SetStateAction<any>>,
  setFastData: React.Dispatch<React.SetStateAction<any>>,
  setCompetitors: React.Dispatch<React.SetStateAction<any[]>>,
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
  const [stockInfo, setStockInfo] = useState<any>({});
  const [fastInfo, setFastInfo] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [competitors, setCompetitors] = useState<any[]>([]);
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
    <div className="flex flex-col gap-12 min-h-screen p-6 sm:p-12 bg-light dark:bg-dark">
      <BuySellDialog isOpen={dialogOpen} ticker={ticker} onClose={() => setDialogOpen(false)} />

      <div className="flex flex-col gap-6 w-full bg-surface-light-secondary dark:bg-surface-dark-secondary border border-border-light dark:border-border-dark rounded-lg p-6 sm:p-12 shadow-sm">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <div className="flex flex-col gap-1">
            <h1 className="text-5xl font-bold text-primary-light dark:text-primary-dark">
              {stockInfo?.name}{' '}
              <span className="text-secondary-light dark:text-secondary-dark text-lg">({ticker})</span>
            </h1>

            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-medium flex items-baseline text-primary-light dark:text-primary-dark">
                ${fastInfo?.price?.toFixed(2)}
                <sub className="ml-1 text-xs text-secondary-light dark:text-secondary-dark">{stockInfo?.currency}</sub>
              </h2>
              <span
                className={`text-sm px-2 py-0.5 rounded-full border ${
                  fastInfo?.change >= 0
                    ? 'border-good bg-good/20 text-good'
                    : 'border-bad bg-bad/20 text-bad'
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
              className="bg-primary-light text-light hover:bg-accent-light dark:bg-primary-dark dark:text-dark dark:hover:bg-accent-dark"
            />
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loading />
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <TabGroup<AssetTab>
              currentTab={currentTab}
              onSelect={setCurrentTab}
              options={tabOptions(stockInfo.assetClass).filter(o => o !== 'Q-Scores')}
            />

            <RankingTable
              currentTab={currentTab}
              options={METRICS(stockInfo.assetClass)}
              data={stockInfo}
            />

            {/* Profile Details */}
            {currentTab === 'Profile' && (
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col gap-2 flex-1">
                  {[
                    ['Sector', stockInfo?.sector],
                    ['52 Week Range', fastInfo.range],
                    ...(stockInfo?.category ? [['Category', stockInfo?.category]] : [])
                  ].map(([label, value]) => (
                    <div key={label as string} className="flex items-center gap-6 w-full">
                      <div className="w-[140px]">
                        <h3 className="font-bold text-base md:text-sm text-primary-light dark:text-primary-dark">
                          {label}
                        </h3>
                      </div>
                      <div className="w-[40px]">
                        <h3 className="text-base md:text-sm ">
                          {value}
                        </h3>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Charts / Analysis */}
                {stockInfo?.numAn ? (
                  <Analysis
                    className="hidden md:flex flex-1"
                    price={fastInfo?.price}
                    numAnalysts={stockInfo?.numAn}
                    rec={stockInfo?.anRec}
                    minTarget={stockInfo?.anMin}
                    meanTarget={stockInfo?.anAvg}
                    maxTarget={stockInfo?.anMax}
                  />
                ) : (
                  <div className="flex-1" />
                )}

                {stockInfo?.plotHoldings && (
                  <PieChart title="Top Holdings" data={stockInfo?.plotHoldings}  />
                )}
                {stockInfo?.plotSectors && (
                  <PieChart title="Top Sectors" data={stockInfo?.plotSectors} />
                )}
              </div>
            )}

            {/* Main Chart */}
            {stockInfo.type !== 2 && (
              <div className="mt-6">
                <h2 className="text-2xl font-semibold text-primary-light dark:text-primary-dark mb-2">Chart</h2>
                {ticker && <Chart symbol={ticker} height="420px" />}
              </div>
            )}

            {/* Q-Scores Table */}
            <div className="mt-8">
              <RankingTable
                currentTab={'Q-Scores'}
                options={Q}
                data={stockInfo}
                t={1}
                header="Q-Scores"
              />
            </div>

            {/* Mobile Analysis */}
            {stockInfo?.['num-an'] && (
              <Analysis
                className="flex md:hidden mt-4"
                price={fastInfo?.price}
                numAnalysts={stockInfo?.numAn}
                rec={stockInfo?.anRec}
                minTarget={stockInfo?.anMin}
                meanTarget={stockInfo?.anAvg}
                maxTarget={stockInfo?.anMax}
              />
            )}

            {/* Competitors */}
            <div className="mt-8">
              <h3 className="text-2xl font-semibold text-primary-light dark:text-primary-dark">Top Competitors</h3>
              <div className="flex flex-wrap gap-4 mt-4">
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

              <div className="w-full sm:w-1/3 mt-4">
                <Link
                  className="btn bg-brand-light text-light hover:bg-brand-hover dark:bg-brand-dark dark:text-dark dark:hover:bg-brand-hover w-full text-center rounded-lg px-4 py-2"
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
