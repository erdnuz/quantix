import React, { useEffect, useRef, memo } from 'react';

const TradingViewWidget = ({ symbol = 'NASDAQ:AAPL', theme = 'light', width = '100%', height = '100%' }) => {
  const container = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol,
      theme,
      autosize: true,
      interval: 'D',
      timezone: 'Etc/UTC',
      locale: 'en',
      hide_top_toolbar: true,
      style: '1',
      backgroundColor: theme === 'dark' ? '#1e1e1e' : '#F7F7F7',
      borderColor: theme === 'dark' ? 'none' : 'none',
      gridColor: theme === 'dark' ? '#A2A2A2' : '#2E2E2E',
      save_image: false,
      calendar: false,
      allow_symbol_change: false,
      support_host: 'https://www.tradingview.com',
    });
    if (container.current) {
      (container.current as any).appendChild(script);
    }
  }, [symbol, theme]);

  return (
    <div
      ref={container}
      style={{ width, height }}
      className="relative rounded-lg overflow-hidden shadow-lg"
    >
      <div className="absolute inset-0">
        {/* TradingView widget will mount here */}
      </div>
    </div>
  );
};

export default memo(TradingViewWidget);
