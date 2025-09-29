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
        bg-surface-light-secondary dark:bg-surface-dark-secondary border border-border-light-secondary dark:border-border-dark-secondary
        rounded-xl p-4 sm:p-6 lg:p-8 flex flex-col max-w-4xl gap-4
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex flex-row items-baseline justify-between md:justify-start md:gap-4 gap-2">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold m-0">
          Analysis
        </h3>
        <p className="text-xs sm:text-sm lg:text-base text-secondary-light dark:text-secondary-dark pb-1">
          {numAnalysts} Analysts
        </p>
      </div>


      {/* Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 items-center">
        {/* Recommendation */}
        <div className="flex justify-between md:justify-start md:gap-4 items-center">
          <h2 className="text-sm sm:text-base lg:text-lg font-medium">Recommendation</h2>
          <p className={`text-sm sm:text-base lg:text-lg m-0 ${getRecommendationColor()}`}>
            {getRecommendation()}
          </p>
        </div>

        {/* Max Target */}
        <div className="flex justify-between md:justify-start md:gap-4 items-center">
          <h2 className="text-sm sm:text-base lg:text-lg font-medium">Max. Price Target</h2>
          <p className="text-sm sm:text-base lg:text-lg m-0">
            {maxTarget ? maxTarget.toFixed(2) : "NaN"}{" "}
            {maxTarget ? formatPercentage(maxTarget / price) : ""}
          </p>
        </div>

        {/* Mean Target */}
        <div className="flex justify-between md:justify-start md:gap-4 items-center">
          <h2 className="text-sm sm:text-base lg:text-lg font-medium">Mean Price Target</h2>
          <p className="text-sm sm:text-base lg:text-lg m-0">
            {meanTarget ? meanTarget.toFixed(2) : "NaN"}{" "}
            {meanTarget ? formatPercentage(meanTarget / price) : ""}
          </p>
        </div>

        {/* Min Target */}
        <div className="flex justify-between md:justify-start md:gap-4 items-center">
          <h2 className="text-sm sm:text-base lg:text-lg font-medium">Min. Price Target</h2>
          <p className="text-sm sm:text-base lg:text-lg m-0">
            {minTarget ? minTarget.toFixed(2) : "NaN"}{" "}
            {minTarget ? formatPercentage(minTarget / price) : ""}
          </p>
        </div>
      </div>
    </div>
  );
};
