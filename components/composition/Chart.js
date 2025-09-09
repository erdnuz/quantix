'use client'
import React, { useState, useEffect } from 'react';
import TradingViewWidget from './TradingViewWidget'; // Assuming the TradingViewWidget is in the same directory
import { Button } from '../primitive';

const AFF_ID = 135175;

export function Chart({ symbol = "AAPL", width = "100%", height = "100%" }) {
  const [currentTheme, setCurrentTheme] = useState(document.documentElement.getAttribute('data-theme'));

  useEffect(() => {
    // Watch for changes in the data-theme attribute and update the state
    const themeObserver = new MutationObserver(() => {
      setCurrentTheme(document.documentElement.getAttribute('data-theme'));
    });

    // Start observing the <html> element for changes to the 'data-theme' attribute
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // Clean up observer on component unmount
    return () => {
      themeObserver.disconnect();
    };
  }, []);

  const handleClick = () => {
    // Construct the URL with the ticker and AFF_ID
    const url = `https://www.tradingview.com/chart/?symbol=${symbol}&aff_id=${AFF_ID}`;
    // Open the URL in a new tab
    window.open(url, '_blank');
};

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '16px',
        width,
        height,
        position: 'relative', // Ensure the container's size is respected
      }}
    >
      {/* Dark Theme Widget */}
      {currentTheme === "dark" && (
        <div
          style={{
            width: '100%',  // Make the widget fill its container
            height: '100%', // Make the widget fill its container
            display: 'block', // Ensure the widget is visible
          }}
        >
          <TradingViewWidget symbol={symbol} theme="dark" width="100%" height="100%" />
        </div>
      )}

      {/* Light Theme Widget */}
      {currentTheme === "light" && (
        <div
          style={{
            width: '100%',  // Make the widget fill its container
            height: '100%', // Make the widget fill its container
            display: 'block', // Ensure the widget is visible
          }}
        >
          <TradingViewWidget symbol={symbol} theme="light" width="100%" height="100%" />
        </div>
      )}
      <div style={{width: '50%'}} >
      <Button type="brand" label="Open in SuperCharts" onClick={handleClick}/>
      </div>
      
    </div>
  );
}
