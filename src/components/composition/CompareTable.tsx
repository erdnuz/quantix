'use client'

import React from 'react';
import { Ranking } from '../primitive';
import { AssetTab } from '../../../types';
import { RankingOption } from './RankingTable';

interface CompareTableProps {
  currentTab: AssetTab;
  options: Partial<Record<AssetTab, RankingOption[]>>;
  data?: Record<string, any>[];
  style?: number;
  header?: string;
}

export const CompareTable: React.FC<CompareTableProps> = ({
  currentTab,
  options,
  data = [],
  style = 0,
  header = '',
}) => {
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

  const columns = `140px repeat(${data.length}, 1fr)`; // metric + each ticker

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Header Row */}
      <div className="grid w-full gap-4 items-center font-semibold" style={{ gridTemplateColumns: columns }}>
        <div className="text-2xl">{header}</div>
        {data.map((ticker, idx) => (
          <div key={idx} className="flex justify-center items-center">
            <h3 className="subhead">{ticker?.ticker}</h3>
          </div>
        ))}
      </div>

      {/* Data Rows */}
      {options[currentTab]?.map((v) => {
        if (!data.some((t) => t?.[v.column] !== undefined)) return null;

        return (
          <div
            key={v.column}
            className="grid w-full gap-4 items-end"
            style={{ gridTemplateColumns: columns }}
          >
            {/* Metric */}
            <div className="flex flex-col justify-end">
              <h3 className={style === 1 && v.column === 'qOverall' ? 'text-lg font-bold' : 'text-base font-bold'}>
                {v.display}
              </h3>
            </div>

            {/* Data for each ticker */}
            {data.map((ticker, idx) => (
              <div key={idx} className="flex justify-end items-end">
                <Ranking
                  score={style === 0 ? ticker[v.column + 'PO'] : ticker[v.column]}
                  large={style === 1 && v.column === 'qOverall'}
                  goodBad={v.goodBad}
                  number={
                    style === 0
                      ? v.percent
                        ? formatPercent(ticker[v.column])
                        : formatNumber(ticker[v.column])
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
