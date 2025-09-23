'use client';
import React, { useState, useEffect, useRef } from "react";
import { IconUser } from "../icons/IconUser";
import { Button } from ".";

interface LoginProps {
  className?: string;
  currentUser?: any;
  openAuth: () => void;
  signOut: () => void;
  openEdit: () => void;
}

export const Login: React.FC<LoginProps> = ({
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
    if (isDropdownOpen) document.addEventListener("click", closeDropdown);
    else document.removeEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, [isDropdownOpen]);

  return (
    <div className={`relative hidden sm:flex justify-end w-[140px] ${className}`}>
      {currentUser ? (
        <div ref={dropdownRef} className="relative w-full flex justify-end">
          <IconUser
            size={32}
            className="text-primary-light dark:text-primary-dark hover:text-accent-light dark:hover:text-accent-dark cursor-pointer"
            onClick={toggleDropdown}
          />

          {isDropdownOpen && (
            <div className="absolute top-full right-0 z-50 w-[140px] bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-b-lg shadow-md overflow-hidden">
              <button
                className="block w-full px-4 py-3 text-primary-light dark:text-primary-dark hover:bg-accent-light/10 dark:hover:bg-accent-dark/10 text-left"
                onClick={() => {
                  openEdit();
                  closeDropdown();
                }}
              >
                Edit Profile
              </button>
              <button
                className="block w-full px-4 py-3 text-bad hover:bg-red-100 dark:hover:bg-red-900 text-left font-medium border-t border-border-light dark:border-border-dark"
                onClick={async () => {
                  await signOut(); // make sure you pass your auth instance
                  closeDropdown();
                }}

              >
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <Button
          type="brand"
          label="Login"
          onClick={openAuth}
          className="min-w-[140px] justify-center rounded-xl"
        />
      )}
    </div>
  );
};
