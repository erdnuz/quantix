'use client'
import React, { useEffect, useRef } from 'react';
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
  height = 420, // define a fixed height or use parent with relative height
}) => {
  const container = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    const url = `https://www.tradingview.com/chart/?symbol=${symbol}&aff_id=${AFF_ID}`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    if (!container.current) return;

    // Clear previous content
    container.current.innerHTML = '';

    const script = document.createElement('script');
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;

    // TradingView widget config
    script.innerHTML = JSON.stringify({
      symbol: symbol,
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      style: '1',
      autosize: true,
      hide_top_toolbar: true,
      allow_symbol_change: false,
      container_id: 'tradingview_' + symbol,
    });

    container.current.appendChild(script);
  }, [symbol]);

  return (
    <div className="flex flex-col items-center gap-4 w-full" style={{ width }}>
      <div
        ref={container}
        id={'tradingview_' + symbol}
        className="w-full rounded-lg border border-border-light bg-light"
        style={{ height }}
      ></div>

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
