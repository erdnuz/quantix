import Link from "next/link";
import { Portfolio } from "../../types";


interface PortfolioCardProps {
  portfolio: Portfolio;
}

const tagItems = [
  "Growth", "Value", "Dividend", "Balanced", "Aggressive", "Conservative",
  "Emerging Markets", "Emerging Tech", "Small Cap", "Large Cap", "Diversified", "Global",
  "Short-term", "Long-term",
];

export const PortfolioCard: React.FC<PortfolioCardProps> = ({ portfolio }) => {
  const { id, title, date, description, tags } = portfolio;

  return (
    <Link href={`/portfolio/${id}/`} className="block">
      <div className="flex flex-col w-full max-w-[600px] mb-4 p-4 rounded-lg border border-gray-300 cursor-pointer">
        {/* Top section: Title, Date, Description */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-col-reverse">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-xs text-gray-500">{date}</p>
          </div>
          <p className="text-sm truncate">{description}</p>
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.map((tagIndex, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 rounded-full bg-gray-200 border border-gray-300 whitespace-nowrap"
              >
                {tagItems[tagIndex]}
              </span>
            ))}
          </div>
        )}

        {/* Stats row */}
        <div className="flex w-full mt-2">
          {Object.entries({
            primaryClass: 'Class',
            '1y': '1y',
            '3m': '3mo',
            all: 'All time'
          }).map(([columnName, display]) => (
            <div
              key={columnName}
              className="flex flex-col flex-1 items-center justify-center"
            >
              <p className="text-base font-medium">
                {portfolio[columnName as keyof Portfolio] !== undefined
                  ? columnName === 'primaryClass'
                    ? portfolio[columnName as keyof Portfolio] as string
                    : `${(100 * (portfolio[columnName as keyof Portfolio] as number)).toFixed(2)}%`
                  : 'NaN'}
              </p>
              <p className="text-sm text-gray-500">{display}</p>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
};
