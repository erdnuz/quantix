import Link from "next/link";
import { Portfolio } from "../../../types";

interface PortfolioCardProps {
  portfolio: Portfolio;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({ portfolio }) => {
  const { id, title, created, description, tags } = portfolio;

  return (
    <Link href={`/portfolios/${id}/`} className="block">
      <div className="flex flex-col w-full max-w-[600px] shadow-lg p-6 rounded-xl border hover:shadow-xl transition-shadow duration-300 cursor-pointer
                      bg-surface-light dark:bg-surface-dark
                      border-border-light dark:border-border-dark">

        {/* Top section: Title and Date */}
        <div className="flex flex-row gap-1 justify-between items-baseline">
          <h3 className="text-xl font-semibold text-[var(--color-primary-light)] dark:text-[var(--color-primary-dark)]">{title}</h3>
          <p className="text-xs text-[var(--color-secondary-light)] dark:text-[var(--color-secondary-dark)]">Created {created}</p>
        </div>

        {/* Description */}
        <p className="text-sm mt-3 text-[var(--color-text-light)] dark:text-[var(--color-text-dark)] line-clamp-2">{description}</p>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs px-3 py-1 rounded-full border
                           bg-[var(--color-surface-light-secondary)] dark:bg-[var(--color-surface-dark-secondary)]
                           border-[var(--color-border-light)] dark:border-[var(--color-border-dark)]
                           text-[var(--color-text-light)] dark:text-[var(--color-text-dark)]
                           whitespace-nowrap"
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
              className="flex flex-col flex-none items-center justify-center 
                         rounded-lg py-3 px-4 min-w-[80px] grow
                         bg-[var(--color-surface-light)] dark:bg-[var(--color-surface-dark)]"
            >
              <p className="text-base font-medium text-[var(--color-text-light)] dark:text-[var(--color-text-dark)]">
                {portfolio[columnName as keyof Portfolio] !== undefined
                  ? columnName === 'primaryAssetClass'
                    ? (portfolio[columnName as keyof Portfolio] as string)
                    : `${(100 * (portfolio[columnName as keyof Portfolio] as number)).toFixed(2)}%`
                  : 'NaN'}
              </p>
              <p className="text-sm text-[var(--color-secondary-light)] dark:text-[var(--color-secondary-dark)]">{display}</p>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
};
