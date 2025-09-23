import React from "react";
import { ProxyAsset } from "../../../types";

export const Card: React.FC<ProxyAsset> = ({
  ticker,
  name,
  size,
  category,
}) => {
  const formatLargeNumber = (number: number) => {
    try {
      if (number >= 1e12) return `${(number / 1e12).toFixed(1)} T`;
      if (number >= 1e9) return `${(number / 1e9).toFixed(1)} B`;
      if (number >= 1e6) return `${(number / 1e6).toFixed(1)} M`;
      if (number >= 1e3) return `${(number / 1e3).toFixed(1)} K`;
      return `${number.toFixed(0)}`;
    } catch {
      return number.toString();
    }
  };

  return (
    <div className="
      flex flex-col items-center gap-2 p-4 sm:p-6 
      border border-border-light dark:border-border-dark 
      rounded-lg max-w-[180px] cursor-pointer 
      shadow-lg
      bg-surface-light dark:bg-surface-dark 
      hover:bg-surface-light-hover dark:hover:bg-surface-dark-hover
      transition-colors
    ">
      <h2 className="text-lg font-semibold truncate text-primary-light dark:text-primary-dark">{ticker}</h2>
      <h1 className="text-xl font-bold truncate max-w-[160px] text-primary-light dark:text-primary-dark">{name}</h1>
      <p className="text-sm truncate max-w-[180px] text-secondary-light dark:text-secondary-dark">{category}</p>
      <p className="text-sm truncate max-w-[180px] text-secondary-light dark:text-secondary-dark">${size?formatLargeNumber(size): size}</p>
    </div>
  );
};
