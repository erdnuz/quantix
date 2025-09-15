'use client';
import { IconMenu } from "../icons";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface DropdownMenuProps {
  className?: string;
  currentUser?: any;
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
    { href: "/macro", label: "Macro Risk" },
    { href: "/dash", label: "Dashboard" },
  ];

  return (
    <div className={`relative w-[140px] ${className}`}>
      <div
        ref={dropdownRef}
        className={`flex items-center justify-center p-1 w-full relative ${isDropdownOpen ? 'rounded-t-lg border border-gray-300 cursor-pointer' : ''}`}
      >
        <IconMenu
          size={32}
          className="cursor-pointer text-gray-700 hover:text-gray-900"
          onClick={toggleDropdown}
        />

        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 bg-gray-100 border border-gray-300 border-t-0 rounded-b-lg z-50 overflow-y-auto">
            {links.map((link, idx) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-200 truncate ${idx === 0 ? 'border-t border-gray-300' : ''} ${idx === links.length - 1 ? '' : 'border-b border-gray-300'}`}
                onClick={() => closeDropdown()}
              >
                {link.label}
              </Link>
            ))}

            {currentUser && (
              <button
                className="flex px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-200 w-full text-left truncate"
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
                className="flex px-4 py-3 text-red-600 hover:bg-red-100 w-full text-left truncate font-medium"
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
                className="flex px-4 py-3 text-blue-600 hover:bg-blue-100 w-full text-left truncate font-medium"
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
