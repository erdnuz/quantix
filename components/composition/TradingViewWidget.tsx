'use client'
import React, { useEffect, useRef, memo, CSSProperties } from 'react';

interface TradingViewWidgetProps {
  symbol?: string;
  theme?: 'dark' | 'light';
  width?: string;
  height?: string;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({
  symbol = "NASDAQ:AAPL",
  theme = "dark",
  width = "100%",
  height = "100%",
}) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    // Prevent duplicate script injection
    const existingScript = container.current.querySelector('script');
    if (existingScript) return;

    const script = document.createElement('script');
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval: "D",
      timezone: "Etc/UTC",
      theme,
      hide_top_toolbar: true,
      style: "1",
      locale: "en",
      allow_symbol_change: false,
      save_image: false,
      calendar: false,
      backgroundColor: theme === "dark" ? "#1e1e1e" : "#FFFFFF",
      support_host: "https://www.tradingview.com"
    });

    container.current.appendChild(script);
  }, [symbol, theme]);

  const containerStyle: CSSProperties = { height, width };

  return (
    <div
      ref={container}
      className="tradingview-widget-container w-full h-full relative"
      style={containerStyle}
    >
      <div
        className="tradingview-widget-container__widget w-full h-[calc(100%-8rem)]"
      ></div>
    </div>
  );
};

export default memo(TradingViewWidget);
