'use client';
import React, { useEffect, useRef, useState } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  BaselineData,
  BaselineSeries,
  createSeriesMarkers,
  DeepPartial,
  TimeChartOptions,
  Logical,
} from 'lightweight-charts';

type ActionMap = Record<string, Record<string, number>>;

interface BaselineChartProps {
  data: BaselineData[];     // expected: [{ time: 'YYYY-MM-DD' | number | Date, value: number }, ...]
  actions?: ActionMap;      // { ticker: { "2025-09-21T...": 10, ... }, ... }
}

export const BaselineChart: React.FC<BaselineChartProps> = ({ data, actions }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Baseline'> | null>(null);
  const markersApiRef = useRef<ReturnType<typeof createSeriesMarkers> | null>(null);
  const roRef = useRef<ResizeObserver | null>(null);
  const [visibleRange, setVisibleRange] = useState<{ from: Logical; to: Logical } | null>(null);
  
  // Helper to produce a normalized time value for sorting
  const timeToMs = (t: any) => {
    if (t instanceof Date) return t.getTime();
    if (typeof t === 'number') return t > 1e12 ? t : t * 1000; // treat big numbers as ms, small as seconds
    // else string -> parse
    return Date.parse(String(t));
  };

  // Initialize chart when container has size
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
        layout: { textColor: '#000', background: { color: '#fff' } },
        rightPriceScale: { visible: true, borderVisible: false, scaleMargins: { top: 0.1, bottom: 0.1 } },
        timeScale: { borderVisible: false, secondsVisible: false },
      } as DeepPartial<TimeChartOptions>);

      // Add BaselineSeries (use whichever API your LC version supports; this is compatible with prior examples)
      const baselineSeries = (chart as any).addSeries
        ? (chart as any).addSeries(BaselineSeries, {
            topLineColor: '#089981',
            bottomLineColor: '#f23645',
            baseLineColor: '#000',
            lineColor: '#000',
            relativeGradient: false,
            priceFormat: { type: 'custom', formatter: (p: number) => `${(100 * p).toFixed(2)}%` },
          })
        : (chart as any).addBaselineSeries({
            topLineColor: '#089981',
            bottomLineColor: '#f23645',
            baseLineColor: '#000',
            lineColor: '#000',
            relativeGradient: false,
            priceFormat: { type: 'custom', formatter: (p: number) => `${(100 * p).toFixed(2)}%` },
          });

      chartRef.current = chart;
      seriesRef.current = baselineSeries;

      // markers API instance
      try {
        markersApiRef.current = createSeriesMarkers(baselineSeries, []);
      } catch (err) {
        console.warn('[BaselineChart] createSeriesMarkers failed', err);
      }

      // Attach resize observer
      roRef.current = new ResizeObserver(() => {
        if (!containerRef.current) return;
        if (chartRef.current) {
          chartRef.current.resize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        } else {
          // if chart not created yet and we now have size, attempt create
          createIfReady();
        }
      });
      roRef.current.observe(containerRef.current);
    };

    // Try to create immediately, otherwise wait for ResizeObserver callback
    createIfReady();

    // ensure we attempt to create on next paint (useful for some layout flows)
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
        seriesRef.current = null;
        markersApiRef.current = null;
      }
    };
    // intentionally empty deps — init/uninit handled by mounting/unmounting
  }, []);

  // Apply / sanitize data when series available
  useEffect(() => {
    if (!seriesRef.current || !data || data.length === 0) return;

    // sanitize times & values
    const sanitized = data
      .map(d => {
        let t = (d as any).time;
        if (t instanceof Date) t = t.toISOString().split('T')[0];
        else if (typeof t === 'number') {
          // convert ms -> seconds is allowed, but keep numeric if user provided seconds
          t = t > 1e12 ? Math.floor(t / 1000) : t;
        } else if (typeof t !== 'string') {
          t = new Date(t).toISOString().split('T')[0];
        } else if (typeof t === 'string' && t.includes('T')) {
          // ISO -> date only
          t = t.split('T')[0];
        }
        return { time: t, value: Number((d as any).value ?? 0) } as BaselineData;
      })
      .sort((a, b) => timeToMs(a.time) - timeToMs(b.time));

    try {
      seriesRef.current.setData(sanitized);
      chartRef.current?.timeScale().fitContent();
      console.debug('[BaselineChart] data set, points:', sanitized.length);
    } catch (err) {
      console.error('[BaselineChart] failed to set data', err);
    }
  }, [data]);

  // Markers: create or update via the markers API
  useEffect(() => {
    if (!seriesRef.current || !markersApiRef.current) return;
    if (!actions) {
      markersApiRef.current.setMarkers([]);
      return;
    }

    const raw = Object.entries(actions)
      .flatMap(([ticker, tickerActions]) =>
        Object.entries(tickerActions).map(([time, shares]) => {
          const t = typeof time === 'string' ? time.split('T')[0] : new Date(time).toISOString().split('T')[0];
          return {
            time: t,
            position: shares > 0 ? 'belowBar' : 'aboveBar',
            color: shares > 0 ? '#089981' : '#f23645',
            shape: 'circle' as const,
            text: shares > 0 ? 'Buy' : 'Sell',
          };
        })
      )
      // optional: deduplicate/limit markers per date+text to avoid clutter
      .reduce<Record<string, any[]>>((acc, m) => {
        const k = `${m.time}-${m.text}`;
        acc[k] = acc[k] || [];
        if (acc[k].length < 3) acc[k].push(m);
        return acc;
      }, {});

    const flat = Object.values(raw).flat();
    try {
      markersApiRef.current.setMarkers(flat);
      console.debug('[BaselineChart] markers applied:', flat.length);
    } catch (err) {
      console.error('[BaselineChart] setMarkers failed', err);
    }
  }, [actions]);

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
      const sortedData = data.slice().sort((a, b) => (a.time as number) - (b.time as number));
      const firstVisiblePoint = sortedData.find((p) => p.time >= fromTime) || sortedData[0];
      const firstValue = firstVisiblePoint?.value +1;
  
      const normalized = sortedData.map((p) => ({ time: p.time, value: (p.value + 1) / firstValue - 1}));
      seriesRef.current?.setData(normalized);
      
    }, [data, visibleRange]);

  return <div ref={containerRef} className="relative w-full h-96 border border-gray-300 rounded-lg overflow-hidden" />;
};
