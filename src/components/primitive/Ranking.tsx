'use client';
import React from 'react';

function interpolateColor(percentile: number, goodBad = true): string {
  // Good-bad color scheme
  const red = [190, 15, 15]; // #c00f0c
  const yellow = [230, 180, 50]; // #e8b931
  const green = [0, 90, 50]; // #2ECC71

  // Neutral color scheme
  const p1 = [240, 130, 200]; // rgb(240, 130, 200)
  const p2 = [200, 80, 160];  // rgb(200, 80, 160)
  const p3 = [160, 30, 120];  // rgb(160, 30, 120)

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
  const color = isNone
    ? 'var(--sds-color-background-default-tertiary)'
    : interpolateColor(Number(score), goodBad);
  const displayScore = isNone ? 'N/A' : (100 * Number(score)).toFixed(0);
  const width = isNone ? '100%' : `${clip(Number(score))}%`;

  return (
    <div className="flex w-full items-center gap-2.5 md:flex-col md:gap-0.5">
      {!barOnly && (
        <p
          className={`${
            large ? 'text-lg md:text-base font-semibold' : 'text-base md:text-sm'
          } ${number ? 'w-30 md:w-10' : 'w-15 md:w-7.5'} m-0`}
        >
          {number ?? displayScore}
        </p>
      )}
      <div className="w-full">
        <div
          className={`h-2.5 ${large ? 'h-5' : ''}`}
          style={{ width, backgroundColor: color, borderRadius: '9999px' }}
        />
      </div>
    </div>
  );
};
