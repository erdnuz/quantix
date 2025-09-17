'use client'

import React from 'react';

function interpolateColor(n: number) {
  const c1 = [190, 15, 15]; // Red
  const c2 = [150, 150, 150]; // Gray
  const c3 = [0, 90, 50]; // Green

  let r: number, g: number, b: number;

  if (n <= 0) {
    const factor = (n + 1);
    r = Math.round(c1[0] + factor * (c2[0] - c1[0]));
    g = Math.round(c1[1] + factor * (c2[1] - c1[1]));
    b = Math.round(c1[2] + factor * (c2[2] - c1[2]));
  } else {
    const factor = n;
    r = Math.round(c2[0] + factor * (c3[0] - c2[0]));
    g = Math.round(c2[1] + factor * (c3[1] - c2[1]));
    b = Math.round(c2[2] + factor * (c3[2] - c2[2]));
  }

  return `rgb(${r}, ${g}, ${b})`;
}

interface CorrelationTableProps {
  data?: Record<string, Record<string, number>>;
}

export const CorrelationTable: React.FC<CorrelationTableProps> = ({ data = {} }) => {
  if (!data || Object.keys(data).length === 0) return null;

  const tickers = [...Object.keys(data).filter((t) => t !== '^GSPC'), '^GSPC'];

  return (
    <div className="flex flex-col gap-4">
      <div
        className="grid gap-2 items-center rounded-lg"
        style={{ gridTemplateColumns: `auto repeat(${tickers.length}, minmax(0, 1fr))` }}
      >
        {/* Empty corner cell */}
        <div></div>

        {/* Header row */}
        {tickers.map((ticker) => (
          <div key={ticker} className="text-center">
            <h3 className="text-sm md:text-base font-medium">
              {ticker === '^GSPC' ? 'S&P 500' : ticker}
            </h3>
          </div>
        ))}

        {/* Data rows */}
        {tickers.filter((t) => t !== '^GSPC').map((ticker) => (
          <React.Fragment key={ticker}>
            {/* Row label */}
            <div className="text-right pr-1 md:pr-2">
              <h3 className="text-sm md:text-base font-medium">{ticker}</h3>
            </div>

            {/* Row cells */}
            {tickers.map((targetTicker) => (
              <div
                key={targetTicker}
                className="text-white rounded-md transition-colors duration-300 text-center text-sm md:text-base p-2 md:p-3"
                style={{ backgroundColor: interpolateColor(data[ticker][targetTicker]) }}
                title={`Correlation: ${data[ticker][targetTicker]}`}
              >
                {(100 * data[ticker][targetTicker]).toFixed(0)}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
