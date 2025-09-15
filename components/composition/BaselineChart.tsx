'use client'
import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, BaselineData } from 'lightweight-charts';

type ActionMap = Record<string, Record<string, number>>;

interface BaselineChartProps {
  data: BaselineData[];
  actions?: ActionMap;
}

export const BaselineChart: React.FC<BaselineChartProps> = ({ data, actions }) => {
  const chartContainer = useRef<HTMLDivElement | null>(null);
  const [chart, setChart] = useState<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Baseline'> | null>(null);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');

  // Detect theme changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const initialTheme = (document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'light';
      setCurrentTheme(initialTheme);

      const observer = new MutationObserver(() => {
        setCurrentTheme(document.documentElement.getAttribute('data-theme') as 'light' | 'dark');
      });

      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
      return () => observer.disconnect();
    }
  }, []);

  // Initialize chart
  useEffect(() => {
    if (!chartContainer.current || chart) return;

    const newChart = createChart(chartContainer.current, {
      layout: {
        textColor: currentTheme === 'light' ? '#000' : '#fff',
        background: { color: currentTheme === 'light' ? '#fff' : '#1e1e1e' },
      },
      width: chartContainer.current.clientWidth,
      height: chartContainer.current.clientHeight,
      rightPriceScale: {
        visible: true,
        borderVisible: false,
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: { borderVisible: false, secondsVisible: false },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
    });

    const baselineSeries = (newChart as any).addBaselineSeries({
      lineColor: 'white',
      topColor: 'green',
      bottomColor: 'red',
      priceFormat: { type: 'custom', formatter: (price: number) => `${(100 * price).toFixed(2)}%` },
    });



    setChart(newChart);
    seriesRef.current = baselineSeries;

    const resizeObserver = new ResizeObserver(() => {
      if (chartContainer.current) {
        newChart.resize(chartContainer.current.clientWidth, chartContainer.current.clientHeight);
      }
    });

    resizeObserver.observe(chartContainer.current);

    return () => {
      newChart.remove();
      resizeObserver.disconnect();
    };
  }, [chartContainer, chart, currentTheme]);

  // Update data
  useEffect(() => {
    if (!seriesRef.current || !data) return;
    const sortedData = [...data].sort((a, b) => new Date(a.time as string).getTime() - new Date(b.time as string).getTime());

    seriesRef.current.setData(sortedData);
    chart?.timeScale().fitContent();
  }, [data, chart]);

  // Update theme dynamically
  useEffect(() => {
    if (!chart) return;
    chart.applyOptions({
      layout: {
        textColor: currentTheme === 'light' ? '#000' : '#fff',
        background: { color: currentTheme === 'light' ? '#fff' : '#1e1e1e' },
      },
    });
  }, [currentTheme, chart]);

  // Update markers
  useEffect(() => {
    if (!seriesRef.current || !actions) return;

    const limitedMarkers = Object.entries(actions)
      .flatMap(([ticker, tickerActions]) =>
        Object.entries(tickerActions).map(([time, shares]) => ({
          date: new Date(time).toISOString().split('T')[0],
          time,
          position: shares > 0 ? 'belowBar' : 'aboveBar',
          color: shares > 0 ? '#089981' : '#f23645',
          shape: 'circle' as const,
          type: shares > 0 ? 'buy' : 'sell',
          text: '',
        }))
      )
      .reduce<Record<string, any[]>>((acc, marker) => {
        const key = `${marker.date}-${marker.type}`;
        if (!acc[key]) acc[key] = [];
        if (acc[key].length < 3) acc[key].push(marker);
        return acc;
      }, {});

    (seriesRef.current as any).setMarkers(Object.values(limitedMarkers).flat());
  }, [actions]);

  return (
    <div
      ref={chartContainer}
      className="relative w-full h-96 border border-gray-300 rounded-lg overflow-hidden"
    />
  );
};
