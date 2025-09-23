'use client';
import React, { useState, useEffect } from "react";
import {
  BaselineChart,
  PieChart,
  Table,
} from "../../../components/composition";
import { IconStar, IconUser, IconEdit } from "../../../components/icons";
import { Loading } from "../../../components/primitive";
import {
  getFavouriteCount,
  getFavourites,
  getPortfolioDoc,
  getUserById,
  toggleFavourite,
} from "../../../../services/firebase/db";
import { useAuth } from "../../../../services/useAuth";
import { EditPortfolioDialog } from "../../../components/dialogs";
import { useParams } from "next/navigation";
import { getPortfolioData } from "../../../../services/firebase/api";
import { Portfolio, PortfolioTag } from "../../../../types";
import Link from "next/link";

const formatNumber = (number: number) => {
  if (number >= 1e6) return `${(number / 1e6).toFixed(1)}M`;
  if (number >= 1e3) return `${(number / 1e3).toFixed(1)}K`;
  return `${number.toFixed(0)}`;
};

const PortfolioPage = () => {
  const { currentUser } = useAuth();
  const [isFavourite, setIsFavourite] = useState(false);
  const [favouriteCount, setFavouriteCount] = useState<number>(0);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [data, setData] = useState<Portfolio | null>(null);
  const [author, setAuthor] = useState<any>(null);
  const [invalid, setInvalid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [chartData, setChartData] = useState<{'portfolio':Record<'time' | 'value', any>[],'market':Record<'time'|'value', any>[]}>({
    'portfolio':[],
    'market':[]
  });

  const params = useParams();
  const t = params.portfolioId;

  useEffect(() => {
    if (!t) return;
    setLoading(true);
    let portData: any;

    getPortfolioDoc({ id: t as string }).then((data) => {
      setPortfolio(data);
      portData = data;
      if (data) {
        getUserById({ id: data.userId }).then(setAuthor);
        getFavouriteCount({ portfolioId: data.id }).then(setFavouriteCount);
      }
    });

    getPortfolioData({ id: t as string }).then((data) => {
      if (!data?.actionsDict || data?.actionsDict.length === 0) {
        setInvalid(true);
        setLoading(false);
        return;
      }
      setData({ ...portfolio, ...data });

      if (data.historicalReturns && data.marketReturns) {
        const chart = Object.entries(data.historicalReturns).map(
          ([time, value]: any) => ({ time, value })
        );
        const marketChart = Object.entries(data.marketReturns).map(
          ([time, value]: any) => ({ time, value })
        );
        setChartData({'portfolio':chart, 'market':marketChart});
      }
      setLoading(false);
    });
  }, [t]);

  useEffect(() => {
    if (!currentUser) return setIsFavourite(false);

    getFavourites({ userId: currentUser.id }).then((data) => {
      setIsFavourite(data.some((f) => f.toPortfolio == portfolio?.id));
    });
  }, [currentUser, portfolio]);

  function handleFavourite(isF: boolean) {
    if (!portfolio || !currentUser || currentUser.id === portfolio?.userId)
      return;

    if (isF) {
      toggleFavourite({
        portfolioId: portfolio.id,
        userId: currentUser.id,
        att: "Add",
      }).then(() => {
        setIsFavourite(isF);
        setFavouriteCount((prev) => prev + 1);
      });
    } else {
      toggleFavourite({
        portfolioId: portfolio.id,
        userId: currentUser.id,
        att: "Remove",
      }).then(() => {
        setIsFavourite(isF);
        setFavouriteCount((prev) => prev - 1);
      });
    }
  }

  return (
    <div className="p-12">
      <EditPortfolioDialog
        portfolio={portfolio}
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        setPortfolio={setPortfolio}
      />
      <div className="p-12 border border-border-light dark:border-border-dark rounded-lg shadow-lg">

      {/* Title Section */}
      <h1 className="text-xs text-secondary-light dark:text-secondary-dark mt-4">
        {portfolio?.created && `Created on ${portfolio.created}`}
      </h1>

      <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-6 mt-2">
        <div className="flex-1 flex flex-col md:flex-row items-start gap-4">
          <div className="flex flex-col">
            <h2 className="text-2xl md:text-3xl font-bold">{portfolio?.title}</h2>
            <Link
              href ={portfolio && currentUser?.id === portfolio?.userId? "/dash/"
                    : `/dash/${author?.id}/`}
              
              className="flex items-center gap-2 cursor-pointer text-secondary-light dark:text-secondary-dark mt-1"
            >
              <IconUser size="20" onClick={()=>{}} />
              <p className="text-sm">
                By {author?.firstName} {author?.lastName}
              </p>
            </Link>
          </div>

          <div className="flex items-end gap-1 mt-4 md:mt-0">
            <IconStar
              size="32"
              isFilled={isFavourite}
              onClick={() => handleFavourite(!isFavourite)}
            />
            <p className="text-base md:text-xl">{formatNumber(favouriteCount)}</p>
          </div>
        </div>

        {portfolio && currentUser?.id === portfolio?.userId && (
          <div className="flex-none mt-4 md:mt-0">
            <IconEdit size="32" onClick={() => setDialogOpen(true)} />
          </div>
        )}
      </div>

      <p className="mt-4 max-w-xl text-sm md:text-base text-secondary-light dark:text-secondary-dark">
        {portfolio?.description}
      </p>

      <div className="flex flex-wrap gap-2 mt-2">
        {portfolio?.tags?.map((tag: PortfolioTag) => (
          <span
            key={tag}
            className="bg-brand-light dark:bg-brand-dark  text-light dark:text-dark px-2 py-1 rounded-full text-xs md:text-sm"
          >
            {tag}
          </span>
        ))}
      </div>

      {invalid && !loading ? (
        <div className="flex flex-col justify-center items-center h-64 mt-10">
          <h1 className="text-xl font-bold">
            This portfolio has no holdings or history...
          </h1>
          {currentUser?.id === portfolio?.userId && (
            <h2 className="text-base mt-2">
              You can add your first assets from the{" "}
              <a href="/screener" className="font-bold underline">
                Screener
              </a>
            </h2>
          )}
        </div>
      ): null}

      {loading ? <Loading />: null}

      {/* Performance Metrics */}
      {data?.allTimeGrowth ? (
        <>
          <h3 className="text-xl md:text-xl font-bold mt-10 mb-4  pt-6">
            Performance Metrics
          </h3>
          <div className="flex flex-row gap-6">
            {(
              [
                { column: "alpha", label: "Alpha" },
                { column: "sharpe", label: "Sharpe" },
                { column: "beta", label: "Beta" },
                { column: "maxDrawdown", label: "Max Drawdown" },
                { column: "avgDrawdown", label: "Avg Drawdown" },
              ] as {column:(keyof Portfolio), label:string}[]
            ).map((item) => (
              <div
                key={item.column}
                className="flex flex-col items-centerp-4 rounded-lg"
              >
                <p className="text-xl md:text-xl font-bold">
                  {data[item.column]
                    ? 
                    item.column == 'beta'?(data[item.column] as number).toFixed(2):`${(100 * (data[item.column] as number)).toFixed(2)}%`
                    : "—"}
                </p>
                <p className="text-xs text-secondary-light dark:text-secondary-dark tracking-wide">
                  {item.label}
                </p>
              </div>
            ))}
          </div>

          {/* Historical Returns */}
          <h3 className="text-xl md:text-xl font-bold mt-10 mb-4 pt-6">
            Historical Returns (Annualized)
          </h3>
          <div className="flex flex-row gap-6">
            {(
              [
                { column: "allTimeGrowth", label: "All Time" },
                { column: "oneYearGrowth", label: "1 Year" },
                { column: "sixMonthGrowth", label: "6 Months" },
                { column: "threeMonthGrowth", label: "3 Months" },
                { column: "oneMonthGrowth", label: "1 Month" },
              ] as { column: keyof Portfolio; label: string }[]
            ).map((item) => (
              <div
                key={item.column}
                className="flex flex-col items-center p-4 rounded-lg"
              >
                <p className="text-xl md:text-xl font-bold">
                  {data?.[item.column] != null
                    ? `${(100 * (data[item.column] as number)).toFixed(2)}%`
                    : "—"}
                </p>
                <p className="text-xs text-secondary-light dark:text-secondary-dark">{item.label}</p>
              </div>
            ))}
          </div>

        </>
      ): null}

      {/* Chart */}
      {chartData.portfolio.length > 10 ? (
        <div className="mt-8 w-full h-full">
          <BaselineChart data={chartData} />
        </div>
      ): null}

      {data?.holdingsDict ? (
  <>
    <h3 className="text-xl md:text-xl font-bold mt-10 mb-4">
      Holdings
    </h3>
    <div className="mt-4 flex flex-wrap gap-6">
      <Table 
        header={['Ticker','Name','Class','Sector','Shares','Avg. Buy','Price','Open PnL', 'Weight','Div. Yield']}
        data={data.holdingsDict}
        columnDetails={{
          public:['ticker','name', 'asset-class','sector','shares', 'avg_buy','price', 'open_pnl','weight', 'yield'],
          price:['avg_buy','price'],
          percent:['open_pnl', 'weight', 'yield'],
          neutral: ['yield', 'weight']
        }}
        defSort='weight'
      />
    </div>
  </>
): null}

{data?.actionsDict && (
  <>
    <h3 className="text-xl md:text-xl font-bold mt-10 mb-4">
      Actions History
    </h3>
    <div className="mt-4 flex flex-wrap gap-6">
      <Table 
        header={['Ticker', 'Date','Shares',  'Price']}
        data={data.actionsDict.map((a) => ({ 
          ...a, 
          shares: a.action === 1 ? a.shares : -a.shares
        }))}
        columnDetails={{
          public:['ticker', 'date', 'shares', 'price'],
          price:['price'],
          baseLine:['shares']
        }}
        defSort='date'
      />
    </div>
  </>
)}

      {(data?.holdingsDict?.length || 0) > 0 && (
        <>
          <h3 className="text-xl md:text-xl font-bold mt-10 mb-4 pt-6">
            Holdings Breakdown
          </h3>
          <div className="mt-4 flex flex-wrap gap-6">
            <PieChart
              mult={false}
              title="By Asset Class (Weight)"
              data={
                data?.assetWeight
                  ? Object.entries(data.assetWeight).reduce(
                      (acc: any, [key, value]: any) => {
                        const type = key || "Unknown";
                        acc[type] = value * 100;
                        return acc;
                      },
                      {}
                    )
                  : {}
              }
            />
            <PieChart
              mult={false}
              title="By Sector (Weight)"
              data={
                data?.sectorWeight
                  ? Object.entries(data.sectorWeight).reduce(
                      (acc: any, [key, value]: any) => {
                        if (value > 0) acc[key] = value * 100;
                        return acc;
                      },
                      {}
                    )
                  : {}
              }
            />
          </div>

          {Object.values(data?.assetContrib || {}).reduce(
            (acc, val) => acc + val,
            0
          ) > 0&&<>
          <h3 className="text-xl md:text-xl font-bold mt-10 mb-4">
            Contribution Breakdown
          </h3>
          <div className="mt-4 flex flex-wrap gap-6">
            <PieChart
              mult={false}
              title="By Asset Class (Contribution)"
              data={
                data?.assetContrib
                  ? Object.entries(data.assetContrib).reduce(
                      (acc: any, [key, value]: any) => {
                        const type = key || "Unknown";
                        acc[type] = value * 100;
                        return acc;
                      },
                      {}
                    )
                  : {}
              }
            />
            <PieChart
              mult={false}
              title="By Sector (Contribution)"
              data={
                data?.sectorContrib
                  ? Object.entries(data.sectorContrib).reduce(
                      (acc: any, [key, value]: any) => {
                        if (value > 0) acc[key] = value * 100;
                        return acc;
                      },
                      {}
                    )
                  : {}
              }
            />
          </div>
          </>}
        </>
      )}


      

      

      </div>
    </div>
  );
};

export default PortfolioPage;
