import Link from "next/link";
import { Portfolio } from "../../../types";

interface PortfolioCardProps {
  portfolio: Portfolio;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({ portfolio }) => {
  const { id, title, created, description, tags } = portfolio;

  return (
    <Link href={`/portfolios/${id}/`} className="block h-full">
      <div className="flex flex-col w-full max-w-[600px] mb-6 p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer bg-white dark:bg-gray-800">
        
        {/* Top section: Title and Date */}
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          <p className="text-xs text-gray-400 dark:text-gray-300">{created}</p>
        </div>

        {/* Description */}
        <p className="text-sm mt-3 text-gray-700 dark:text-gray-300 line-clamp-2">{description}</p>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs px-3 py-1 rounded-full bg-gray-100 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-gray-700 dark:text-gray-200 whitespace-nowrap"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats row */}
<div className="flex w-full mt-4 gap-4">
  {Object.entries({
    primaryAssetClass: 'Class',
    oneYearGrowth: '1y',
    threeMonthGrowth: '3mo',
    cagr: 'CAGR'
  }).map(([columnName, display]) => (
    <div
      key={columnName}
      className="flex flex-col flex-none items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg py-3 px-4 min-w-[80px] grow"
    >
      <p className="text-base font-medium text-gray-900 dark:text-gray-100">
        {portfolio[columnName as keyof Portfolio] !== undefined
          ? columnName === 'primaryAssetClass'
            ? (portfolio[columnName as keyof Portfolio] as string)
            : `${(100 * (portfolio[columnName as keyof Portfolio] as number)).toFixed(2)}%`
          : 'NaN'}
      </p>
      <p className="text-sm text-gray-400 dark:text-gray-300">{display}</p>
    </div>
  ))}
</div>


      </div>
    </Link>
  );
};
