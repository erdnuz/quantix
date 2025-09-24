import { AssetTab } from '../../../types';
import { Ranking } from '../primitive';

export type RankingOption<T> = {
  display: string;
  column: keyof T;
  percent: boolean;
  goodBad: boolean;
};

interface RankingTableProps<T> {
  currentTab: AssetTab;
  options: Partial<Record<AssetTab, RankingOption<T>[]>>;
  data?: T;
  t?: number;
  header?: string;
}

export function RankingTable<T>({
  currentTab,
  options,
  data = {} as T,
  t = 0,
  header = '',
}: RankingTableProps<T>) {
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
      {/* Header row */}
      <div
        className={`
          grid w-full gap-2 sm:gap-6 items-center font-semibold
          text-base md:text-sm
          ${t === 0
            ? "[grid-template-columns:80px_40px_1fr_1fr] sm:[grid-template-columns:140px_40px_1fr_1fr]"
            : "[grid-template-columns:80px_1fr_1fr] sm:[grid-template-columns:140px_1fr_1fr]"}
        `}
      >
        <div className="text-lg sm:text-2xl">{header}</div>
        {t === 0 && <div></div>}
        <div className="text-sm sm:text-lg text-left md:text-center">
          {data?.['assetClass' as keyof T]=='Equity'? 'Sector' : 'Category'}
        </div>
        <div className="text-sm sm:text-lg text-left md:text-center">Overall</div>
      </div>

      {/* Data rows */}
      {options[currentTab]?.map((v) => {
        const val = data[v.column];
        if (val === undefined) return null;

        return (
          <div
            key={String(v.column)}
            className={`grid w-full gap-2 sm:gap-6 items-center
            ${t === 0
              ? "[grid-template-columns:80px_40px_1fr_1fr] sm:[grid-template-columns:140px_40px_1fr_1fr]"
              : "[grid-template-columns:80px_1fr_1fr] sm:[grid-template-columns:140px_1fr_1fr]"}`}
          >
            {/* Metric */}
            <div className="flex flex-col justify-end">
              <h3
                className={`font-bold truncate ${
                  t === 1 && v.column === 'qOverall'
                    ? 'text-sm sm:text-base md:text-lg'
                    : 'text-xs sm:text-sm md:text-base'
                }`}
              >
                {v.display}
              </h3>
            </div>

            {/* Value column */}
            {t === 0 && (
              <div className="flex flex-col justify-end">
                <h3 className="text-xs sm:text-sm md:text-base">
                  {v.percent ? formatPercent(Number(val)) : formatNumber(Number(val))}
                </h3>
              </div>
            )}

            {/* Sector / Category */}
            <div className="flex justify-center items-center">
              <Ranking
                score={data[v.column as string + 'PS' as keyof T] as number}
                large={t === 1 && v.column === 'qOverall'}
                goodBad={v.goodBad}
              />
            </div>

            {/* Overall */}
            <div className="flex justify-center items-center">
              <Ranking
                score={data[t === 0 ? (v.column as string + 'PO' as keyof T) : v.column] as number}
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
