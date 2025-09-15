'use client'
import React, { useEffect, useState } from 'react';
import TradingViewWidget from './TradingViewWidget'; // Adjust path
import { Button } from '../primitive';

const AFF_ID = 135175;

interface ChartProps {
  symbol?: string;
  width?: string | number;
  height?: string | number;
}

export const Chart: React.FC<ChartProps> = ({ symbol = 'AAPL', width = '100%', height = '100%' }) => {
  const [currentTheme, setCurrentTheme] = useState<string>(
    typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') || 'light' : 'light'
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setCurrentTheme(document.documentElement.getAttribute('data-theme') || 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => observer.disconnect();
  }, []);

  const handleClick = () => {
    const url = `https://www.tradingview.com/chart/?symbol=${symbol}&aff_id=${AFF_ID}`;
    window.open(url, '_blank');
  };

  return (
    <div
      className="flex flex-col justify-center items-center gap-4 relative"
      style={{ width, height }}
    >
      <div className="w-full h-full">
        <TradingViewWidget symbol={symbol} theme={currentTheme === 'dark' ? 'dark' : 'light'} width="100%" height="100%" />
      </div>

      <div className="w-1/2">
        <Button type="brand" label="Open in SuperCharts" onClick={handleClick} />
      </div>
    </div>
  );
};
