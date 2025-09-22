"use client";
import React, { useState, useEffect } from "react";
import { BaselineChart, PieChart, Table } from "../../../components/composition";
import { IconStar, IconUser, IconEdit } from "../../../components/icons";
import { Select, Loading } from "../../../components/primitive";
import { getFavouriteCount, getFavourites, getPortfolioDoc, getUserById, getUserFavourites, toggleFavourite } from "../../../../services/firebase/db";
import { useAuth } from "../../../../services/useAuth";
import { EditPortfolioDialog } from "../../../components/dialogs";
import { useParams } from "next/navigation";
import { getPortfolioData } from "../../../../services/firebase/api";
import { Portfolio } from "../../../../types";


const holdingColumnDets = {
  public: ["ticker", "name", "type", "sector", "region", "shares", "avg-buy", "price", "weight", "open-pnl"],
  percent: ["open-pnl"],
  percentNeutral: ["weight"],
  large: ["shares"],
  price: ["price", "avg-buy"],
};

const actionColumnDets = {
  public: ["ticker", "date", "action", "shares", "price"],
  percent: ["pnl"],
  large: ["shares"],
  price: ["price"],
};

const selectOptions = [["Last month"], ["Last 3 months"], ["Last year"], ["All time"]];

const formatNumber = (number: number) => {
  if (number >= 1e6) return `${(number / 1e6).toFixed(1)}M`;
  if (number >= 1e3) return `${(number / 1e3).toFixed(1)}K`;
  return `${number.toFixed(0)}`;
};

const tagItems = [
  "Growth", "Value", "Dividend", "Balanced", "Aggressive", "Conservative",
  "Emerging Markets", "Emerging Tech", "Small Cap", "Large Cap", "Diversified", "Global",
  "Short-term", "Long-term",
];

const PortfolioPage = () => {
  const { currentUser } = useAuth();
  const [selected, setSelected] = useState(0);
  const [isFavourite, setIsFavourite] = useState(false);
  const [ favouriteCount, setFavouriteCount] = useState<number>(0)
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [data, setData] = useState<any>(null);
  const [author, setAuthor] = useState<any>(null);
  const [invalid, setInvalid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [filter, setFilter] = useState<any[]>([]);

  const params = useParams();
  const t = params.portfolioId;

  useEffect(() => {
    if (!t) return;
    setLoading(true);
    let portData: any;

    getPortfolioDoc({id:t as string}).then((data) => {
      setPortfolio(data);
      portData = data;
      if (data) {
        getUserById({ id:data.userId}).then(setAuthor);
        getFavouriteCount({portfolioId: data.id}).then(setFavouriteCount)
      }

    });

    getPortfolioData({id:t as string}).then((data) => {
      if (!data?.df || Object.keys(portData?.actions || {}).length === 0) {
        setInvalid(true);
        setLoading(false);
        return;
      }
      data.holdings = Object.entries(data.df).map(([ticker, d]: any) => ({ ticker, ...d }));
      setData(data);

      if (data.hist) {
        const chart = Object.entries(data.hist).map(([time, value]: any) => ({ time, value }));
        setChartData(chart);
      }
      setLoading(false);
    });
  }, [t]);

  useEffect(() => {
    if (!currentUser) return setIsFavourite(false);

    getFavourites({userId:currentUser.id})
    .then((data) =>{
      setIsFavourite(data.some((f) => f.toPortfolio == portfolio?.id))
    })
  }, [currentUser, portfolio]);

  function handleFavourite(isF: boolean) {
    if (!portfolio || !currentUser || currentUser.id === portfolio?.userId) return;

    if (isF) {
      toggleFavourite({portfolioId: portfolio.id, userId:currentUser.id, att:'Add'})
        .then(() =>{
        setIsFavourite(isF);
        setFavouriteCount((prev) => prev+1);
      })

    } else {
      toggleFavourite({portfolioId: portfolio.id, userId:currentUser.id, att:'Remove'})
      .then(() =>{
        setIsFavourite(isF);
        setFavouriteCount((prev) => prev-1);
      })
    }
  }

  function setTimeframe(s: number) {
    setSelected(s);
    if (s === 3) return setFilter([]);

    const today = Date.now();
    const month = 30 * 24 * 60 * 60 * 1000;
    const threeMonths = 3 * month;
    const year = 365 * 24 * 60 * 60 * 1000;

    setFilter([
      {
        fit: (act: any) => {
          const date = new Date(act.date).getTime();
          if (s === 0) return today - date < month;
          if (s === 1) return today - date < threeMonths;
          if (s === 2) return today - date < year;
          return false;
        },
      },
    ]);
  }

  return (
    <div className="px-6 md:px-16">
      <EditPortfolioDialog portfolio={portfolio} isOpen={dialogOpen} onClose={() => setDialogOpen(false)} setPortfolio={setPortfolio} />

      <h1 className="text-sm text-gray-500 mt-4">Created {portfolio?.created}</h1>

      <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-6 mt-2">
        <div className="flex-1 flex flex-col md:flex-row items-start gap-4">
          <div className="flex flex-col">
            <h2 className="text-2xl md:text-3xl font-bold">{portfolio?.title}</h2>
            <div
              onClick={() =>
                (window.location.href =
                  portfolio && currentUser?.id === portfolio?.userId ? "/dash/" : `/dash/${author?.id}/`)
              }
              className="flex items-center gap-2 cursor-pointer text-gray-500 mt-1"
            >
              <IconUser size="20" onClick={()=>{}} />
              <p className="text-sm md:text-base">{author?.firstName} {author?.lastName}</p>
            </div>
          </div>

          <div className="flex items-end gap-1 mt-4 md:mt-0">
            <IconStar size="32" isFilled={isFavourite} onClick={() => handleFavourite(!isFavourite)} />
            <p className="text-base md:text-lg">{formatNumber(favouriteCount)}</p>
          </div>
        </div>

        {portfolio && currentUser?.id === portfolio?.userId && (
          <div className="flex-none mt-4 md:mt-0">
            <IconEdit size="32" onClick={() => setDialogOpen(true)} />
          </div>
        )}
      </div>

      <p className="mt-4 max-w-xl text-sm md:text-base text-gray-700">{portfolio?.description}</p>

      <div className="flex flex-wrap gap-2 mt-2">
        {portfolio?.tags?.map((tag: any, index: number) => (
          <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs md:text-sm">
            {tagItems[tag]}
          </span>
        ))}
      </div>

      {invalid && !loading && (
        <div className="flex flex-col justify-center items-center h-64 mt-10">
          <h1 className="text-xl font-bold">This portfolio has no holdings or history...</h1>
          {currentUser?.id === portfolio?.userId && (
            <h2 className="text-base mt-2">
              You can add your first assets from the <a href="/screener" className="font-bold underline">Screener</a>
            </h2>
          )}
        </div>
      )}

      {loading && <Loading />}

      {data?.all && (
        <>
          <div className="flex flex-wrap justify-between gap-6 mt-8">
            {["cagr", "alpha", "sharpe", "max_drawdown"].map((col) => (
              <div key={col} className="flex flex-col items-center">
                <p className="text-lg md:text-xl font-bold">{data[col] ? `${(100 * data[col]).toFixed(2)}%` : "NaN"}</p>
                <p className="text-sm">{col.toUpperCase()}</p>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <h3 className="text-lg md:text-xl font-bold mb-4">Historical Returns</h3>
            <div className="flex flex-wrap justify-between gap-6">
              {["all", "1y", "6m", "3m", "1m"].map((col) => (
                <div key={col} className="flex flex-col items-center">
                  <p className="text-lg md:text-xl font-bold">{data[col] ? `${(100 * data[col]).toFixed(2)}%` : "NaN"}</p>
                  <p className="text-sm">{col}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {chartData.length > 3 && (
        <div className="mt-6 w-full h-80">
          <BaselineChart data={chartData} actions={portfolio?.actions} />
        </div>
      )}

      {data?.holdings?.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-6">
          <PieChart
            mult={false}
            title="Asset Class"
            data={data.asset_weight ? Object.entries(data.asset_weight).reduce((acc: any, [key, value]: any) => {
              const type = { 0: "Equity", 1: "ETF", 2: "Cash" }[key as number] || "Unknown";
              acc[type] = value * 100;
              return acc;
            }, {}) : {}}
          />
          <PieChart
            mult={false}
            title="Sector"
            data={data.sector_weight ? Object.entries(data.sector_weight).reduce((acc: any, [key, value]: any) => {
              if (value > 0) acc[key] = value * 100;
              return acc;
            }, {}) : {}}
          />
        </div>
      )}
    </div>
  );
};

export default PortfolioPage;
