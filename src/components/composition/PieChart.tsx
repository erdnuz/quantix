'use client'
import { useState, useEffect, useRef } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

interface PieChartProps {
  title?: string;
  data?: Record<string, number>;
  mult?: boolean;
}

export const PieChart: React.FC<PieChartProps> = ({ title = '', data = {}, mult = true }) => {
  const [isDark, setIsDark] = useState(
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false
  );

  const chartRef = useRef<any>(null);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const getGradientColors = (ctx: CanvasRenderingContext2D, count: number) => {
  const baseColors = [
    '#005C8A', '#2D6F4E', '#C9A500', '#F34A29', '#7F4BC2',
    '#D62B2B', '#B49B4C', '#757575', '#4C8B3D', '#9B2E76'
  ];

  const lighten = (color: string, percent: number) => {
    const f = parseInt(color.slice(1), 16);
    const R = f >> 16;
    const G = (f >> 8) & 0x00ff;
    const B = f & 0x0000ff;
    const p = percent / 100;
    const newColor =
      '#' +
      (
        0x1000000 +
        (Math.round(R + (255 - R) * p) << 16) +
        (Math.round(G + (255 - G) * p) << 8) +
        Math.round(B + (255 - B) * p)
      ).toString(16).slice(1);
    return newColor;
  };

  return Array.from({ length: count }).map((_, i) => {
    const color = baseColors[i % baseColors.length];
    const gradient = ctx.createRadialGradient(150, 150, 10, 150, 150, 160);
    gradient.addColorStop(0, lighten(color, 40)); // lighter center
    gradient.addColorStop(1, color);             // darker edge
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isDark]);

  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        label: title,
        data: Object.values(data),
        backgroundColor: gradients.length === Object.keys(data).length
          ? gradients
          : [
              '#005C8A', '#2D6F4E', '#C9A500', '#F34A29', '#7F4BC2',
              '#D62B2B', '#B49B4C', '#757575', '#4C8B3D', '#9B2E76'
            ].slice(0, Object.keys(data).length),
        hoverOffset: 20,
        borderWidth: 0,
        hoverBorderColor: isDark ? '#222' : '#fff',
      },
    ],
  };

  const options = {
    layout: { padding: 10 },
    responsive: true,
    animation: {
      animateRotate: true,
      duration: 1200,
      easing: 'easeOutCubic',
    },
    plugins: {
      legend: {
        display: typeof window !== 'undefined' ? window.innerWidth > 700 : true,
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          boxHeight: 12,
          usePointStyle: true,
          pointStyle: 'circle',
          color: isDark ? '#FFF' : '#000',
          font: { size: 14, family: 'Roboto, sans-serif', weight: '400' },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#fff',
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (tooltipItem: any) =>
            `${tooltipItem.label}: ${((mult ? 100 : 1) * tooltipItem.raw).toFixed(2)}%`,
        },
      },
    },
    hover: { mode: 'nearest', intersect: true },
  };

  return (
    <div className="flex justify-center items-center flex-1">
      <div className="flex flex-col items-center w-fit text-center">
        <div className="w-64 md:w-48 rounded-full">
          <Pie ref={chartRef} data={chartData} options={options as any} />
        </div>
        {title && <h2 className="subhead mt-3 text-lg md:text-base">{title}</h2>}
      </div>
    </div>
  );
};
