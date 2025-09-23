'use client';
import React, { useEffect, useRef, useState } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  BaselineData,
  BaselineSeries,
  DeepPartial,
  TimeChartOptions,
  Logical,
  LineSeries,
} from 'lightweight-charts';


interface BaselineChartProps {
  data: {
    portfolio: BaselineData[];
    market: BaselineData[];
  };
}

export const BaselineChart: React.FC<BaselineChartProps> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const baselineSeriesRef = useRef<ISeriesApi<'Baseline'> | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const roRef = useRef<ResizeObserver | null>(null);
  const [visibleRange, setVisibleRange] = useState<{ from: Logical; to: Logical } | null>(null);
  const [isDark, setIsDark] = useState<boolean>(
      typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  
    // Watch for system theme changes
    useEffect(() => {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
  
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }, []);

  const timeToMs = (t: any) => {
    if (t instanceof Date) return t.getTime();
    if (typeof t === 'number') return t > 1e12 ? t : t * 1000;
    return Date.parse(String(t));
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let mounted = true;

    const createIfReady = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      if (w === 0 || h === 0) {
        console.debug('[BaselineChart] container size 0, waiting for resize...');
        return;
      }
      if (chartRef.current) return; // already created

      console.debug('[BaselineChart] creating chart', { w, h });

      const chart = createChart(containerRef.current!, {
        width: w,
        height: h,
        layout: {
          textColor: isDark ? '#f3f4f6' : '#1a1f40',
          background: { color: isDark ? '#1a1f40' : '#f3f4f6' },
        },
        grid: {
          vertLines: { color: isDark ? '#2D2D2D' : '#E2E8F0' },
          horzLines: { color: isDark ? '#2D2D2D' : '#E2E8F0' },
        },
        rightPriceScale: {
          visible: true,
          borderVisible: false,
          scaleMargins: { top: 0.1, bottom: 0.1 },
          borderColor: isDark ? '#2D2D2D' : '#E2E8F0',
        },
        timeScale: {
          borderVisible: false,
          secondsVisible: false,
          borderColor: isDark ? '#2D2D2D' : '#E2E8F0',
        },
      } as DeepPartial<TimeChartOptions>);

      // Baseline series
      const baselineSeries = chart.addSeries(BaselineSeries, {
            topLineColor: '#089981',
            bottomLineColor: '#f23645',
            baseLineColor: '#000',
            title: 'Portfolio Returns',
            relativeGradient: true,
            priceFormat: { type: 'custom', formatter: (p: number) => `${(100 * p).toFixed(2)}%` },
          })

      // Market line series
      // Market line series (subtle)
      const marketSeries = chart.addSeries(LineSeries, {  
        color: 'rgba(150,150,150,0.7)', // single color
        lineWidth: 2,  
        title: 'S&P 500',
        priceFormat: { type: 'custom', formatter: (p: number) => `${(100 * p).toFixed(2)}%` },
      });


      chartRef.current = chart;
      baselineSeriesRef.current = baselineSeries;
      lineSeriesRef.current = marketSeries;


      roRef.current = new ResizeObserver(() => {
        if (!containerRef.current) return;
        if (chartRef.current) {
          chartRef.current.resize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        } else {
          createIfReady();
        }
      });
      roRef.current.observe(containerRef.current);
    };

    createIfReady();
    requestAnimationFrame(() => {
      if (mounted) createIfReady();
    });

    return () => {
      mounted = false;
      if (roRef.current && containerRef.current) {
        roRef.current.disconnect();
      }
      if (chartRef.current) {
        try {
          chartRef.current.remove();
        } catch (err) {
          console.warn('[BaselineChart] chart.remove() failed', err);
        }
        chartRef.current = null;
        baselineSeriesRef.current = null;
        lineSeriesRef.current = null;
      }
    };
  }, []);

  // sanitize helper
  const sanitizeData = (arr: BaselineData[]) =>
    arr
      .map((d) => {
        let t: any = d.time;
        if (t instanceof Date) t = t.toISOString().split('T')[0];
        else if (typeof t === 'number') t = t > 1e12 ? Math.floor(t / 1000) : t;
        else if (typeof t !== 'string') t = new Date(t).toISOString().split('T')[0];
        else if (typeof t === 'string' && t.includes('T')) t = t.split('T')[0];
        return { time: t, value: Number(d.value ?? 0) } as BaselineData;
      })
      .sort((a, b) => timeToMs(a.time) - timeToMs(b.time));

  // Portfolio baseline data
  useEffect(() => {
    if (!baselineSeriesRef.current || !data || data.portfolio.length === 0) return;
    const sanitized = sanitizeData(data.portfolio);
    try {
      baselineSeriesRef.current.setData(sanitized);
      chartRef.current?.timeScale().fitContent();
    } catch (err) {
      console.error('[BaselineChart] failed to set baseline data', err);
    }
  }, [data.portfolio]);

  // Market line data
  useEffect(() => {
    if (!lineSeriesRef.current || !data || data.market.length === 0) return;
    const sanitized = sanitizeData(data.market);
    try {
      lineSeriesRef.current.setData(sanitized);
    } catch (err) {
      console.error('[BaselineChart] failed to set line data', err);
    }
  }, [data.market]);

  // Track visible range
  useEffect(() => {
    if (!chartRef.current) return;

    const interval = setInterval(() => {
      const logicalRange = chartRef.current?.timeScale().getVisibleLogicalRange();
      if (!logicalRange) return;

      setVisibleRange({ from: logicalRange.from, to: logicalRange.to });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
  if (!chartRef.current || !baselineSeriesRef.current) return;

  const range = chartRef.current.timeScale().getVisibleRange();
  if (!range?.from || !range?.to) return;
  const fromTime = range?.from;
      const toTime = range?.to;
      if (!fromTime || !toTime) return;
  
      const sortedData = data.portfolio.slice().sort((a, b) => (a.time as number) - (b.time as number));
      const firstVisiblePoint = sortedData.find((p) => p.time >= fromTime);
      const firstValue = firstVisiblePoint? firstVisiblePoint.value : 0;
  
      const normalizedPortfolio = sortedData.map((p) => ({ time: p.time, value: (p.value + 1) / (firstValue + 1) - 1 }));
      

      const sortedMarketData = data.market.slice().sort((a, b) => (a.time as number) - (b.time as number));
      const firstVisiblePointMarket = sortedMarketData.find((p) => p.time >= fromTime);
      const firstValueMarket = firstVisiblePointMarket? firstVisiblePointMarket.value : 0;
      const normalizedMarket= sortedMarketData.map((p) => ({ time: p.time, value: (p.value + 1) / (firstValueMarket + 1) - 1}));
      

  // normalize portfolio and market values...
  baselineSeriesRef.current.setData(normalizedPortfolio);
  lineSeriesRef.current?.setData(normalizedMarket);

}, [data, visibleRange]); // include actions here


  return (
    <div
      ref={containerRef}
      className="relative w-full h-96 border border-border-light dark:border-border-dark rounded-lg shadow-lg overflow-hidden"
    />
  );
};
