'use client';
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
    <div className="relative w-full flex justify-center mt-6">
      {/* Pagination buttons */}
      <div className="flex items-center gap-2">
        <button
          className="p-2 rounded-md hover:bg-surface-light dark:hover:bg-surface-dark disabled:opacity-50"
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <IconArrowLeft className="w-4 h-4 text-primary-light dark:text-primary-dark" />
        </button>

        {getPages().map((page, idx) => (
          <button
            key={idx}
            className={`text-xs sm:text-sm w-6 h-5 sm:w-10 sm:h-10 flex items-center justify-center rounded-md  font-medium
              ${page === currentPage 
                ? "bg-accent-light dark:bg-accent-dark text-light dark:text-dark" 
                : "bg-surface-light dark:bg-surface-dark text-primary-light dark:text-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark"}
              ${page === "..." ? "cursor-default" : "cursor-pointer"}
            `}
            onClick={() => handlePageClick(page)}
            disabled={page === "..."}
          >
            {page}
          </button>
        ))}

        <button
          className="p-2 rounded-md hover:bg-surface-light dark:hover:bg-surface-dark disabled:opacity-50"
          onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <IconArrowRight className="w-4 h-4 text-primary-light dark:text-primary-dark" />
        </button>
      </div>

      {/* Go to page input */}
      <div className="hidden absolute right-0 md:flex items-center gap-2">
        <input
          type="number"
          min={1}
          max={totalPages}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Page #"
          className="
            w-18 lg:w-24 h-12 p-2 
            text-xs lg:text-base 
            rounded-md 
            border border-border-light dark:border-border-dark 
            text-center 
            text-primary-light dark:text-primary-dark 
            bg-surface-light dark:bg-surface-dark 
            focus:outline-none focus:ring-1 focus:ring-accent-light dark:focus:ring-accent-dark
            appearance-none
          "
        />

        <Button
          type="brand"
          label="Go"
          onClick={handleGoToPage}
          className="rounded-md px-4 py-2"
        />
      </div>
    </div>
  );
};
