'use client';
import React, { useEffect, useRef, useState } from 'react';
import {
  AreaSeries,
  AreaStyleOptions,
  ColorType,
  createChart,
  DeepPartial,
  IChartApi,
  ISeriesApi,
  Logical,
  SeriesOptionsCommon,
  Time,
  TimeChartOptions,
} from 'lightweight-charts';

interface LinePoint {
  time: Time;
  value: number;
}

interface CompareChartProps {
  lines: Record<string, LinePoint[]>;
}

export const CompareChart: React.FC<CompareChartProps> = ({ lines }) => {
  const chartContainer = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesMap = useRef<Record<string, ISeriesApi<'Area'>>>({});
  const [visibleRange, setVisibleRange] = useState<{ from: Logical; to: Logical } | null>(null);
  const [isDark, setIsDark] = useState<boolean>(
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  const colors = ['#1D4ED8', '#EF4444', '#22C55E', '#FBBF24', '#800080'];

  const hexToRgba = (hex: string, alpha: number) => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  };

  // Watch for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Initialize chart and series
  useEffect(() => {
    if (!chartContainer.current) return;

    const chart = createChart(chartContainer.current, {
  width: chartContainer.current.clientWidth,
  height: chartContainer.current.clientHeight,
  layout: {
    textColor: isDark ? '#f3f4f6' : '#1a1f40',        // light/dark text
    background: { color: isDark ? '#1a1f40' : '#f3f4f6' }, // light/dark background
  },
  rightPriceScale: {
    visible: true,
    borderVisible: false,
    borderColor: isDark ? '#2D2D2D' : '#E2E8F0',       // subtle border color
    scaleMargins: { top: 0.1, bottom: 0.1 },
  },
  timeScale: {
    borderVisible: false,
    secondsVisible: false,
    borderColor: isDark ? '#2D2D2D' : '#E2E8F0',
  },
  grid: {
    vertLines: { color: isDark ? '#2D2D2D' : '#E2E8F0' },
    horzLines: { color: isDark ? '#2D2D2D' : '#E2E8F0' },
  },
} as DeepPartial<TimeChartOptions>);


    chartRef.current = chart;

    // Add each line series
    Object.keys(lines).forEach((label, idx) => {
      const series = chart.addSeries(AreaSeries, {
        lineColor: colors[idx % colors.length],
        topColor: hexToRgba(colors[idx % colors.length], 0.3),
        bottomColor: hexToRgba(colors[idx % colors.length], 0),
        lineWidth: 2,
        title: label,
      } as DeepPartial<AreaStyleOptions & SeriesOptionsCommon>);

      series.applyOptions({
        priceFormat: {
          type: 'custom',
          formatter: (value: number) => `${((value - 1) * 100).toFixed(2)}%`,
        },
      });

      series.setData(lines[label].slice().sort((a, b) => (a.time as number) - (b.time as number)));
      seriesMap.current[label] = series;
    });

    // Add zero line
    const zeroLineSeries = chart.addSeries(AreaSeries, {
      lineColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
      lineWidth: 1,
      topColor: 'rgba(0,0,0,0)',
      bottomColor: 'rgba(0,0,0,0)',
    });
    zeroLineSeries.setData([
      { time: lines[Object.keys(lines)[0]][0].time, value: 1 },
      { time: lines[Object.keys(lines)[0]].slice(-1)[0].time, value: 1 },
    ]);

    const resizeObserver = new ResizeObserver(() => {
      if (chartContainer.current)
        chart.resize(chartContainer.current.clientWidth, chartContainer.current.clientHeight);
    });
    resizeObserver.observe(chartContainer.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [lines, isDark]);

  // Track visible logical range
  useEffect(() => {
    if (!chartRef.current) return;
    const interval = setInterval(() => {
      const logicalRange = chartRef.current?.timeScale().getVisibleLogicalRange();
      if (!logicalRange) return;
      setVisibleRange({ from: logicalRange.from, to: logicalRange.to });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Update series data based on visible range
  useEffect(() => {
    if (!chartRef.current) return;

    const range = chartRef.current.timeScale().getVisibleRange();
    const fromTime = range?.from;
    const toTime = range?.to;
    if (!fromTime || !toTime) return;

    Object.keys(lines).forEach((label) => {
      const sortedData = lines[label].slice().sort((a, b) => (a.time as number) - (b.time as number));
      const firstVisiblePoint = sortedData.find((p) => p.time >= fromTime) || sortedData[0];
      const firstValue = firstVisiblePoint?.value || 0.01;
      const normalized = sortedData.map((p) => ({ time: p.time, value: p.value / firstValue }));
      seriesMap.current[label]?.setData(normalized);
    });
  }, [lines, visibleRange]);

  return (
    <div
      ref={chartContainer}
      className="w-full h-96 border border-border-light dark:border-border-dark rounded-lg overflow-hidden"
    />
  );
};
