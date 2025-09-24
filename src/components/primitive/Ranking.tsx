'use client';
import React from 'react';

function interpolateColor(percentile: number, goodBad = true): string {
  const red = [190, 15, 15];
  const yellow = [230, 180, 50];
  const green = [0, 90, 50];

  const p1 = [240, 130, 200];
  const p2 = [200, 80, 160];
  const p3 = [160, 30, 120];

  const [c1, c2, c3] = goodBad ? [red, yellow, green] : [p1, p2, p3];

  let r: number, g: number, b: number;

  if (percentile <= 0.5) {
    const factor = percentile / 0.5;
    r = Math.round(c1[0] + factor * (c2[0] - c1[0]));
    g = Math.round(c1[1] + factor * (c2[1] - c1[1]));
    b = Math.round(c1[2] + factor * (c2[2] - c1[2]));
  } else {
    const factor = (percentile - 0.5) / 0.5;
    r = Math.round(c2[0] + factor * (c3[0] - c2[0]));
    g = Math.round(c2[1] + factor * (c3[1] - c2[1]));
    b = Math.round(c2[2] + factor * (c3[2] - c2[2]));
  }

  return `rgb(${r}, ${g}, ${b})`;
}

function clip(percentile: number): number {
  return (100 * percentile + 10) / 1.1;
}

interface RankingProps {
  score?: number | 'none' | null;
  barOnly?: boolean;
  large?: boolean;
  goodBad?: boolean;
  number?: string | number | null;
}

export const Ranking: React.FC<RankingProps> = ({
  score,
  barOnly = false,
  large = false,
  goodBad = true,
  number = null,
}) => {
  const isNone = score === null || score === undefined || score === 'none';
  const width = isNone ? '100%' : `${clip(Number(score))}%`;
  const displayScore = isNone ? '—' : (number ?? (100 * Number(score)).toFixed(0));
  const barColor = isNone ? '#d1d5db' : interpolateColor(Number(score), goodBad); // gray-300 for missing

  return (
    <div className="flex w-full justify-center items-center md:flex-col">
      {/* Number label for medium+ screens */}
      {!barOnly && (
        <p
          className={`hidden md:flex text-center ${
            large ? 'text-base md:text-lg font-semibold' : 'sm:text-sm md:text-base'
          } m-0`}
        >
          {displayScore}
        </p>
      )}

      <div className="w-full px-1 sm:px-0">
        <div
          className={`h-2.5 ${large ? 'h-5' : ''} rounded-full`}
          style={{ width, backgroundColor: barColor }}
        />
      </div>

      
    </div>
  );
};
