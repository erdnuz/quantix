'use client';
import { IconMenu } from "../icons";
import styles from "./login.module.css";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export function DropdownMenu({ className = '', currentUser, openAuth, signOut, openEdit }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const closeDropdown = (event) => {
    if (!event || (dropdownRef.current && !dropdownRef.current.contains(event.target))) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (isDropdownOpen) {
      document.addEventListener("click", closeDropdown);
    } else {
      document.removeEventListener("click", closeDropdown);
    }
    return () => document.removeEventListener("click", closeDropdown);
  }, [isDropdownOpen]);

  return (
    <div className={`${styles["login-container"]} ${className}`}>
      <div
        ref={dropdownRef}
        className={`${styles["holder"]} ${isDropdownOpen ? styles["dropdown-active"] : ""}`}
      >
        <IconMenu
          size="32"
          className={styles["icon-user"]}
          onClick={toggleDropdown}
        />
        {isDropdownOpen && (
          <div className={styles["dropdown"]}>
            {[
              { href: "/portfolios", label: "Portfolios" },
              { href: "/screener", label: "Screener" },
              { href: "/metrics", label: "Metrics" },
              { href: "/compare", label: "Compare" },
              { href: "/macro", label: "Macro Risk" },
              { href: "/dash", label: "Dashboard" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={styles["dropdown-item"]}
                onClick={() => {closeDropdown()}}
              >
                {link.label}
              </Link>
            ))}
            {currentUser && (
              <button
                className={styles["dropdown-item"]}
                onClick={() => {
                  openEdit();
                  closeDropdown();
                }}
              >
                Edit Profile
              </button>
            )}
            {currentUser ? (
              <button
                className={`${styles["dropdown-item"]} ${styles["last"]}`}
                onClick={() => {
                  signOut();
                  closeDropdown();
                  window.location.href = "/";
                }}
              >
                Logout
              </button>
            ) : (
              <button
                className={`${styles["dropdown-item"]} ${styles["last"]}`}
                onClick={() => {
                  closeDropdown();
                  openAuth();
                }}
              >
                Login
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
