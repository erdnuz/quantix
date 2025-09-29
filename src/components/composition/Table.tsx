'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { IconChevronDown, IconChevronUp } from "../icons";
import { Pagination } from "./Pagination";
import { Ranking } from "../primitive";
import { Filter } from '../../../types';

const RANKING_COL_NAMES = ["qOverall"];

interface CellProps {
  children: string | number | null | React.JSX.Element;
  isSortable: boolean;
  isRanking: boolean;
  isPercent: boolean;
  isNeutral: boolean;
  isTicker: boolean;
  isPrice: boolean;
  isColored: boolean;
  isHeader: boolean;
  isIndex: boolean;
  sort?: () => void;
  order?: "asc" | "desc" | "none";
}

const Cell: React.FC<CellProps> = ({
  children,
  isSortable,
  isRanking,
  isPercent,
  isNeutral,
  isTicker,
  isPrice,
  isColored,
  isHeader,
  isIndex,
  sort,
  order = "none",
}) => {
  const formatLargeNumber = (number: number) => {
    if (number >= 1e12) return `${(number / 1e12).toFixed(2)}T`;
    if (number >= 1e9) return `${(number / 1e9).toFixed(2)}B`;
    if (number >= 1e6) return `${(number / 1e6).toFixed(2)}M`;
    if (number >= 1e3) return `${(number / 1e3).toFixed(2)}K`;
    return `${number.toFixed(2)}`;
  };

  const baseClasses = "flex items-center justify-between gap-2 px-2 py-1 min-w-fit";
  const headerClasses = isHeader ? "bg-surface-light dark:bg-surface-dark font-medium cursor-pointer" : "";
  const tickerClasses = isTicker ? "pl-4" : "";
  const indexClasses = isIndex ? "font-semibold bg-surface-light dark:bg-surface-dark" : "";
  const rankingClasses = isRanking ? "min-w-[140px]" : "";

  const textColor = ((isPercent && !isHeader && !isNeutral) || isColored) && typeof children == "number"
    ? children >= 0
      ? "text-good-light dark:text-good-dark"
      : "text-bad-light dark:text-bad-dark"
    : "text-primary-light dark:text-primary-dark";

  return (
    <div
      onClick={isSortable && sort ? sort : undefined}
      className={`${baseClasses} ${headerClasses} ${tickerClasses} ${indexClasses} ${rankingClasses}`}
    >
      {isRanking ? (
        <Ranking 
          barOnly 
          score={(children && typeof children === "number") ? Number(children.toFixed(2)) : null} 
        />

      ) : isPercent && !isHeader && !isNeutral ? (
        <p className={`text-xs sm:text-base w-full text-left font-semibold ${children && textColor}`}>
          {typeof children === "number" ? `${(100 * children).toFixed(2)}%` : "NaN"}
        </p>
      ) : isPercent && !isHeader ? (
        <p className="text-xs sm:text-base w-full text-left font-semibold text-primary-light dark:text-primary-dark">
          {children&&typeof children === "number" ? `${(100 * children).toFixed(2)}%` : "NaN"}
        </p>
      ) : isPrice ? (
        <p className="text-xs sm:text-base w-full text-left text-primary-light dark:text-primary-dark">
          {children ? `$${Number(children).toFixed(2)}` : "NaN"}
        </p>
      ) : typeof children === "number" && !isNaN(children) ? (
        <p className={isColored ? `${textColor} font-semibold` : "text-xs sm:text-base text-primary-light dark:text-primary-dark"}>
          {isColored && children >= 0 && '+'}{isColored ? children : formatLargeNumber(children)}
        </p>
      ) : (
        <p className="text-xs sm:text-base truncate max-w-[100px] sm:max-w-[150px] text-primary-light dark:text-primary-dark">{children || "NaN"}</p>
      )}

      {isSortable ? (
        order !== "none" ? (
          order === "desc" ? <IconChevronDown size="20" /> : <IconChevronUp size="20" />
        ) : (
          <div className="w-5 h-5" />
        )
      ) : null}
    </div>
  );
};

interface TableProps<T extends object> {
  header: string[];
  data: T[];
  filters?: Filter<T>[];
  isIndexed?: boolean;
  hints?: boolean;
  rowsPerPage?: number;
  columnDetails: {
    public: (keyof T)[];
    percent?: (keyof T)[];
    neutral?: (keyof T)[];
    large?: (keyof T)[];
    price?: (keyof T)[];
    baseLine?: (keyof T)[]
  };
  error?: string;
  defSort?: keyof T | null;
}

export function Table<T extends object>({
  header,
  data,
  filters = [],
  isIndexed = false,
  hints = false,
  rowsPerPage = 50,
  columnDetails,
  error,
  defSort = null,
}: TableProps<T>): React.JSX.Element {
  const [sortColumn, setSortColumn] = useState<keyof T | null>(defSort);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "none">(defSort ? "desc" : "none");
  const [currentPage, setCurrentPage] = useState(1);

  const memoizedFilteredData = useMemo(() => {
    if (!filters.length) return data;
    return data.filter((row) => filters.every((filter) => filter.fit(row)));
  }, [filters, data]);

  const sortedRows = useMemo(() => {
    if (!sortColumn || !memoizedFilteredData.length) return memoizedFilteredData;
    return [...memoizedFilteredData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      if (!aValue) return 1;
      if (!bValue) return -1;
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [sortColumn, sortOrder, memoizedFilteredData]);

  const totalPages = Math.ceil(sortedRows.length / rowsPerPage);

  useEffect(() => {
    const newTotalPages = Math.ceil(memoizedFilteredData.length / rowsPerPage);
    setCurrentPage((prev) => Math.min(Math.max(1, prev), newTotalPages));
  }, [memoizedFilteredData, rowsPerPage]);

  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;
  const currentPageRows = sortedRows.slice(startIdx, endIdx);

  const handleSort = (columnName: keyof T) => {
    const newSortOrder = sortColumn === columnName && sortOrder === "asc" ? "desc" : "asc";
    setSortColumn(columnName);
    setSortOrder(newSortOrder);
  };

  if (!sortedRows.length) {
    return (
      <div className="flex flex-col justify-center items-center h-full">
        {filters.length ? (
          <>
            <h3 className="text-xl font-semibold text-primary-light dark:text-primary-dark">No results</h3>
            <h4 className="text-md text-secondary-light dark:text-secondary-dark">Your query is too narrow</h4>
          </>
        ) : (
          <h3 className="text-md text-primary-light dark:text-primary-dark">{error}</h3>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {hints && (
        <div className="hidden sm:flex justify-between mb-1 px-3 w-full text-xs text-secondary-light dark:text-secondary-dark">
          <p>
            Displaying results {startIdx + 1}-{Math.min(endIdx, sortedRows.length)} of {sortedRows.length}
          </p>
          <p>All currency in USD</p>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border-light dark:border-border-dark mb-1 bg-surface-light dark:bg-surface-dark">
        <table className="min-w-full">
          <thead>
            <tr>
              {columnDetails.public.map((cell, index) => (
                <th key={index}>
                  <Cell
                    isSortable
                    order={sortColumn === cell ? sortOrder : "none"}
                    isHeader={true}
                    isRanking={false}
                    isNeutral={false}
                    isPercent={false}
                    isPrice={false}
                    isIndex={false}
                    isColored={false}
                    isTicker={index === 0}
                    sort={() => handleSort(cell)}
                  >
                    {header[index]}
                  </Cell>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentPageRows.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 1 ? "bg-surface-light dark:bg-surface-dark" : "bg-light dark:bg-dark"}>
                {columnDetails.public.map((columnName, colIndex) => (
                  <td key={colIndex} className="border-t border-border-light dark:border-border-dark">
                    <Cell
                      isSortable={false}
                      isTicker={columnName === 'ticker'}
                      isHeader={false}
                      isIndex={isIndexed && colIndex === 0}
                      isRanking={RANKING_COL_NAMES.includes(columnName as string)}
                      isPercent={columnDetails.percent?.includes(columnName) || false}
                      isNeutral={columnDetails.neutral?.includes(columnName) || false}
                      isColored={columnDetails.baseLine?.includes(columnName) || false}
                      isPrice={columnDetails.price?.includes(columnName) || false}
                    >
                      {
  columnName === "ticker" ? (
    <a
      href={`/metrics/${String(row[columnName])}/`}
      className="px-2 py-0.5 bg-accent-light dark:bg-accent-dark text-light dark:text-dark rounded-full"
    >
      {String(row[columnName])}
    </a>
  ) : columnName === "title" ? (
    <a
      href={`/portfolios/${String(row['id' as keyof T])}/`}
      className="px-2 py-0.5 bg-accent-light dark:bg-accent-dark text-light dark:text-dark rounded-full"
    >
      {String(row[columnName])}
    </a>
  ) : (
    row[columnName] as string | number | null
  )
}

                    </Cell>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      ): null}
    </div>
  );
};
