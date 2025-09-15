'use client'
import { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

interface PieChartProps {
  title?: string;
  data?: Record<string, number>;
  mult?: boolean;
}

export const PieChart: React.FC<PieChartProps> = ({ title = '', data = {}, mult = true }) => {
  const [currentTheme, setCurrentTheme] = useState(
    typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : 'light'
  );

  useEffect(() => {
    const themeObserver = new MutationObserver(() => {
      setCurrentTheme(document.documentElement.getAttribute('data-theme'));
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => themeObserver.disconnect();
  }, []);

  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        label: title,
        data: Object.values(data),
        backgroundColor: Object.keys(data).map((label, idx) =>
          label === 'Other'
            ? '#8A8A8A'
            : [
                '#005C8A',
                '#2D6F4E',
                '#C9A500',
                '#F34A29',
                '#7F4BC2',
                '#D62B2B',
                '#B49B4C',
                '#757575',
                '#4C8B3D',
                '#9B2E76',
              ][idx % 10]
        ),
        hoverOffset: 10,
        borderWidth: 0,
      },
    ],
  };

  const options = {
    layout: { padding: 4 },
    responsive: true,
    plugins: {
      legend: {
        display: typeof window !== 'undefined' ? window.innerWidth > 700 : true,
        position: 'top' as const,
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
          font: {
            size: 12,
            family: 'Inter, sans-serif',
            weight: '300' as const,
            color: currentTheme === 'light' ? '#000' : '#FFF',
          },
          generateLabels: (chart: any) => {
            const cleanLabel = (label: string) =>
              label
                .replace(
                  /\b(The|Corp|Corporation|Group|Holdings|Holding|Inc|Ltd|LLC|PLC|Services)\b/gi,
                  ''
                )
                .replace(/\s+/g, ' ')
                .replace('Communication', 'Comm.')
                .replace('Consumer', 'Cons.')
                .trim()
                .substring(0, 20) + (label.length > 20 ? '...' : '');
            return chart.data.labels.map((label: string, i: number) => ({
              text: cleanLabel(label),
              fontColor: currentTheme === 'light' ? '#000' : '#FFF',
              fillStyle: chart.data.datasets[0].backgroundColor[i],
            }));
          },
          padding: 5,
        },
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem: any) {
            return `${((mult ? 100 : 1) * Number(tooltipItem.raw)).toFixed(2)}%`;
          },
        },
        backgroundColor: 'rgba(0,0,0,0.7)',
        titleColor: '#fff',
        bodyColor: '#fff',
        footerColor: '#fff',
      },
    },
    hover: { mode: 'index' as const, intersect: false },
  };

  return (
    <div className="flex justify-center items-center flex-1">
      <div className="flex flex-col items-center w-fit text-center">
        <div className="w-60 md:w-44">
          <Pie data={chartData} options={options as any} />
        </div>
        <h2 className="subhead w-60 md:w-44 mt-2">{title}</h2>
      </div>
    </div>
  );
};
