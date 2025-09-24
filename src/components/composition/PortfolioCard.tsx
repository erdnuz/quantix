import Link from "next/link";
import { Portfolio } from "../../../types";

interface PortfolioCardProps {
  portfolio: Portfolio;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({ portfolio }) => {
  const { id, title, created, description, tags } = portfolio;

  const stats = {
    Class: portfolio.primaryAssetClass,
    YoY: portfolio.oneYearGrowth,
    '3mo': portfolio.threeMonthGrowth,
    CAGR: portfolio.cagr,
  };

  return (
    <Link href={`/portfolios/${id}/`} className="block">
      <div className="flex flex-col w-full max-w-[600px] p-4 sm:p-6 rounded-xl border shadow hover:shadow-lg transition-shadow
                      bg-surface-light dark:bg-surface-dark
                      border-border-light dark:border-border-dark">

        {/* Title and date */}
        <div className="flex justify-between items-baseline gap-2">
          <h3 className="text-lg sm:text-xl font-semibold text-primary-light dark:text-primary-dark truncate">{title}</h3>
          <p className="text-xs text-secondary-light dark:text-secondary-dark">Created {created}</p>
        </div>

        {/* Description */}
        <p className="text-sm mt-2 text-text-light dark:text-text-dark line-clamp-2">{description}</p>

        {/* Tags */}
        {tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 rounded-full border
                           bg-surface-light-secondary dark:bg-surface-dark-secondary
                           border-border-light dark:border-border-dark
                           text-text-light dark:text-text-dark"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex flex-wrap gap-2 mt-3">
          {Object.entries(stats).map(([label, value]) => (
            <div
              key={label}
              className={`${label=='YoY' || label == '3mo'?'hidden':'flex'} md:flex flex-col items-center justify-center min-w-[60px] py-2 px-3 rounded bg-surface-light dark:bg-surface-dark`}
            >
              <p className="text-sm font-medium text-text-light dark:text-text-dark truncate">
                {typeof value === 'number' ? `${(100 * value).toFixed(2)}%` : value ?? 'N/A'}
              </p>
              <p className="text-xs text-secondary-light dark:text-secondary-dark">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
};
