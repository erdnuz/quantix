'use client'
import React, { useEffect, useRef, useState } from 'react';
import { createChart, ISeriesApi, LineData, AreaSeriesPartialOptions } from 'lightweight-charts';

interface LineSeriesData {
  time: string | number;
  value: number;
}

interface PlotChartProps {
  lines?: Record<string, LineSeriesData[]>;
  height?: number;
}

export const PlotChart: React.FC<PlotChartProps> = ({ lines = {}, height = 400 }) => {
  const chartContainer = useRef<HTMLDivElement | null>(null);
  const [currentTheme, setCurrentTheme] = useState('light');

  // Observe theme changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      setCurrentTheme(document.documentElement.getAttribute('data-theme') || 'light');
    }

    const themeObserver = new MutationObserver(() => {
      setCurrentTheme(document.documentElement.getAttribute('data-theme') || 'light');
    });

    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => themeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!chartContainer.current || Object.keys(lines).length === 0) return;

    const chart = createChart(chartContainer.current, {
      layout: {
        textColor: currentTheme === 'light' ? '#000' : '#fff',
        background: { color: currentTheme === 'light' ? '#fff' : '#1e1e1e' },
        fontFamily: 'Inter, sans-serif',
      },
      width: chartContainer.current.clientWidth,
      height,
    });

    const colorPalette = [
      { r: 255, g: 0, b: 0 },
      { r: 0, g: 100, b: 200 },
      { r: 0, g: 200, b: 100 },
      { r: 200, g: 0, b: 255 },
    ];

    const seriesMap: Record<string, ISeriesApi<'Area', LineData>> = {};

    Object.keys(lines).forEach((label, index) => {
      const data = lines[label].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
      const { r, g, b } = colorPalette[index % colorPalette.length];

      const areaSeriesOptions: AreaSeriesPartialOptions = {
        lineColor: `rgba(${r}, ${g}, ${b}, 1)`,
        topColor: `rgba(${r}, ${g}, ${b}, 0.6)`,
        bottomColor: `rgba(${r}, ${g}, ${b}, 0)`,
        title: label,
        priceScaleId: ['left', 'right'][index % 2],
        priceFormat: {
          type: 'custom',
          formatter: (price: number) =>
            [() => `%${(100 * price).toFixed(2)}`, () => `$${price.toFixed(0)}`][index % 2],
        },
      };

      seriesMap[label] = (chart as any).addAreaSeries(areaSeriesOptions);
      seriesMap[label].setData(data as any);
    });

    chart.timeScale().fitContent();

    // Configure scales and grid
    chart.applyOptions({
      rightPriceScale: { visible: true, borderVisible: false, scaleMargins: { top: 0.1, bottom: 0.1 } },
      leftPriceScale: { visible: true, borderVisible: false, scaleMargins: { top: 0.1, bottom: 0.1 } },
      timeScale: { borderVisible: false, secondsVisible: false },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
    });

    // Handle resizing
    const resizeObserver = new ResizeObserver(() => {
      chart.resize(chartContainer.current!.clientWidth, chartContainer.current!.clientHeight);
    });
    resizeObserver.observe(chartContainer.current);

    return () => {
      chart.remove();
      resizeObserver.disconnect();
    };
  }, [lines, currentTheme, height]);

  return (
    <div
      ref={chartContainer}
      className="relative w-full rounded-lg border border-gray-300 overflow-hidden"
      style={{ height }}
    />
  );
};
