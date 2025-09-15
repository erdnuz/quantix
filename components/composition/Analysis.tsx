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
    const colorClass = parseFloat(percentage) >= 0 ? "text-green-600" : "text-red-600";
    return <span className={`${colorClass}`}>({percentage}%)</span>;
  };

  // Determine recommendation text & color
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
    if (rec < 4) return "text-gray-400"; // hold
    if (rec < 6) return "text-red-600";
    return "text-gray-500";
  };

  return (
    <div
      className={`border border-gray-300 rounded-xl p-5 m-4 flex flex-col gap-3 ${className}`}
    >
      {/* Header */}
      <div className="flex justify-between gap-3">
        <h3 className="text-lg font-semibold m-0 flex-1">Analysis</h3>
        <p className="text-sm text-gray-500 mb-1 flex-1">{numAnalysts} Analysts</p>
      </div>

      {/* Recommendation */}
      <div className="flex flex-1 gap-3">
        <h2 className="text-base font-medium mb-1 flex-1">Recommendation</h2>
        <p className={`text-base m-0 flex-1 ${getRecommendationColor()}`}>
          {getRecommendation()}
        </p>
      </div>

      {/* Max Target */}
      <div className="flex flex-1 gap-3">
        <h2 className="text-base font-medium mb-1 flex-1">Max. Price Target</h2>
        <p className="text-base m-0 flex-1">
          {maxTarget ? maxTarget.toFixed(2) : "NaN"}{" "}
          {maxTarget ? formatPercentage(maxTarget / price) : ""}
        </p>
      </div>

      {/* Mean Target */}
      <div className="flex flex-1 gap-3">
        <h2 className="text-base font-medium mb-1 flex-1">Mean Price Target</h2>
        <p className="text-base m-0 flex-1">
          {meanTarget ? meanTarget.toFixed(2) : "NaN"}{" "}
          {meanTarget ? formatPercentage(meanTarget / price) : ""}
        </p>
      </div>

      {/* Min Target */}
      <div className="flex flex-1 gap-3">
        <h2 className="text-base font-medium mb-1 flex-1">Min. Price Target</h2>
        <p className="text-base m-0 flex-1">
          {minTarget ? minTarget.toFixed(2) : "NaN"}{" "}
          {minTarget ? formatPercentage(minTarget / price) : ""}
        </p>
      </div>
    </div>
  );
};
