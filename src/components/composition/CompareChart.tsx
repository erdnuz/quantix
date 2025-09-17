'use client'
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createChart, IChartApi, ISeriesApi, Time, Logical, AreaData } from 'lightweight-charts';

interface LinePoint {
  time: Time; // string | number | business time
  value: number;
}

interface CompareChartProps {
  lines: Record<string, LinePoint[]>;
  loaded: boolean;
}

export const CompareChart: React.FC<CompareChartProps> = ({ lines, loaded }) => {
  const chartContainer = useRef<HTMLDivElement | null>(null);
  const [prevRange, setPrevRange] = useState<{ from: number; to: number } | null>(null);
  const memoizedLines = useMemo(() => lines, [JSON.stringify(lines)]);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');

  // Watch for theme changes
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const initialTheme = (document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'light';
    setCurrentTheme(initialTheme);

    const themeObserver = new MutationObserver(() => {
      setCurrentTheme(document.documentElement.getAttribute('data-theme') as 'light' | 'dark');
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => themeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!chartContainer.current) return;

    const chart: IChartApi = createChart(chartContainer.current, {
      layout: {
        textColor: currentTheme === 'light' ? '#000' : '#fff',
        background: { color: currentTheme === 'light' ? '#fff' : '#1e1e1e' },
      },
      width: chartContainer.current.clientWidth,
      height: chartContainer.current.clientHeight,
    });

    const seriesMap: Record<string, ISeriesApi<'Area'>> = {};
    const colors = [
      { r: 255, g: 90, b: 0 },
      { r: 80, g: 255, b: 0 },
      { r: 0, g: 220, b: 255 },
      { r: 255, g: 0, b: 255 },
      { r: 80, g: 0, b: 255 },
    ];

    Object.keys(memoizedLines).forEach((label, idx) => {
      const data = memoizedLines[label].sort((a, b) => new Date(a.time as string).getTime() - new Date(b.time as string).getTime());
      const { r, g, b } = colors[idx % colors.length];

      // cast chart as any because lightweight-charts types don't include addAreaSeries
      seriesMap[label] = (chart as any).addAreaSeries({
        lineColor: `rgba(${r}, ${g}, ${b}, 1)`,
        topColor: `rgba(${r}, ${g}, ${b}, 0.3)`,
        bottomColor: `rgba(${r}, ${g}, ${b}, 0)`,
        title: label,
        priceFormat: { type: 'custom', formatter: (price: number) => `${(100 * price).toFixed(2)}%` },
      });

      seriesMap[label].setData(data);
    });

    chart.applyOptions({
      rightPriceScale: {
        visible: true,
        borderVisible: false,
        scaleMargins: { top: 0.02, bottom: 0.02 },
        entireTextOnly: true,
        alignLabels: true,
        minimumWidth: 0,
      },
      leftPriceScale: { visible: false },
      timeScale: { borderVisible: false, secondsVisible: false },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
    });

    const resizeObserver = new ResizeObserver(() => {
      if (chartContainer.current) {
        chart.resize(chartContainer.current.clientWidth, chartContainer.current.clientHeight);
      }
    });
    resizeObserver.observe(chartContainer.current);

    const interval = setInterval(() => {
      const visibleRange = chart.timeScale().getVisibleLogicalRange();
      if (visibleRange && (!prevRange || visibleRange.from !== prevRange.from)) {
        setPrevRange(visibleRange);
        const fromLogical = Math.floor(0.94 * visibleRange.from + 0.06 * visibleRange.to);
        const from = chart.timeScale().coordinateToTime(fromLogical as Logical);
        if (from) {
          Object.keys(memoizedLines).forEach((label) => {
            const data = memoizedLines[label].sort((a, b) => new Date(a.time as string).getTime() - new Date(b.time as string).getTime());
            const normalized = normalizeDataByFirstVisibleValue(data, from);
            if (normalized) seriesMap[label].setData(normalized as AreaData<Time>[]);
          });

        }
        
      }
    }, 100);

    return () => {
      chart.remove();
      resizeObserver.disconnect();
      clearInterval(interval);
    };
  }, [loaded, currentTheme]);

  const normalizeDataByFirstVisibleValue = (data: LinePoint[], visibleRangeFrom: Time) => {
    const firstPoint = data.find((p) => p.time > visibleRangeFrom) || data[0];
    if (!firstPoint) return;
    const firstValue = firstPoint.value || 0.01;
    return data.map((p) => ({ time: p.time, value: p.value / firstValue - 1 }));
  };

  return (
    <div className="relative w-full h-96 border border-gray-300 rounded-lg overflow-clip" ref={chartContainer} />
  );
};
