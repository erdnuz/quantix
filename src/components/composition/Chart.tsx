'use client'
import React, { useEffect, useRef, useState } from 'react';
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
  height = 420,
}) => {
  const container = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  const handleClick = () => {
    const url = `https://www.tradingview.com/chart/?symbol=${symbol}&aff_id=${AFF_ID}`;
    window.open(url, '_blank');
  };

  const renderWidget = () => {
    if (!container.current) return;
    container.current.innerHTML = '';

    const script = document.createElement('script');
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;

    script.innerHTML = JSON.stringify({
      symbol: symbol,
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: theme,
      style: '1',
      autosize: true,
      hide_top_toolbar: true,
      allow_symbol_change: false,
      container_id: 'tradingview_' + symbol,
    });

    container.current.appendChild(script);
  };

  useEffect(() => {
    renderWidget();

    // Listen for changes to prefers-color-scheme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => setTheme(e.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', listener);

    return () => {
      mediaQuery.removeEventListener('change', listener);
    };
  }, [symbol, theme, renderWidget]);

  return (
    <div className="flex flex-col items-center gap-4 w-full" style={{ width }}>
      <div
        ref={container}
        id={'tradingview_' + symbol}
        className="w-full rounded-lg border border-border-light dark:border-border-dark"
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
