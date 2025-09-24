import React from "react";

interface AnalysisProps {
  className?: string;
  price: number;
  numAnalysts: number;
  rec: number;
  minTarget: number;
  maxTarget: number;
  meanTarget: number;
}

export const Analysis: React.FC<AnalysisProps> = ({
  className = "",
  price,
  numAnalysts,
  rec,
  minTarget,
  maxTarget,
  meanTarget,
}) => {
  const formatPercentage = (value: number) => {
    const percentage = ((value - 1) * 100).toFixed(2);
    const colorClass =
      parseFloat(percentage) >= 0 ? "text-green-600" : "text-red-600";
    return <span className={`${colorClass}`}>({percentage}%)</span>;
  };

  const getRecommendation = () => {
    if (rec < 2) return "Strong Buy";
    if (rec < 3) return "Buy";
    if (rec < 4) return "Hold";
    if (rec < 5) return "Sell";
    if (rec < 6) return "Strong Sell";
    return "NaN";
  };

  const getRecommendationColor = () => {
    if (rec < 3) return "text-green-600";
    if (rec < 4) return "text-gray-400";
    if (rec < 6) return "text-red-600";
    return "text-gray-500";
  };

  return (
    <div
      className={`
        border border-border-light dark:border-border-dark 
        rounded-xl p-4 sm:p-5 flex flex-col gap-4 
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex flex-row justify-between gap-2">
        <h3 className="text-base sm:text-lg font-semibold m-0">
          Analysis
        </h3>
        <p className="text-xs sm:text-sm text-secondary-light dark:text-secondary-dark">
          {numAnalysts} Analysts
        </p>
      </div>

      {/* Recommendation */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 items-center">
        <h2 className="text-sm sm:text-base font-medium">Recommendation</h2>
        <p className={`text-sm sm:text-base m-0 ${getRecommendationColor()}`}>
          {getRecommendation()}
        </p>
      </div>

      {/* Max Target */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 items-center">
        <h2 className="text-sm sm:text-base font-medium">Max. Price Target</h2>
        <p className="text-sm sm:text-base m-0">
          {maxTarget ? maxTarget.toFixed(2) : "NaN"}{" "}
          {maxTarget ? formatPercentage(maxTarget / price) : ""}
        </p>
      </div>

      {/* Mean Target */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 items-center">
        <h2 className="text-sm sm:text-base font-medium">Mean Price Target</h2>
        <p className="text-sm sm:text-base m-0">
          {meanTarget ? meanTarget.toFixed(2) : "NaN"}{" "}
          {meanTarget ? formatPercentage(meanTarget / price) : ""}
        </p>
      </div>

      {/* Min Target */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 items-center">
        <h2 className="text-sm sm:text-base font-medium">Min. Price Target</h2>
        <p className="text-sm sm:text-base m-0">
          {minTarget ? minTarget.toFixed(2) : "NaN"}{" "}
          {minTarget ? formatPercentage(minTarget / price) : ""}
        </p>
      </div>
    </div>
  );
};
