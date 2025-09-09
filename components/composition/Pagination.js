'use client'
import React, { useState } from "react";
import { IconArrowLeft, IconArrowRight } from "../icons";
import {Button} from '../primitive';
import styles from "./pagin.module.css";

export function Pagination({ totalPages, currentPage, onPageChange }) {
  const [inputValue, setInputValue] = useState("");

  const getPages = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage < 5) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage > totalPages - 3) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        if (currentPage !== 2) {
          pages.push(1);
        }
        if (currentPage > 4) {
          pages.push("...");
        }
        pages.push(currentPage - 1, currentPage, currentPage + 1);
        if (currentPage < totalPages - 2) {
          pages.push("...");
        }
        if (currentPage !== totalPages - 1) {
          pages.push(totalPages);
        }
      }
    }
    return pages;
  };

  const handlePageClick = (page) => {
    if (page !== "..." && page !== currentPage) {
      onPageChange(page);
    }
  };

  const handleGoToPage = () => {
    const pageNumber = parseInt(inputValue, 10);
    onPageChange(Math.max(1, Math.min(pageNumber, totalPages)));

    setInputValue("");
  };

  return (
    <div className={styles["pagination-container"]}>
    <div className={styles["pagination"]}>
      <button
        className={styles["pagination-arrow"]}
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <IconArrowLeft />
      </button>

      {getPages().map((page, index) => (
        <button
          key={index}
          className={`body ${styles["pagination-item"]} ${page === currentPage ? styles["active"] : ""}`}
          onClick={() => handlePageClick(page)}
          disabled={page === "..."}
        >
          {page}
        </button>
      ))}

      <button
        className={styles["pagination-arrow"]}
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <IconArrowRight />
      </button>
    </div>

      <div className={styles["pagination-goto"]}>
        <input
          type="number"
          min="1"
          max={totalPages}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Go to"
          className={`${styles["pagination-input"]} small`}
        />
        <Button
          onClick={handleGoToPage}
          label = "Go" />
    </div>
    </div>
  );
}
