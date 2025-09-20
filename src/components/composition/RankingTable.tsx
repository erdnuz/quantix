import { AssetTab, FullETF, FullStock } from '../../../types';
import { Ranking } from '../primitive';

export type RankingOption = {
  display: string;
  column: keyof FullStock | keyof FullETF;
  percent: boolean;
  goodBad: boolean;
};

interface RankingTableProps {
  currentTab: AssetTab;
  options: Partial<Record<AssetTab, RankingOption[]>>;
  data?: Record<string, number>;
  t?: number;
  header?: string;
}

export function RankingTable({
  currentTab,
  options,
  data = {},
  t = 0,
  header = '',
}: RankingTableProps) {
  if (!data) return null;

  const formatNumber = (number: number) => {
    if (number >= 1e12) return `${(number / 1e12).toFixed(1)}T`;
    if (number >= 1e9) return `${(number / 1e9).toFixed(1)}B`;
    if (number >= 1e6) return `${(number / 1e6).toFixed(1)}M`;
    if (number >= 1e3) return `${(number / 1e3).toFixed(1)}K`;
    return number.toFixed(2);
  };

  const formatPercent = (number: number) => `${(number * 100).toFixed(2)}%`;

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Header row in grid */}
      <div
        className="grid w-full gap-6 items-center font-semibold text-base md:text-sm"
        style={{ gridTemplateColumns: `140px ${t==0?'40px':''} 1fr 1fr` }} // metric | value | sector/category | overall
      >
        <div className="text-2xl">{header}</div>
        {t==0&&<div></div>}
        <div className="text-lg text-center">{data?.V ? 'Sector' : 'Category'}</div>
        <div className="text-lg text-center">Overall</div>
      </div>

      {/* Data rows */}
      {options[currentTab]?.map((v) => {
        if (!data[v.column]) return null;

        const val = data[v.column];

        return (
          <div
            key={v.column}
            className="grid w-full gap-6 items-end"
            style={{ gridTemplateColumns: `140px ${t==0?'40px':''} 1fr 1fr` }}
          >
            {/* Metric */}
            <div className="flex flex-col justify-end">
              <h3
                className={`font-bold ${
                  t === 1 && v.column === 'qOverall'
                    ? 'text-lg md:text-base'
                    : 'text-base md:text-sm'
                }`}
              >
                {v.display}
              </h3>
            </div>

            {/* Value column */}
            {t === 0 && (
              <div className="flex flex-col justify-end">
                <h3 className="text-base md:text-sm">
                  {v.percent ? formatPercent(val) : formatNumber(val)}
                </h3>
              </div>
            )}

            {/* Sector / Category */}
            <div className="flex justify-end items-end">
              <Ranking
                score={data[v.column + 'PS']}
                large={t === 1 && v.column === 'qOverall'}
                goodBad={v.goodBad}
              />
            </div>

            {/* Overall */}
            <div className="flex justify-end items-end">
              <Ranking
                score={data[t === 0 ? v.column + 'PO' : v.column]}
                large={t === 1 && v.column === 'qOverall'}
                goodBad={v.goodBad}
              />
            </div>
          </div>
        );
      })}

    </div>
  );
}
