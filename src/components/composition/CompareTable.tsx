'use client'

import React from 'react';
import { Ranking } from '../primitive';

interface RowProps {
  metric: string;
  col: string;
  data: Record<string, any>[];
  isOverall?: boolean;
  goodBad?: boolean;
  percent?: boolean;
  type?: number;
}

const formatNumber = (number: number | string) => {
  const num = Number(number);
  if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return `${num.toFixed(2)}`;
};

const formatPercent = (number: number | string) => `${(Number(number) * 100).toFixed(2)}%`;

const Row: React.FC<RowProps> = ({
  metric,
  col,
  data,
  isOverall = false,
  goodBad = true,
  percent = false,
  type = 0,
}) => {
  return (
    <div className={`flex`}>
      <div className="flex-1 min-w-[60px]">
        <h3 className={`${isOverall ? 'subhead' : 'body'}`}>
          {metric}
        </h3>
      </div>
      <div className={`flex `} style={{ flex: data.length }}>
        {data.map((ticker, idx) => (
          <div key={idx} className="flex-1">
            <Ranking
              score={ticker[type === 0 ? `${col}_OVER` : col]}
              large={isOverall}
              goodBad={goodBad}
              number={
                type === 0
                  ? percent
                    ? formatPercent(ticker[col])
                    : formatNumber(ticker[col])
                  : undefined
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
};

interface CompareTableProps {
  currentTab: number;
  options: [string, string, boolean, boolean][][];
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

  return (
    <div className="flex flex-col gap-2">
      {/* Header Row */}
      <div className="flex gap-4 mb-2">
        <div className="flex-1 min-w-[60px] flex justify-end">
          <h2 className={`subtitle`}>{header}</h2>
        </div>
        {data.map((ticker, idx) => (
          <div key={idx} className={`flex-1 flex justify-end items-center `}>
            <h3 className={`subhead`}>{ticker?.ticker}</h3>
          </div>
        ))}
      </div>

      {/* Data Rows */}
      {options[currentTab].map((v) => {
        if (data.some((t) => t?.[v[1]] !== undefined)) {
          return (
            <Row
              key={v[1]}
              metric={v[0]}
              col={v[1]}
              data={data}
              goodBad={!v[2]}
              percent={v[3]}
              isOverall={style === 1 && v[0] === 'Overall'}
              type={style}
            />
          );
        }
        return null;
      })}
    </div>
  );
};
