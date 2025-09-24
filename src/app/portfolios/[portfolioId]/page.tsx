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
import { Portfolio, PortfolioTag, User } from "../../../../types";
import Link from "next/link";
import { BaselineData, Time } from "lightweight-charts";

const formatNumber = (number: number) => {
  if (number >= 1e6) return `${(number / 1e6).toFixed(1)}M`;
  if (number >= 1e3) return `${(number / 1e3).toFixed(1)}K`;
  return `${number.toFixed(0)}`;
};

type Action = {
  ticker: string,
  date: string,
  shares: number,
  price: number

}

type Holding = {
  ticker:string,
  name:string, 
  'asset-class':'Equity'|'ETF',
  sector:string,
  shares:number,
   'avg_buy':number,
   'price':number,
    'open_pnl':number|null,
    'weight':number, 
    'yield':number,

}

const PortfolioPage = () => {
  const { currentUser } = useAuth();
  const [isFavourite, setIsFavourite] = useState(false);
  const [favouriteCount, setFavouriteCount] = useState<number>(0);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [data, setData] = useState<Portfolio | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [chartData, setChartData] = useState<{'portfolio':BaselineData<Time>[],'market':BaselineData<Time>[]}>({
    'portfolio':[],
    'market':[]
  });

  const params = useParams();
  const t = params.portfolioId;

  useEffect(() => {
    if (!t) return;
    setLoading(true);
    let portData: Portfolio | null;

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
        const chart = data.historicalReturns
        const marketChart = data.marketReturns
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
    <div className="p-4 sm:p-8 md:p-12">
      <EditPortfolioDialog
        portfolio={portfolio}
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        setPortfolio={setPortfolio}
      />
      {/* Title Section */}
      <h1 className="text-xs text-secondary-light dark:text-secondary-dark mt-4">
        {portfolio?.created && `Created on ${portfolio.created}`}
      </h1>

      <div className="flex flex-row justify-between w-full items-start gap-4">
  {/* Left: Title and Author */}
  <div className="flex flex-col gap-1">
    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold break-words">
      {portfolio?.title}
    </h2>
    <Link
      href={
        portfolio && currentUser?.id === portfolio?.userId
          ? "/dash/"
          : `/dash/${author?.id}/`
      }
      className="flex items-center gap-2 cursor-pointer text-secondary-light dark:text-secondary-dark"
    >
      <IconUser size={20} onClick={()=>{}} />
      <p className="text-sm">
        By {currentUser?.id === portfolio?.userId ? "You" : `${author?.firstName} ${author?.lastName}`}
      </p>
    </Link>
  </div>

  {/* Right: Star, Favourite Count, Edit */}
  <div className="flex items-start justify-center gap-4">
    <div className="flex flex-row gap-1">
    <p className="text-base mt-1 text-secondary-light dark:text-secondary-dark">{formatNumber(favouriteCount)}</p>
    <IconStar
      size={32}
      isFilled={isFavourite}
      onClick={() => handleFavourite(!isFavourite)}

    />
    </div>
    
    {portfolio && currentUser?.id === portfolio?.userId && (
      <IconEdit size={32} onClick={() => setDialogOpen(true)} />
    )}
  </div>
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
          <h1 className="text-lg sm:text-xl font-bold">
            This portfolio has no holdings or history...
          </h1>
          {currentUser?.id === portfolio?.userId && (
            <h2 className="text-sm sm:text-base mt-2">
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
{data?.allTimeGrowth && (
  <>
    <h3 className="text-lg sm:text-xl font-bold mt-6 sm:mt-12 mb-4">
      Performance Metrics
    </h3>
    <div className="flex flex-row flex-wrap gap-2 sm:gap-6">
      {([
        { column: "alpha", label: "Alpha" },
        { column: "sharpe", label: "Sharpe" },
        { column: "beta", label: "Beta" },
        { column: "maxDrawdown", label: "Max Drawdown" },
        { column: "avgDrawdown", label: "Avg Drawdown" },
      ] as {column:keyof Portfolio, label:string}[]).map((item) => {
        const value = data[item.column] as number | null | undefined;
        const display = typeof value === 'number' && !isNaN(value)
          ? item.column === "beta"
            ? value.toFixed(2)
            : `${(100 * value).toFixed(2)}%`
          : "—";
        return (
          <div
            key={item.column}
            className="flex flex-col items-center p-4 rounded-lg flex-1 min-w-[100px] max-w-[150px] sm:min-w-[120px]"
          >
            <p className="text-lg sm:text-xl font-bold text-center break-words">
              {display}
            </p>
            <p className="text-xs text-secondary-light dark:text-secondary-dark tracking-wide text-center break-words">
              {item.label}
            </p>
          </div>
        );
      })}
    </div>

    {/* Historical Returns */}
    <h3 className="text-lg sm:text-xl font-bold mt-6 mb-4 sm:mt-12">
      Historical Returns (Annualized)
    </h3>
    <div className="flex flex-row flex-wrap gap-2 sm:gap-6">
      {([
        { column: "allTimeGrowth", label: "All Time" },
        { column: "oneYearGrowth", label: "1 Year" },
        { column: "sixMonthGrowth", label: "6 Months" },
        { column: "threeMonthGrowth", label: "3 Months" },
        { column: "oneMonthGrowth", label: "1 Month" },
      ] as {column:keyof Portfolio, label:string}[]).map((item) => {
        const value = data[item.column] as number | null | undefined;
        const display = typeof value === 'number' && !isNaN(value)
          ? `${(100 * value).toFixed(2)}%`
          : "—";
        return (
          <div
            key={item.column}
            className="flex flex-col items-center p-4 rounded-lg flex-1 min-w-[100px] max-w-[150px] sm:min-w-[120px]"
          >
            <p className="text-xl md:text-xl font-bold text-center break-words">
              {display}
            </p>
            <p className="text-xs text-secondary-light dark:text-secondary-dark text-center break-words">
              {item.label}
            </p>
          </div>
        );
      })}
    </div>
  </>
)}



      {/* Chart */}
      {chartData.portfolio.length > 10 ? (
        <div className="mt-8 w-full h-full">
          <BaselineChart data={chartData} />
        </div>
      ): null}

      {data?.holdingsDict ? (
  <>
    <h3 className="text-lg sm:text-xl font-bold mt-6 sm:mt-10 mb-4">
      Holdings
    </h3>
    <div className="mt-4 flex flex-wrap gap-6">
      <Table<Holding>
        header={['Ticker','Name','Class','Sector','Shares','Avg. Buy','Price','Open PnL', 'Weight','Div. Yield']}
        data={data.holdingsDict as Holding[]}
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
    <h3 className="text-lg sm:text-xl font-bold mt-6 sm:mt-10 mb-4">
      Actions History
    </h3>
    <div className="mt-4 flex flex-wrap gap-6">
      <Table<Action>
        header={['Ticker', 'Date','Shares',  'Price']}
        data={data.actionsDict.map((a) => ({ 
          ticker: a.ticker as string,
          price:a.price as number, 
          date:a.date as string,
          shares: (a.action === 0 && a.shares? -a.shares : a.shares) as number
        })) as Action[]}
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
          <h3 className="text-lg sm:text-xl font-bold mt-6 sm:mt-12 mb-4">
            Holdings Breakdown
          </h3>
          <div className="mt-4 flex flex-wrap gap-6">
            <PieChart
              mult={false}
              title="By Asset Class"
              data={
                data?.assetWeight
                  ? Object.entries(data.sectorWeight).reduce(
                    (acc: Record<string, number>, [key, value]: [string, number]) => {
                      if (value > 0) acc[key] = value * 100;
                      return acc;
                    },
                    {}
                  )
                    
                  : {}
              }
            />
            <PieChart
              mult={false}
              title="By Sector"
              data={
                data?.sectorWeight
                  ? Object.entries(data.sectorWeight).reduce(
                    (acc: Record<string, number>, [key, value]: [string, number]) => {
                      if (value > 0) acc[key] = value * 100;
                      return acc;
                    },
                    {})

                  : {}
              }
            />
          </div>

          {Object.values(data?.assetContrib || {}).reduce(
            (acc, val) => acc + val,
            0
          ) > 0&&<>
          <h3 className="text-lg sm:text-xl md:text-xl font-bold mt-6 sm:mt-12 mb-4">
            Contribution Breakdown
          </h3>
          <div className="mt-4 flex flex-wrap gap-6">
            <PieChart
              mult={false}
              title="By Asset Class"
              data={
                data?.assetContrib
                  ? Object.entries(data.sectorWeight).reduce(
  (acc: Record<string, number>, [key, value]: [string, number]) => {
    if (value > 0) acc[key] = value * 100;
    return acc;
  },
  {}
)
                  : {}
              }
            />
            <PieChart
              mult={false}
              title="By Sector"
              data={
                data?.sectorContrib
                  ? Object.entries(data.sectorWeight).reduce(
  (acc: Record<string, number>, [key, value]: [string, number]) => {
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
  );
};

export default PortfolioPage;
