'use client';
import { IconMenu } from "../icons";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { User } from "../../../types";

interface DropdownMenuProps {
  className?: string;
  currentUser?: User | null;
  openAuth: () => void;
  signOut: () => void;
  openEdit: () => void;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  className = '',
  currentUser,
  openAuth,
  signOut,
  openEdit
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsDropdownOpen(prev => !prev);

  const closeDropdown = (event?: MouseEvent) => {
    if (!event || (dropdownRef.current && !dropdownRef.current.contains(event.target as Node))) {
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

  const links = [
    { href: "/portfolios", label: "Portfolios" },
    { href: "/screener", label: "Screener" },
    { href: "/metrics", label: "Metrics" },
    { href: "/compare", label: "Compare" },
    { href: "/dash", label: "Dashboard" },
  ];

  return (
    <div className={`relative w-[140px] md:hidden  ${className}`}>
      <div
        ref={dropdownRef}

        className="
          flex-1 flex justify-end"
      >
        <IconMenu
          size={32}
          className="text-secondary-light dark:text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark"
          onClick={toggleDropdown}
        />

        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 bg-light dark:bg-dark border border-border-light dark:border-border-dark border-t-0 rounded-lg z-50 overflow-y-auto shadow-md">
            {links.map((link, idx) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  block text-sm px-4 py-2 text-primary-light dark:text-primary-dark truncate
                  hover:bg-accent-light/10 dark:hover:bg-accent-dark/10
                  ${idx === 0 ? 'border-t border-b border-border-light dark:border-border-dark' : 
                  'border-b border-border-light dark:border-border-dark'}
                `}
                onClick={() => closeDropdown()}
              >
                {link.label}
              </Link>
            ))}

            {currentUser && (
              <button
                className="block text-sm px-4 py-2 border-b border-border-light dark:border-border-dark text-primary-light dark:text-primary-dark hover:bg-accent-light/10 dark:hover:bg-accent-dark/10 w-full text-left truncate"
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
                className="block text-sm px-4 py-2 text-bad hover:bg-red-100 dark:hover:bg-red-900 w-full text-left truncate font-medium"
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
                className="block text-sm px-4 py-2 text-accent hover:bg-accent-light/10 dark:hover:bg-accent-dark/10 w-full text-left truncate font-medium"
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
};
