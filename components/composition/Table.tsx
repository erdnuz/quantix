'use client'
import React, { useState, useMemo, useEffect } from 'react';
import { IconChevronDown, IconChevronUp } from "../icons";
import { Pagination } from "./Pagination";
import { Ranking } from "../primitive";

const RANKING_COL_NAMES = ["OVERALL"];

interface CellProps {
  children: any;
  isSortable?: boolean;
  isRanking?: boolean;
  isPercent?: boolean;
  isPercentNeutral?: boolean;
  isTicker?: boolean;
  isLarge?: boolean;
  isPrice?: boolean;
  header?: boolean;
  index?: boolean;
  sort?: () => void;
  order?: "asc" | "desc" | "none";
}

const Cell: React.FC<CellProps> = ({
  children,
  isSortable = false,
  isRanking = false,
  isPercent = false,
  isPercentNeutral = false,
  isTicker = false,
  isLarge = false,
  isPrice = false,
  header = false,
  index = false,
  sort,
  order = "none",
}) => {
  const formatLargeNumber = (number: number) => {
    if (number >= 1e12) return `${(number / 1e12).toFixed(2)}T`;
    if (number >= 1e9) return `${(number / 1e9).toFixed(2)}B`;
    if (number >= 1e6) return `${(number / 1e6).toFixed(2)}M`;
    if (number >= 1e3) return `${(number / 1e3).toFixed(2)}K`;
    return `${number.toFixed(0)}`;
  };

  const baseClasses =
    "flex items-center justify-between gap-2 px-2 py-1 min-w-fit";
  const headerClasses = header ? "bg-gray-100 cursor-pointer" : "";
  const tickerClasses = isTicker ? "pl-4" : "";
  const indexClasses = index ? "font-semibold bg-gray-50" : "";
  const rankingClasses = isRanking ? "min-w-[140px]" : "";

  return (
    <div
      onClick={isSortable && sort ? sort : undefined}
      className={`${baseClasses} ${headerClasses} ${tickerClasses} ${indexClasses} ${rankingClasses}`}
    >
      {isRanking ? (
        <Ranking barOnly score={children ? children.toFixed(2) : "none"} />
      ) : isPercent && !header ? (
        <p
          className="w-full text-left font-semibold"
          style={{
            color: children
              ? children >= 0
                ? "#089981"
                : "#f23645"
              : "inherit",
          }}
        >
          {children ? `${(100 * children).toFixed(2)}%` : "NaN"}
        </p>
      ) : isPercentNeutral && !header ? (
        <p className="w-full text-left font-semibold">
          {children ? `${(100 * children).toFixed(2)}%` : "NaN"}
        </p>
      ) : isPrice ? (
        <p className="w-full text-left">
          {children ? `$${Number(children).toFixed(2)}` : "NaN"}
        </p>
      ) : isLarge ? (
        <p className="w-full text-left">
          {children ? formatLargeNumber(Number(children)) : "NaN"}
        </p>
      ) : typeof children === "number" && !isNaN(children) ? (
        Number(children).toFixed(2)
      ) : (
        <p className="truncate max-w-[150px]">{children || "NaN"}</p>
      )}

      {isSortable ? (
        order !== "none" ? (
          order === "desc" ? (
            <IconChevronDown className="w-6 h-6" size="24" />
          ) : (
            <IconChevronUp className="w-6 h-6" size="24" />
          )
        ) : (
          <div className="w-6 h-6" />
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
    percentNeutral?: string[];
    large?: string[];
    price?: string[];
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
            <h3 className="text-xl font-semibold">No results</h3>
            <h4 className="text-md text-gray-500">Your query is too narrow</h4>
          </>
        ) : (
          <h3 className="text-md text-gray-700">{error}</h3>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {hints && (
        <div className="flex justify-between mb-1 mx-2 w-full">
          <p className="text-xs text-gray-400">
            Displaying results {startIdx + 1}-{Math.min(endIdx, sortedRows.length)} of {sortedRows.length}
          </p>
          <p className="text-xs text-gray-400">All currency in USD</p>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-1">
        <table className="min-w-full">
          <thead>
            <tr>
              {columnDetails.public.map((cell, index) => (
                <th key={index}>
                  <Cell
                    isSortable
                    order={sortColumn === cell ? sortOrder : "none"}
                    header
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
              <tr key={rowIndex}>
                {columnDetails.public.map((columnName, colIndex) => (
                  <td key={colIndex}>
                    <Cell
                      isSortable={false}
                      index={isIndexed && colIndex === 0}
                      isRanking={RANKING_COL_NAMES.includes(columnName)}
                      isPercent={columnDetails.percent?.includes(columnName)}
                      isPercentNeutral={columnDetails.percentNeutral?.includes(columnName)}
                      isLarge={columnDetails.large?.includes(columnName)}
                      isPrice={columnDetails.price?.includes(columnName)}
                    >
                      {columnName === "ticker" ? (
                        <a
                          href={`/metrics/${row[columnName]}/`}
                          className="px-1 py-0.5 bg-blue-100 rounded-full text-blue-600"
                        >
                          {row[columnName]}
                        </a>
                      ) : columnName === "title" ? (
                        <a
                          href={`/portfolio/${row.id}/`}
                          className="px-1 py-0.5 bg-blue-100 rounded-full text-blue-600"
                        >
                          {row[columnName]}
                        </a>
                      ) : columnName === "action" ? (
                        ["Sell", "Buy"][row[columnName]]
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
