import { AssetTab, FullETF, FullStock } from '../../../types';
import { Ranking } from '../primitive';

interface RowProps {
  metric: string;
  col: string;
  data: Record<string, number>;
  isOverall?: boolean;
  percent?: boolean;
  goodBad?: boolean;
  type?: number;
}

function Row({
  metric,
  col,
  data,
  isOverall = false,
  percent = false,
  goodBad = true,
  type = 0,
}: RowProps) {
  const formatNumber = (number: number) => {
    if (number >= 1e12) return `${(number / 1e12).toFixed(1)}T`;
    if (number >= 1e9) return `${(number / 1e9).toFixed(1)}B`;
    if (number >= 1e6) return `${(number / 1e6).toFixed(1)}M`;
    if (number >= 1e3) return `${(number / 1e3).toFixed(1)}K`;
    return number.toFixed(2);
  };

  const formatPercent = (number: number) => `${(number * 100).toFixed(2)}%`;

  const val = data[col.replace('-usd', '')];

  return (
    <div className="flex items-center gap-6 w-full">
      {/* Metric name */}
      <div className="flex-1">
        <h3
          className={`font-bold ${
            isOverall ? 'text-lg md:text-base' : 'text-base md:text-sm'
          }`}
        >
          {metric}
        </h3>
      </div>

      {/* Value column */}
      {type === 0 && (
        <div className="flex-[0.65]">
          <h3 className="text-base md:text-sm">
            {percent ? formatPercent(val) : formatNumber(val)}
          </h3>
        </div>
      )}

      {/* Sector / Category */}
      <div className="flex-1">
        <Ranking score={data[col + 'PS']} large={isOverall} goodBad={goodBad} />
      </div>

      {/* Overall */}
      <div className="flex-1">
        <Ranking
          score={data[type === 0 ? col + 'PO' : col]}
          large={isOverall}
          goodBad={goodBad}
        />
      </div>
    </div>
  );
}

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

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Header row */}
      <div className="flex gap-6 items-center mb-2 w-full">
        <div className="flex-1 flex justify-start">
          <h2 className="text-lg md:text-base font-semibold">{header}</h2>
        </div>
        {t === 0 && <div className="flex-1"></div>}
        <div className="flex-1 flex justify-end">
          <h3 className="text-base md:text-sm font-medium">
            {data?.V ? 'Sector' : 'Category'}
          </h3>
        </div>
        <div className="flex-1 flex justify-end">
          <h3 className="text-base md:text-sm font-medium">Overall</h3>
        </div>
      </div>

      {/* Rows */}
      {options[currentTab]?.map((v) => {
        if (data[v.column]) {
          return (
            <Row
              key={v.column}
              metric={v.display}
              col={v.column}
              data={data}
              percent={v.percent}
              goodBad={v.goodBad}
              isOverall={t === 1 && v.column === 'qOverall'}
              type={t}
            />
          );
        }
        return null;
      })}
    </div>
  );
}
