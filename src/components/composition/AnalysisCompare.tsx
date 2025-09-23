import React from "react";

interface TickerData {
  ticker: string;
  [key: string]: any; // allows an-rec, an-max, an-avg, an-min keys
}

interface AnalysisCompareProps {
  tickers: TickerData[];
  prices: { [ticker: string]: number };
}

export const AnalysisCompare: React.FC<AnalysisCompareProps> = ({ tickers, prices }) => {
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
    const value = ticker[key];

    // Recommendation column
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
        <h3 className={`text-sm md:text-base  font-medium ${colorClass} m-0`}>
          {text}
        </h3>
      );
    }

    // Other metrics
    return (
      <h3 className="text-sm md:text-base font-medium m-0 text-primary-light dark:text-primary-dark">
        {value ? Number(value).toFixed(2) : "NaN"}{" "}
        {value ? formatPercentage(value / prices[ticker.ticker]) : null}
      </h3>
    );
  };

  return (
    <div className="border border-border-light dark:border-border-dark rounded-xl mt-4 p-5 shadow-lg bg-surface-light dark:bg-surface-dark flex flex-col gap-3">
      <div className="w-full">
        {/* Header */}
        <div className="flex justify-between items-center py-2">
          <h1 className="text-lg font-semibold flex-1 text-primary-light dark:text-primary-dark">
            Ticker
          </h1>
          {metrics.map((metric, i) => (
            <h2
              key={i}
              className="text-base font-semibold flex-1 text-center text-primary-light dark:text-primary-dark"
            >
              {metric.title}
            </h2>
          ))}
        </div>

        {/* Ticker Rows */}
        {tickers.map((ticker, i) => (
          <div
            key={i}
            className="flex justify-between items-center py-2 border-t border-border-light dark:border-border-dark"
          >
            <h2 className="text-sm md:text-base font-medium flex-1 text-primary-light dark:text-primary-dark">
              {ticker.ticker}
            </h2>
            {metrics.map((metric, j) => (
              <div key={j} className="flex-1 text-center">
                {renderValue(metric.key, ticker)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
