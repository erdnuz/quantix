'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { IconChevronDown, IconChevronUp } from "../icons";
import { Pagination } from "./Pagination";
import { Ranking } from "../primitive";

const RANKING_COL_NAMES = ["qOverall"];

interface CellProps {
  children: any;
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

  const baseClasses =
    "flex items-center justify-between gap-2 px-2 py-1 min-w-fit";
  const headerClasses = isHeader
    ? "bg-surface-light dark:bg-surface-dark font-medium cursor-pointer"
    : "";
  const tickerClasses = isTicker ? "pl-4" : "";
  const indexClasses = isIndex ? "font-semibold bg-surface-light dark:bg-surface-dark" : "";
  const rankingClasses = isRanking ? "min-w-[140px]" : "";

  const textColor = ((isPercent && !isHeader && !isNeutral) || isColored)
    ? children >= 0
      ? "text-good"
      : "text-bad"
    : "text-primary-light dark:text-primary-dark";

  return (
    <div
      onClick={isSortable && sort ? sort : undefined}
      className={`${baseClasses} ${headerClasses} ${tickerClasses} ${indexClasses} ${rankingClasses}`}
    >
      {isRanking ? (
        <Ranking barOnly score={children ? children.toFixed(2) : "none"} />
      ) : isPercent && !isHeader && !isNeutral ? (
        <p className={`w-full text-left font-semibold ${textColor}`}>
          {children ? `${(100 * children).toFixed(2)}%` : "NaN"}
        </p>
      ) : isPercent && !isHeader ? (
        <p className="w-full text-left font-semibold text-primary-light dark:text-primary-dark">
          {children ? `${(100 * children).toFixed(2)}%` : "NaN"}
        </p>
      ) : isPrice ? (
        <p className="w-full text-left text-primary-light dark:text-primary-dark">
          {children ? `$${Number(children).toFixed(2)}` : "NaN"}
        </p>
      ) : typeof children === "number" && !isNaN(children) ? (
        <p className={isColored?textColor:"text-primary-light dark:text-primary-dark"}>{isColored&&children>=0&&'+'}{isColored?children:formatLargeNumber(children)}</p>
      ) : (
        <p className={`truncate max-w-[150px] text-primary-light dark:text-primary-dark ${textColor}`}>{children || "NaN"}</p>
      )}

      {isSortable ? (
        order !== "none" ? (
          order === "desc" ? (
            <IconChevronDown size="20" />
          ) : (
            <IconChevronUp size="20"/>
          )
        ) : (
          <div className="w-5 h-5" />
        )
      ) : null}
    </div>
  );
};

interface TableProps {
  header: string[];
  data: Record<string, any>[];
  filters?: { fit: (row: any) => boolean }[];
  isIndexed?: boolean;
  hints?: boolean;
  rowsPerPage?: number;
  columnDetails: {
    public: string[];
    percent?: string[];
    neutral?: string[];
    large?: string[];
    price?: string[];
    baseLine?: string[]
  };
  error?: string;
  defSort?: string | null;
}

export const Table: React.FC<TableProps> = ({
  header,
  data,
  filters = [],
  isIndexed = false,
  hints = false,
  rowsPerPage = 50,
  columnDetails,
  error,
  defSort = null,
}) => {
  const [sortColumn, setSortColumn] = useState<string | null>(defSort);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "none">(
    defSort ? "desc" : "none"
  );
  const [currentPage, setCurrentPage] = useState(1);

  const memoizedFilteredData = useMemo(() => {
    if (!filters.length) return data;
    return data.filter((row) =>
      filters.every((filter) => filter.fit(row))
    );
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

  const handleSort = (columnName: string) => {
    const newSortOrder =
      sortColumn === columnName && sortOrder === "asc" ? "desc" : "asc";
    setSortColumn(columnName);
    setSortOrder(newSortOrder);
  };

  if (!sortedRows.length) {
    return (
      <div className="flex flex-col justify-center items-center h-full">
        {filters.length ? (
          <>
            <h3 className="text-xl font-semibold text-primary-light dark:text-primary-dark">No results</h3>
            <h4 className="text-md text-gray-500 dark:text-gray-400">Your query is too narrow</h4>
          </>
        ) : (
          <h3 className="text-md text-gray-700 dark:text-gray-300">{error}</h3>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {hints && (
        <div className="flex justify-between mb-1 px-3 w-full text-xs text-gray-400 dark:text-gray-500">
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
              <tr key={rowIndex} className={`${rowIndex%2==0?"bg-light dark:hover:bg-dark":""}`}>
                {columnDetails.public.map((columnName, colIndex) => (
                  <td key={colIndex} className="border-t border-border-light dark:border-border-dark">
                    <Cell
                      isSortable={false}
                      isTicker={columnName=='ticker'}
                      isHeader={false}
                      isIndex={isIndexed && colIndex === 0}
                      isRanking={RANKING_COL_NAMES.includes(columnName)}
                      isPercent={columnDetails.percent?.includes(columnName) || false}
                      isNeutral={columnDetails.neutral?.includes(columnName) || false}
                      isColored={columnDetails.baseLine?.includes(columnName) || false}
                      isPrice={columnDetails.price?.includes(columnName) || false}
                    >
                      {columnName === "ticker" ? (
                        <a
                          href={`/metrics/${row[columnName]}/`}
                          className="px-2 py-0.5 bg-accent-light dark:bg-accent-dark text-light dark:text-dark rounded-full"
                        >
                          {row[columnName]}
                        </a>
                      ) : columnName === "title" ? (
                        <a
                          href={`/portfolios/${row.id}/`}
                          className="px-2 py-0.5 bg-accent-light dark:bg-accent-dark text-light dark:text-dark rounded-full"
                        >
                          {row[columnName]}
                        </a>
                      ) : (
                        row[columnName]
                      )}
                    </Cell>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};
