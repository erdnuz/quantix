"use client";

import { Chart, RankingTable, Analysis, PieChart } from '../../../components/composition';
import { Button, TabGroup, Card, Loading } from '../../../components/primitive';
import React, { useEffect, useState } from 'react';
import { getCompetitors, getAssetData } from '../../../../services/firebase/db';
import { BuySellDialog } from '../../../components/dialogs';
import { useAuth } from '../../../../services/useAuth';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { METRICS, Q } from '@/app/compare/page';
import { getFastData } from '../../../../services/firebase/api';


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
  const [currentTab, setCurrentTab] = useState(0);
  const [stockInfo, setStockInfo] = useState<any>({});
  const [fastInfo, setFastInfo] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const params = useParams();
  const ticker = params.symbol as string;

  const { currentUser } = useAuth();

  const tabOptions = stockInfo?.V
    ? ['Profile', 'Growth', 'Performance', 'Risk', 'Valuation', 'Profitability', 'Leverage']
    : ['Profile', 'Growth', 'Performance', 'Risk'];

  useEffect(() => {
    if (ticker) {
      fetchInfo(ticker, setStockInfo, setFastInfo, setCompetitors, setLoading);
    }
  }, [ticker]);

  return (
    <div className="flex flex-col">
      <BuySellDialog isOpen={dialogOpen} ticker={ticker} onClose={() => setDialogOpen(false)} />

      <div className="w-full flex flex-col gap-4 px-6 py-6">
        <div className="flex justify-between w-full items-start">
          <div className="flex flex-col gap-1 text-left">
            <h1 className="text-3xl font-bold">
              {stockInfo?.name}{' '}
              <span className="text-gray-500 text-sm">({ticker})</span>
            </h1>

            <div className="flex items-center gap-2">
              <h2 className="text-xl font-medium flex items-baseline">
                {fastInfo?.price?.toFixed(2)}
                <sub className="ml-1 text-xs text-gray-500">{stockInfo?.currency}</sub>
              </h2>
              <h2
                className={`text-sm px-2 py-0.5 rounded-full border ${
                  fastInfo?.change >= 0
                    ? 'border-green-500 bg-green-100 text-green-600'
                    : 'border-red-500 bg-red-100 text-red-600'
                }`}
              >
                {fastInfo?.change !== undefined ? `${(100 * fastInfo.change).toFixed(2)}%` : ''}
              </h2>
            </div>
          </div>

          {!loading && (
            <Button
              label="Add / Remove"
              disabled={!currentUser}
              onClick={() => currentUser && setDialogOpen(true)}
            />
          )}
        </div>

        {loading ? (
          <Loading />
        ) : (
          <div className="flex flex-col w-full gap-4">
            <TabGroup currentTab={currentTab} onSelect={setCurrentTab} options={tabOptions} />

            <RankingTable currentTab={currentTab} options={METRICS} data={stockInfo} />

            {currentTab === 0 && (
              <div className="flex flex-col md:flex-row gap-4">
                {/* Left info column */}
                <div className="flex flex-col gap-2 flex-1">
                  {[
                    [stockInfo?.sector ? 'Sector' : 'Category', stockInfo?.sector || stockInfo?.category],
                    ['52 Week Range', fastInfo?.range ? `${fastInfo.range} ${stockInfo?.currency}` : 'NaN'],
                    ...(stockInfo?.category ? [['Category', stockInfo?.category]] : [])
                  ].map(([label, value]) => (
                    <div key={label} className="flex">
                      <div className="flex-1 font-bold">{label}</div>
                      <div className="flex-1">{value || 'NaN'}</div>
                    </div>
                  ))}
                </div>

                {/* Right charts/analysis */}
                {stockInfo?.['num-an'] ? (
                  <Analysis
                    className="hidden md:flex"
                    price={fastInfo?.price}
                    numAnalysts={stockInfo?.['num-an']}
                    rec={stockInfo?.['an-rec']}
                    minTarget={stockInfo?.['an-min']}
                    meanTarget={stockInfo?.['an-avg']}
                    maxTarget={stockInfo?.['an-max']}
                  />
                ) : (
                  <div className="flex-1"></div>
                )}

                {stockInfo?.['plot-holdings'] && <PieChart title="Top Holdings" data={stockInfo?.['plot-holdings']} />}
                {stockInfo?.['plot-sectors'] && <PieChart title="Top Sectors" data={stockInfo?.['plot-sectors']} />}
              </div>
            )}

            {stockInfo.type !== 2 && (
              <div className="mt-4">
                <h2 className="text-xl font-semibold">Chart</h2>
                {ticker && (
                  <Chart
                    symbol={
                      ticker
                    }
                    height="420px"
                  />
                )}
              </div>
            )}

            <div className="mt-8">
              <RankingTable currentTab={0} options={Q} data={stockInfo} t={1} header="Q-Scores" />
            </div>

            {stockInfo?.['num-an'] && (
              <Analysis
                className="flex md:hidden mt-4"
                price={fastInfo?.price}
                numAnalysts={stockInfo?.['num-an']}
                rec={stockInfo?.['an-rec']}
                minTarget={stockInfo?.['an-min']}
                meanTarget={stockInfo?.['an-avg']}
                maxTarget={stockInfo?.['an-max']}
              />
            )}

            <div className="mt-8">
              <h3 className="text-lg font-semibold">Top Competitors</h3>

              <div className="flex flex-wrap gap-4 mt-4">
                {competitors?.map((competitor, index) => (
                  <Link key={index} href={`/metrics/${competitor.ticker}/`}>
                    <Card ticker={competitor.ticker} name={competitor.name} size={competitor.size} assetClass={competitor.assetClass} category='' />
                  </Link>
                ))}
              </div>

              <div className="w-1/3 mt-4 min-w-[fit-content]">
                <Link
                  className="btn brand"
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
