'use client'

import React from 'react';

function interpolateColor(n: number) {
  const c1 = [190, 15, 15]; // Red
  const c2 = [150, 150, 150]; // Gray
  const c3 = [0, 90, 50]; // Green

  let r: number, g: number, b: number;

  if (n <= 0) {
    const factor = n + 1;
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

  // Separate S&P 500 from other tickers
  const otherTickers = Object.keys(data).filter(t => t !== '^GSPC');
  const spTicker = '^GSPC';

  return (
    <div className="overflow-x-auto">
      <div className="w-full sm:min-w-[600px] flex flex-col gap-4">
        {/* Large screens: show S&P 500 only as last column */}
        <div className="hidden sm:grid gap-1 items-center rounded-lg"
             style={{
               gridTemplateColumns: `auto repeat(${otherTickers.length}, minmax(0,1fr)) 1fr`
             }}
        >
          {/* Empty top-left corner */}
          <div></div>

          {/* Column headers */}
          {otherTickers.map(t => (
            <div key={t} className="text-center">
              <h3 className="text-sm md:text-base font-medium truncate">{t}</h3>
            </div>
          ))}
          <div className="text-center">
            <h3 className="text-sm md:text-base font-medium truncate">S&P 500</h3>
          </div>

          {/* Data rows */}
          {otherTickers.map(rowTicker => (
            <React.Fragment key={rowTicker}>
              {/* Row label */}
              <div className="text-right pr-2">
                <h3 className="text-sm md:text-base font-medium truncate">{rowTicker}</h3>
              </div>

              {/* Row cells for other tickers */}
              {otherTickers.map(colTicker => (
                <div
                  key={colTicker}
                  className="rounded-md min-w-5 min-h-5 text-center text-sm md:text-base p-2 md:p-3 text-white"
                  style={{ backgroundColor: interpolateColor(data[rowTicker][colTicker]) }}
                  title={`Correlation: ${(100*data[rowTicker][colTicker]).toFixed(0)}%`}
                >
                  <span className="hidden sm:inline">{(100*data[rowTicker][colTicker]).toFixed(0)}</span>
                </div>
              ))}

              {/* S&P 500 column at the end */}
              <div
                className="rounded-md min-w-5 min-h-5 text-center text-sm md:text-base p-2 md:p-3 text-white"
                style={{ backgroundColor: interpolateColor(data[rowTicker][spTicker]) }}
                title={`Correlation: ${(100*data[rowTicker][spTicker]).toFixed(0)}%`}
              >
                <span className="hidden sm:inline">{(100*data[rowTicker][spTicker]).toFixed(0)}</span>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Small screens: show S&P 500 only as last row */}
        <div className="sm:hidden grid gap-1 items-center rounded-lg"
             style={{
               gridTemplateColumns: `auto repeat(${otherTickers.length}, minmax(0,1fr))`
             }}
        >
          {/* Empty top-left corner */}
          <div></div>

          {/* Column headers */}
          {otherTickers.map(t => (
            <div key={t} className="text-center">
              <h3 className="text-xs font-medium truncate">{t}</h3>
            </div>
          ))}

          {/* Data rows */}
          {otherTickers.map(rowTicker => (
            <React.Fragment key={rowTicker}>
              <div className="text-right pr-2">
                <h3 className="text-xs font-medium truncate">{rowTicker}</h3>
              </div>
              {otherTickers.map(colTicker => {
                const value = data[rowTicker][colTicker];
                return (
                  <div
                    key={colTicker}
                    className="rounded-md min-w-5 min-h-5 text-center text-xs p-2 text-white"
                    style={{ backgroundColor: interpolateColor(value) }}
                    title={`Correlation: ${(100*value).toFixed(0)}%`}
                  ></div>
                );
              })}
            </React.Fragment>
          ))}

          {/* S&P 500 as last row */}
          <div className="text-right pr-2">
            <h3 className="text-xs font-medium truncate">S&P 500</h3>
          </div>
          {otherTickers.map(colTicker => {
            const value = data[spTicker][colTicker];
            return (
              <div
                key={colTicker}
                className="rounded-md min-w-5 min-h-5 text-center text-xs p-2 text-white"
                style={{ backgroundColor: interpolateColor(value) }}
                title={`Correlation: ${(100*value).toFixed(0)}%`}
              ></div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
