'use client'
import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';

export function PlotChart({ lines = {} }) {
  const chartContainer = useRef(null);
  const [loaded, setLoaded] = useState(false)
  const [currentTheme, setCurrentTheme] = useState('light'); // Default theme is light
    
  useEffect(() => {
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
    if ((!chartContainer.current)) return; // Ensure the container is available

    if (Object.keys(lines).length > 0) {
      setLoaded(true);
    } else {
      setLoaded(false)
    }

    
    

    const newChart = createChart(chartContainer.current, {
      layout: {
        textColor: currentTheme === 'light' ? '#000' : '#fff',
        margin: '16px',
        background: { type: 'solid', color: currentTheme === 'light' ? '#fff' : '#1e1e1e' },
      },
      width: chartContainer.current.clientWidth,
      height: chartContainer.current.clientHeight,
    });
    

    // Dynamically add series based on the lines prop
    const series = {};
    const colorPalette = [
      {r: 255, g:0, b:0}, // rgb(0, 97, 207)
      {r: 0, g:100, b:200}]; // Define more colors as needed
    
    Object.keys(lines).forEach((label, index) => {
      const data = lines[label];
      const sortedData = data.sort((a, b) => new Date(a.time) - new Date(b.time));

      if (data) {
        // Generate color from the palette or fallback to a default
        const {r, g, b} = colorPalette[index % colorPalette.length];
        
        series[label] = newChart.addAreaSeries({
          lineColor: `rgba(${r}, ${g}, ${b}, 1)`,
          topColor: `rgba(${r}, ${g}, ${b}, 0.6)`, // Adjust transparency dynamically
          bottomColor: `rgba(${r}, ${g}, ${b}, 0)`,
          title: label,
          priceScaleId: ['left', 'right'][index],
          priceFormat: {
              type: 'custom',
              formatter: 
                   [(price) => `%${(100 * price).toFixed(2)}`, (price) => `$${price.toFixed(0)}`][index],
          },
      });
      

        // Normalize data based on the first visible value
        series[label].setData(sortedData);
      }
    });

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
      leftPriceScale: {
        visible: true,
        borderVisible: false,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
          left: 0,
        },
      },
      timeScale: {
        borderVisible: false,
        secondsVisible: false, // Hides seconds if not needed
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
    });

    // Resize observer to handle resizing of the chart container
    const resizeObserver = new ResizeObserver(() => {
      newChart.resize(chartContainer.current.clientWidth, chartContainer.current.clientHeight);
    });
    resizeObserver.observe(chartContainer.current);

    

    
    
    return () => {
      newChart.remove();
      resizeObserver.disconnect();// Stop the interval when component is unmounted
    };
  }, [lines, currentTheme]);


  return (
    <div
      ref={chartContainer}
      style={{
        position: 'relative',
        height: '400px', // Use a default height if not provided
        width: '100%',
        border: '1px solid var(--sds-color-border-default-default)',
        borderRadius: '12px',
        overflow: 'clip',
      }}
    >
      {/* Chart will render inside this container */}
    </div>
  );
}
