'use client'

import React from 'react';
import { Ranking } from '../primitive';
import { AssetTab, FullETF, FullStock } from '../../../types';
import { RankingOption } from './RankingTable';

interface CompareTableProps<T> {
  currentTab: AssetTab;
  options: Partial<Record<AssetTab, RankingOption<T>[]>>;
  data?: T[];
  style?: number;
  header?: string;
}

export function CompareTable<T extends FullStock | FullETF>({
  currentTab,
  options,
  data = [],
  style = 0,
  header = '',
}: CompareTableProps<T>) {
  if (!data.length) return null;

  const formatNumber = (number: number | string) => {
    const num = Number(number);
    if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return `${num.toFixed(2)}`;
  };

  const formatPercent = (number: number | string) => `${(Number(number) * 100).toFixed(2)}%`;

  return (
    <div className="flex flex-col gap-1 sm:gap-2 w-full">
      {/* Header Row */}
      <div
        className="grid w-full gap-2 sm:gap-4 items-center font-semibold"
        style={{
          gridTemplateColumns: `80px repeat(${data.length}, minmax(0,1fr))`,
        }}
      >
        <div className="text-base sm:text-lg md:text-2xl px-1 sm:px-2">{header}</div>
        {data.map((ticker, idx) => (
          <div key={idx} className="flex justify-left sm:justify-center items-center px-1 sm:px-2">
            <h3 className="text-sm sm:text-base truncate">{ticker?.ticker}</h3>
          </div>
        ))}
      </div>

      {/* Data Rows */}
      {options[currentTab]?.map((v) => {
        if (!data.some((t) => t?.[v.column] !== undefined)) return null;

        return (
          <div
            key={v.column as string}
            className="grid w-full gap-2 sm:gap-4 items-end"
            style={{
              gridTemplateColumns: `80px repeat(${data.length}, minmax(0,1fr))`,
            }}
          >
            {/* Metric */}
            <div className="flex flex-col justify-end px-1 sm:px-2">
              <h3
                className={`font-bold ${
                  style === 1 && v.column === 'qOverall'
                    ? 'text-sm sm:text-base md:text-lg'
                    : 'text-xs sm:text-base'
                } truncate`}
              >
                {v.display}
              </h3>
            </div>

            {/* Data for each ticker */}
            {data.map((ticker, idx) => (
              <div key={idx} className="flex justify-end items-end px-1 sm:px-2">
                <Ranking
                  score={Number(style === 0 ? ticker[(v.column as string + 'PO') as keyof T] : ticker[v.column])}
                  large={style === 1 && v.column === 'qOverall'}
                  goodBad={v.goodBad}
                  number={
                    style === 0
                      ? v.percent
                        ? formatPercent(Number(ticker[v.column]))
                        : formatNumber(Number(ticker[v.column]))
                      : undefined
                  }
                />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};
