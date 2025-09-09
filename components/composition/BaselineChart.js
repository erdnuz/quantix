'use client'
import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';

export function BaselineChart({ data, actions }) {
  const chartContainer = useRef(null);
  const [chart, setChart] = useState(null);
  const seriesRef = useRef(null);
  const [currentTheme, setCurrentTheme] = useState('light'); // Default theme is light
        
    useEffect(() => {
        // Ensure document is available on the client side
        if (typeof document !== 'undefined') {
            const initialTheme = document.documentElement.getAttribute('data-theme') || 'light';
            setCurrentTheme(initialTheme);
        }
        const themeObserver = new MutationObserver(() => {
            if (typeof document !== 'undefined') {
                setCurrentTheme(document.documentElement.getAttribute('data-theme'));
            }
        });
  
        // Start observing the <html> element for changes to the 'data-theme' attribute
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  
        // Clean up observer on component unmount
        return () => {
            themeObserver.disconnect();
        };
    }, []);

  useEffect(() => {
    if (!chartContainer.current || !data) return; // Ensure the container and data are available

    // Create the chart
    const newChart = createChart(chartContainer.current, {
      layout: {
        textColor: currentTheme === 'light' ? '#000' : '#fff',
        background: { type: 'solid', color: currentTheme === 'light' ? '#fff' : '#1e1e1e' },
      },
      width: chartContainer.current.clientWidth,
      height: chartContainer.current.clientHeight,
    });

    setChart(newChart);

    // Sort the data before using it
    const sortedData = [...data].sort((a, b) => new Date(a.time) - new Date(b.time));

    // Create and store series reference
    const baselineSeries = newChart.addBaselineSeries({
      lineColor: 'white',
      topColor: 'green',
      bottomColor: 'red',
      priceFormat: {
        type: 'custom',
        formatter: (price) => `${(100 * price).toFixed(2)}%`,
      },
    });

    baselineSeries.setData(sortedData);
    seriesRef.current = baselineSeries;

    const markers = actions
  ? Object.entries(actions)
      .flatMap(([ticker, data]) => 
        Object.entries(data).map(([time, shares]) => ({
          date: new Date(time).toISOString().split('T')[0], // Extract date (YYYY-MM-DD)
          time,
          position: shares > 0 ? 'belowBar' : 'aboveBar',
          color: shares > 0 ? '#089981' : '#f23645',
          shape: 'circle',
          type: shares > 0 ? 'buy' : 'sell',
          text: "",
        }))
      )
      .reduce((acc, marker) => {
        const key = `${marker.date}-${marker.type}`;
        if (!acc[key]) acc[key] = [];
        if (acc[key].length < 3) acc[key].push(marker); // Limit to max 3 per type per day
        return acc;
      }, {})
  : {};

  const limitedMarkers = Object.values(markers).flat().sort((a, b) => new Date(a.time) - new Date(b.time));




    
    // After setting up the series:
    baselineSeries.setMarkers(limitedMarkers);
    

    // Fit the time scale to the data
    newChart.timeScale().fitContent();

    // Adjust chart options
    newChart.applyOptions({
      rightPriceScale: {
        visible: true,
        borderVisible: false,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderVisible: false,
        secondsVisible: false,
      },
      grid: {
        vertLines: { 
          visible: false // Keep thin for subtle visibility
        }, // Keep vertical lines hidden for a cleaner look
        horzLines: { 
          visible: false // Keep thin for subtle visibility
        },
      }
      
    });

    // Resize observer to handle resizing of the chart container
    const resizeObserver = new ResizeObserver(() => {
      if (chartContainer.current) {
        newChart.resize(chartContainer.current.clientWidth, chartContainer.current.clientHeight);
      }
    });

    resizeObserver.observe(chartContainer.current);

    // Cleanup function
    return () => {
      newChart.remove();
      resizeObserver.disconnect();
    };
  }, [data, currentTheme]);

  return (
    <div
      ref={chartContainer}
      style={{
        position: 'relative',
        height: '400px',
        width: '100%',
        border: '1px solid var(--sds-color-border-default-default)',
        borderRadius: '12px',
        overflow: 'clip',
      }}
    />
  );
}
