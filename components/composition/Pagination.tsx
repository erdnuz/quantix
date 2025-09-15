'use client'
import React, { useState } from "react";
import { IconArrowLeft, IconArrowRight } from "../icons";
import { Button } from '../primitive';

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ totalPages, currentPage, onPageChange }) => {
  const [inputValue, setInputValue] = useState<string>("");

  const getPages = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage < 5) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage > totalPages - 3) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        if (currentPage !== 2) pages.push(1);
        if (currentPage > 4) pages.push("...");
        pages.push(currentPage - 1, currentPage, currentPage + 1);
        if (currentPage < totalPages - 2) pages.push("...");
        if (currentPage !== totalPages - 1) pages.push(totalPages);
      }
    }
    return pages;
  };

  const handlePageClick = (page: number | string) => {
    if (page !== "..." && page !== currentPage) onPageChange(Number(page));
  };

  const handleGoToPage = () => {
    const pageNumber = parseInt(inputValue, 10);
    if (!isNaN(pageNumber)) {
      onPageChange(Math.max(1, Math.min(pageNumber, totalPages)));
      setInputValue("");
    }
  };

  return (
    <div className="relative w-full flex justify-center mt-4">
      {/* Pagination buttons */}
      <div className="flex items-center gap-2">
        <button
          className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <IconArrowLeft className="w-4 h-4" />
        </button>

        {getPages().map((page, idx) => (
          <button
            key={idx}
            className={`w-8 h-8 flex items-center justify-center rounded 
              ${page === currentPage ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200"} 
              ${page === "..." ? "cursor-default" : "cursor-pointer"}`}
            onClick={() => handlePageClick(page)}
            disabled={page === "..."}
          >
            {page}
          </button>
        ))}

        <button
          className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
          onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <IconArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Go to page input */}
      <div className="absolute right-0 flex items-center gap-2">
        <input
          type="number"
          min={1}
          max={totalPages}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Go"
          className="w-16 p-1 border rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
        <Button label="Go" onClick={handleGoToPage} />
      </div>
    </div>
  );
};
