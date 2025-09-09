'use client'
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createChart } from 'lightweight-charts';

export function CompareChart({ lines, loaded}) {
  const chartContainer = useRef(null);
  const [prevRange, setPrevRange] = useState(null);
  const memoizedLines = useMemo(() => lines, [JSON.stringify(lines)]);
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
    if (!chartContainer.current) return;

    const newChart = createChart(chartContainer.current, {
      layout: {
        textColor: currentTheme === 'light' ? '#000' : '#fff',
        background: { type: 'solid', color: currentTheme === 'light' ? '#fff' : '#1e1e1e' },
      },
      width: chartContainer.current.clientWidth,
      height: chartContainer.current.clientHeight,
    });

    const series = {};
    const colorPalette = [
      { r: 255, g: 90, b: 0 },
      { r: 80, g: 255, b: 0 },
      { r: 0, g: 220, b: 255 },
      { r: 255, g: 0, b: 255 },
      { r: 80, g: 0, b: 255 },
    ];

    Object.keys(memoizedLines).forEach((label, index) => {
      const data = memoizedLines[label].sort((a, b) => new Date(a.time) - new Date(b.time));
      const { r, g, b } = colorPalette[index % colorPalette.length];

      series[label] = newChart.addAreaSeries({
        lineColor: `rgba(${r}, ${g}, ${b}, 1)`,
        topColor: `rgba(${r}, ${g}, ${b}, 0.3)`,
        bottomColor: `rgba(${r}, ${g}, ${b}, 0)`,
        title: label,
        priceFormat: {
          type: 'custom',
          formatter: (price) => `${(100 * price).toFixed(2)}%`,
        },
      });

      series[label].setData(data);
    });

    newChart.applyOptions({
      rightPriceScale:{
        visible: true,
        borderVisible: false,
        scaleMargins: { top: 0.02, bottom: 0.02 }, // Tighten vertical margins
        entireTextOnly: true, // Removes extra padding
        alignLabels: true,
        minimumWidth: 0, // Aligns labels to reduce space
      },
      leftPriceScale: { visible: false },
      timeScale: { borderVisible: false, secondsVisible: false },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
    });

    


    if (!chartContainer.current) return;
    const resizeObserver = new ResizeObserver(() => {
      newChart.resize(chartContainer.current.clientWidth, chartContainer.current.clientHeight);
    });
    resizeObserver.observe(chartContainer.current);


    // Run on changes
    const interval = setInterval(() => {
      const scale = newChart.timeScale()
      const visibleRange = scale.getVisibleLogicalRange();
      
      // If the visible range changes
      if (visibleRange && (!prevRange || visibleRange.from !== prevRange.from)) {
        setPrevRange(visibleRange);
        const from = scale.coordinateToTime(scale.logicalToCoordinate( Math.floor(0.94*visibleRange.from + 0.06*visibleRange.to)));
        Object.keys(memoizedLines).forEach((label) => {
          const data = memoizedLines[label].sort((a, b) => new Date(a.time) - new Date(b.time));
          const normalizedData = normalizeDataByFirstVisibleValue(data, from); // Set to one shortly after
          if (normalizedData) {
            series[label].setData(normalizedData);
          }
        });
      }
    }, 100);



    return () => {
      newChart.remove();
      resizeObserver.disconnect();
      clearInterval(interval);
    };
  }, [loaded, currentTheme]);

  function normalizeDataByFirstVisibleValue(data, visibleRangeFrom) {
    
    const firstVisiblePoint = data.find((point) => {return point.time > visibleRangeFrom}) || data[0]
    if (firstVisiblePoint) {
      const firstVisibleValue = firstVisiblePoint.value || 0.01;
      return data.map((point) => ({
        time: point.time,
        value: (point.value / firstVisibleValue) - 1,
      }));
    }
  }

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
