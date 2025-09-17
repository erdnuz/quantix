'use client'
import React from 'react';
import TradingViewWidget from './TradingViewWidget';
import { Button } from '../primitive';

const AFF_ID = 135175;

interface ChartProps {
  symbol?: string;
  width?: string | number;
  height?: string | number;
}

export const Chart: React.FC<ChartProps> = ({
  symbol = 'AAPL',
  width = '100%',
  height = '100%',
}) => {
  const handleClick = () => {
    const url = `https://www.tradingview.com/chart/?symbol=${symbol}&aff_id=${AFF_ID}`;
    window.open(url, '_blank');
  };

  return (
    <div
      className="flex flex-col justify-center items-center gap-4 w-full h-full"
      style={{ width, height }}
    >
      {/* TradingView Widget */}
      <div className="w-full h-full rounded-lg border overflow-hidden border-border-light dark:border-border-dark bg-light dark:bg-dark">
        <TradingViewWidget
          symbol={symbol}
          theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
          width="100%"
          height="100%"
        />
      </div>

      {/* Open in SuperCharts Button */}
      <div className="w-full sm:w-1/2">
        <Button
          type="brand"
          label="Open in SuperCharts"
          onClick={handleClick}
          className="w-full justify-center rounded-xl"
        />
      </div>
    </div>
  );
};
