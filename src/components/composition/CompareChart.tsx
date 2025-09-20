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
} from 'lightweight-charts';

interface LinePoint {
  time: Time;
  value: number;
}

interface CompareChartProps {
  lines: Record<string, LinePoint[]>; // e.g. { 'Series A': [...], 'Series B': [...] }
}

export const CompareChart: React.FC<CompareChartProps> = ({ lines }) => {
  const chartContainer = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesMap = useRef<Record<string, ISeriesApi<'Area'>>>({});
  const [visibleRange, setVisibleRange] = useState<{ from: Logical; to: Logical } | null>(null);

  const colors = ['#007BFF', '#FF0000', '#00C800', '#FFA500', '#800080'];

  const hexToRgba = (hex: string, alpha: number) => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  };

  // Initialize chart and series
  useEffect(() => {
    if (!chartContainer.current) return;

    const chart = createChart(chartContainer.current, {
      width: chartContainer.current.clientWidth,
      height: chartContainer.current.clientHeight,
      layout: { textColor: '#000', background: { type: ColorType.Solid, color: '#fff' } },
      rightPriceScale: { visible: true },
      timeScale: { borderVisible: false },
      grid: {
        vertLines: { color: '#eee' },
        horzLines: { color: '#eee' },
      },
    });

    chartRef.current = chart;

    Object.keys(lines).forEach((label, idx) => {
      const series = chart.addSeries(AreaSeries, {
        lineColor: colors[idx % colors.length],
        topColor: hexToRgba(colors[idx % colors.length], 0.3),
        bottomColor: hexToRgba(colors[idx % colors.length], 0),
        lineWidth: 2,
        title: label, // This sets the "series title" for tooltips
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

    // Add a distinct 0% line
    const zeroLineSeries = chart.addSeries(AreaSeries, {
      lineColor: 'rgba(0,0,0,0.3)',
      lineWidth: 1,
      topColor: 'rgba(0,0,0,0)', // invisible fill
      bottomColor: 'rgba(0,0,0,0)',
    });
    zeroLineSeries.setData([
      { time: lines[Object.keys(lines)[0]][0].time, value: 1 }, // normalized 0%
      { time: lines[Object.keys(lines)[0]].slice(-1)[0].time, value: 1 },
    ]);

    const resizeObserver = new ResizeObserver(() => {
      if (chartContainer.current) chart.resize(chartContainer.current.clientWidth, chartContainer.current.clientHeight);
    });
    resizeObserver.observe(chartContainer.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [lines]);

  // Track visible logical range every 500ms
  useEffect(() => {
    if (!chartRef.current) return;

    const interval = setInterval(() => {
      const logicalRange = chartRef.current?.timeScale().getVisibleLogicalRange();
      if (!logicalRange) return;

      setVisibleRange({ from: logicalRange.from, to: logicalRange.to });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Update series data when visible range or lines change
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

  return <div ref={chartContainer} className="w-full h-96 border border-gray-300 rounded-lg overflow-hidden" />;
};
