import React, { useEffect, useRef, memo } from 'react';


function TradingViewWidget({ symbol = "NASDAQ:AAPL", theme = "dark", width="100%", height="100%"}) {
  const container = useRef();

  useEffect(() => {
    // Check if the widget has already been initialized in the same container
    const existingScript = container.current.querySelector('script');
    if (existingScript) {
      return; // Safely remove the existing script
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
          "autosize": true,
          "symbol": "${symbol}",
          "interval": "D",
          "timezone": "Etc/UTC",
          "theme": "${theme}",
          "hide_top_toolbar": true,
          "style": "1",
          "locale": "en",
          "allow_symbol_change": false,
          "save_image": false,
          "calendar": false,
          "backgroundColor": "#${theme === "dark" ? "1e1e1e" : "FFFFFF"}",
          "support_host": "https://www.tradingview.com"
        }`;

    container.current.appendChild(script);

    
    
  }, [symbol, theme]);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height, width }}>
      <div
        className="tradingview-widget-container__widget"
        style={{ height: "calc(100% - 32px)", width: "100%" }}
      >
      </div>
    </div>
  );
}

export default memo(TradingViewWidget);
