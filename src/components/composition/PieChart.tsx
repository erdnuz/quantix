'use client';
import { useState, useEffect, useRef } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, TooltipItem } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

interface PieChartProps {
  title?: string;
  data?: Record<string, number>;
  mult?: boolean;
}

export const PieChart: React.FC<PieChartProps> = ({ title = '', data = {}, mult = true }) => {
  const [isDark, setIsDark] = useState<boolean>(
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);

  const chartRef = useRef<ChartJS<"pie"> | null>(null);

  // Watch for system theme and window size changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const themeHandler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', themeHandler);

    const resizeHandler = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', resizeHandler);

    return () => {
      mediaQuery.removeEventListener('change', themeHandler);
      window.removeEventListener('resize', resizeHandler);
    };
  }, []);

  const getGradientColors = (ctx: CanvasRenderingContext2D, count: number) => {
    const baseColors = ['#005C8A', '#2D6F4E', '#C9A500', '#F34A29', '#7F4BC2', '#D62B2B', '#B49B4C', '#757575', '#4C8B3D', '#9B2E76'];
    const lighten = (color: string, percent: number) => {
      const f = parseInt(color.slice(1), 16);
      const R = f >> 16;
      const G = (f >> 8) & 0x00ff;
      const B = f & 0x0000ff;
      const p = percent / 100;
      return '#' + (0x1000000 + (Math.round(R + (255 - R) * p) << 16) + (Math.round(G + (255 - G) * p) << 8) + Math.round(B + (255 - B) * p)).toString(16).slice(1);
    };
    return Array.from({ length: count }).map((_, i) => {
      const color = baseColors[i % baseColors.length];
      const gradient = ctx.createRadialGradient(150, 150, 10, 150, 150, 160);
      gradient.addColorStop(0, lighten(color, 40));
      gradient.addColorStop(1, color);
      return gradient;
    });
  };

  const [gradients, setGradients] = useState<(string | CanvasGradient)[]>([]);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = chartRef.current;
    const ctx = chart.ctx;
    const count = Object.keys(data).length;
    setGradients(getGradientColors(ctx, count));
  }, [data, isDark, windowWidth]);

  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        label: title,
        data: Object.values(data),
        backgroundColor: gradients.length === Object.keys(data).length
          ? gradients
          : ['#005C8A', '#2D6F4E', '#C9A500', '#F34A29', '#7F4BC2', '#D62B2B', '#B49B4C', '#757575', '#4C8B3D', '#9B2E76'].slice(0, Object.keys(data).length),
        hoverOffset: 20,
        borderWidth: 0,
        hoverBorderColor: isDark ? '#19223A' : '#eceff1',
      },
    ],
  };

  const options = {
    layout: { padding: 8 },
    responsive: true,
    maintainAspectRatio: false,
    animation: { animateRotate: true, duration: 1200, easing: 'easeOutCubic' as const},
    plugins: {
      legend: {
        display: windowWidth > 600, // hide legend on small screens
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          boxHeight: 12,
          usePointStyle: true,
          pointStyle: 'circle',
          color: isDark ? '#f3f4f6' : '#1a1f40',
          font: { size: Math.min(14, windowWidth / 50), family: 'Roboto, sans-serif', weight: 400 },
        },
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.95)',
        titleColor: isDark ? '#fff' : '#000',
        bodyColor: isDark ? '#fff' : '#000',
        padding: 8,
        cornerRadius: 6,
        callbacks: {
          label: (tooltipItem: TooltipItem<'pie'>) =>
            `${tooltipItem.label}: ${((mult ? 100 : 1) * Number(tooltipItem.raw)).toFixed(2)}%`,
        },
      },
    },
    hover: { mode: 'nearest' as const, intersect: true },
  };

  const chartSize = windowWidth < 400 ? 180 : windowWidth < 600 ? 220 : 280;

  return (
    <div className="flex justify-center items-center w-full">
      <div className="flex flex-col items-center w-fit text-center">
        <div style={{ width: chartSize, height: chartSize }}>
          <Pie ref={chartRef} data={chartData} options={options} />
        </div>
        {title && <h2 className="mt-2 text-sm sm:text-base md:text-lg font-medium">{title}</h2>}
      </div>
    </div>
  );
};
