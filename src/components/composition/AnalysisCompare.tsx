import React from "react";

interface TickerData {
  ticker: string;
  anRec?: number | null;
  anMax?: number | null;
  anAvg?: number | null;
  anMin?: number | null;
}


interface AnalysisCompareProps {
  tickers: TickerData[];
  prices: { [ticker: string]: number };
}

export const AnalysisCompare: React.FC<AnalysisCompareProps> = ({
  tickers,
  prices,
}) => {
  const formatPercentage = (value: number) => {
    const percentage = ((value - 1) * 100).toFixed(2);
    const colorClass = parseFloat(percentage) >= 0 ? "text-good" : "text-bad";
    return <span className={`${colorClass}`}>({percentage}%)</span>;
  };

  const metrics = [
    { title: "Rec.", key: "anRec" },
    { title: "Max. Target", key: "anMax" },
    { title: "Mean Target", key: "anAvg" },
    { title: "Min. Target", key: "anMin" },
  ];

  const renderValue = (key: string, ticker: TickerData) => {
    const value = ticker[key as keyof TickerData];
    if (value == null || typeof value !== "number") return null

    if (key === "anRec") {
      let text = "NaN";
      if (value < 2) text = "Strong Buy";
      else if (value < 3) text = "Buy";
      else if (value < 4) text = "Hold";
      else if (value < 5) text = "Sell";
      else if (value < 6) text = "Strong Sell";

      const colorClass =
        value < 3
          ? "text-green-500 dark:text-green-400"
          : value < 4
          ? "text-gray-500 dark:text-gray-400"
          : value < 6
          ? "text-red-500 dark:text-red-400"
          : "text-gray-400 dark:text-gray-500";

      return (
        <h3 className={`text-xs sm:text-sm md:text-base font-medium ${colorClass} m-0 truncate`}>
          {text}
        </h3>
      );
    }

    return (
      <h3 className="text-xs sm:text-sm md:text-base font-medium m-0 text-primary-light dark:text-primary-dark truncate">
        {value ? Number(value).toFixed(2) : "NaN"}{" "}
        {value ? formatPercentage(value / prices[ticker.ticker]) : null}
      </h3>
    );
  };

  return (
    <div className="border border-border-light dark:border-border-dark rounded-xl mt-4 p-4 sm:p-5 shadow-lg bg-surface-light dark:bg-surface-dark overflow-x-auto">
      <div className="w-full sm:min-w-[400px]">
        {/* Header */}
        <div className="flex items-center py-2">
          {/* Fixed-width Ticker column */}
          <h1 className="w-[40px] sm:flex-1 text-sm sm:text-base md:text-lg font-semibold text-primary-light dark:text-primary-dark truncate">
            Ticker
          </h1>
          {metrics.map((metric, i) => (
            <h2
              key={i}
              className={`${metric.key == 'anMax' || metric.key == 'anMin' ? 'hidden sm:flex': ''} flex-1 text-xs sm:text-sm md:text-base font-semibold text-center text-primary-light dark:text-primary-dark truncate min-w-0`}
            >
              {metric.title}
            </h2>
          ))}
        </div>

        {/* Ticker Rows */}
        {tickers.map((ticker, i) => (
          <div
            key={i}
            className="flex items-center py-2 border-t border-border-light dark:border-border-dark"
          >
            {/* Fixed-width Ticker */}
            <h2 className="w-[40px] sm:flex-1 text-xs sm:text-sm md:text-base font-medium text-primary-light dark:text-primary-dark truncate">
              {ticker.ticker}
            </h2>
            {metrics.map((metric, j) => (
              <div key={j} className={`${metric.key == 'anMax' || metric.key == 'anMin' ? 'hidden sm:flex': ''} flex-1 text-center min-w-0`}>
                {renderValue(metric.key, ticker)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
