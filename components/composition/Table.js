'use client'
import React, { useState, useMemo, useEffect } from 'react';
import { IconChevronDown, IconChevronUp } from "../icons";
import { Pagination } from "./Pagination"; 
import { Ranking } from "../primitive"; // Assuming Pagination is a separate component
import styles from "./table.module.css";

const RANKING_COL_NAMES = ["OVERALL"]

const Cell = ({ 
  children, 
  isSortable=false, 
  isRanking = false, 
  isPercent = false, 
  isPercentNeutral = false,
  isTicker = false, 
  isLarge = false, 
  isPrice = false, 
  header = false, 
  index = false, 
  sort, 
  order = 'none' 
}) => {
  const formatLargeNumber = (number) => {
    if (number >= 1e12) return `${(number / 1e12).toFixed(2)}T`;
    if (number >= 1e9) return `${(number / 1e9).toFixed(2)}B`;
    if (number >= 1e6) return `${(number / 1e6).toFixed(2)}M`;
    if (number >= 1e3) return `${(number / 1e3).toFixed(2)}K`;
    return `${number.toFixed(0)}`;
  };

  return (
    <div
      onClick={isSortable ? sort : null}
      className={`${styles.cell} ${header ? styles['table-head'] : ''} ${isTicker ? styles['ticker-head'] : ''} ${index ? styles['table-index'] : ''} ${isRanking ? styles['ranking'] : ''}`}
    > 
      {isRanking ? (
        <Ranking barOnly={true} score={children?children.toFixed(2):'none'} />
      ) : isPercent && !header ? (
        <p style={{width:'100%', textAlign:'left', color: children?children >= 0 ? '#089981' : '#f23645':'var(--sds-color-text-default-default)', fontWeight:600}}>
          {children?`${(100*children).toFixed(2)}%`:"NaN" }
        </p>
      ) : isPercentNeutral && !header ? (
        <p style={{width:'100%', textAlign:'left', fontWeight:600}}>
          {children?`${(100*children).toFixed(2)}%`:"NaN"}
        </p>
      
      ) : isPrice ? (
        <p style={{width:'100%', textAlign:'left'}}>
          {children?`$${Number(children).toFixed(2)}`:"NaN"}
        </p>
      ) : isLarge ? (
        <p style={{width:'100%', textAlign:'left'}}>
          {children?formatLargeNumber(Number(children)):"NaN"}
        </p>
      ) : (
        typeof children === 'number' && !isNaN(children) ? (
          Number(children).toFixed(2) 
        ) : (
          <p className={styles.textCell}>
            {children || "NaN"}
          </p>
        )
      )}

      {(isSortable && order !== 'none') ? (
        order === 'desc' ? <IconChevronDown className={styles.chevron} size='24' /> :
           <IconChevronUp className={styles.chevron} size='24' />
      ) : isSortable?(
        <div style={{ width: '24px', height: '24px' }} />
      ):null}
    </div>
  );
};


export function Table({ header, data, filters, isIndexed = false, hints = false, rowsPerPage = 50, columnDetails, error, defSort=null }) {
  const [sortColumn, setSortColumn] = useState(defSort);
  const [sortOrder, setSortOrder] = useState(defSort ? 'desc' : 'none');
  const [currentPage, setCurrentPage] = useState(1);

  // Memoize the filtered data so it's calculated only when necessary
  const memoizedFilteredData = useMemo(() => {
    const applyFilters = (rows) => {
      let filteredRows = [...rows];
      filters.forEach((filter) => {
        filteredRows = filteredRows.filter((row) => filter.fit(row));
      });
      return filteredRows;
    };
    return filters.length > 0 ? applyFilters(data) : data;
  }, [filters, data]);

  // Memoize the sorted rows so it's calculated only when necessary
  const sortedRows = useMemo(() => {
    // Early return if there's no sorting required
    if (sortColumn === null || !memoizedFilteredData.length) return memoizedFilteredData;

    const sortedRows = [...memoizedFilteredData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      if (!aValue) return 1;
      if (!bValue) return -1;
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sortedRows;
  }, [sortColumn, sortOrder, memoizedFilteredData]);

  // Pagination: Calculate total pages
  const totalPages = Math.ceil(sortedRows.length / rowsPerPage);

  // Handle pagination logic
  useEffect(() => {
    const newTotalPages = Math.ceil(memoizedFilteredData.length / rowsPerPage);
    setCurrentPage((prev) => Math.min(Math.max(1, prev), newTotalPages));
  }, [memoizedFilteredData, rowsPerPage]);

  // Pagination slice: Only show rows for the current page
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;
  const currentPageRows = sortedRows.slice(startIdx, endIdx);

  // Sorting function to handle column click
  const handleSort = (columnName) => {
    const newSortOrder = (sortColumn === columnName && sortOrder === 'asc') ? 'desc' : 'asc';
    setSortColumn(columnName);
    setSortOrder(newSortOrder);
  };

  

  return (
    <div>
    {sortedRows.length > 0? 
      (
    <div className={styles["table-display"]}>
      
      {hints ?
        (<div className={styles["table-hints"]}>
          <p className={styles["hint"]}>Displaying results {startIdx + 1}-{Math.min(endIdx, sortedRows.length)} of {sortedRows.length}</p>

          <p className={styles["hint"]}>All currency in USD</p>
        </div>) : null}

      <div className={styles["table-container"]}>
        <table>
          <thead>
            <tr>
              {columnDetails.public.map((cell, index) => (
                 (
                  <th key={index}>
                    <Cell
                      isSortable={true}
                      order={sortColumn === cell ? sortOrder : 'none'}
                      header={true}
                      isTicker = {index===0}
                      sort={() => handleSort(cell)} // Handle column click for sorting
                    >
                      {header[index]}
                    </Cell>
                  </th>
                )))}
            </tr>
          </thead>
          <tbody>
            {currentPageRows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columnDetails.public.map((columnName, colIndex) => (
                   (
                    <td key={colIndex}>
                      <Cell isSortable={false} index={isIndexed && (colIndex === 0)} isRanking={RANKING_COL_NAMES.includes(columnName)} 
                      isPercent={columnDetails.percent.includes(columnName)} 
                      isPercentNeutral={columnDetails?.percentNeutral?.includes(columnName)} 
                      isLarge={columnDetails.large.includes(columnName)}
                      isPrice={columnDetails?.price?.includes(columnName)}>
                        {columnName === "ticker" ?
                        <a href={`/metrics/${row[columnName]}/`}  className={styles["ticker-cell"]}>
                          {row[columnName]}
                        </a>:
                        columnName === "title" ?
                        <a href={`/portfolio/${row.id}/`}  className={styles["ticker-cell"]}>
                          {row[columnName]}
                        </a>:
                        columnName === "action" ?
                        ["Sell", "Buy"][row[columnName]]
                        :
                        columnName === "type" ?
                        {"0":"Equity", "1":"ETFs", "2":"Mutual Funds"}[row[columnName]]
                        :
                        row[columnName]
                        }
                      </Cell>
                    </td>
                  )))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 ?
      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />: null}
    </div>
  ) :
  filters.length>0?
  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
    
    <h3 className="head">No results</h3>
    <h4 className="subhead">Your query is too narrow</h4>
  </div>:
  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
    
  <h3 className="subhead">{error}</h3>
</div>

  }
</div>
  );
}
