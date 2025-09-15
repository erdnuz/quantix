'use client';
import React, { useState, useEffect, useRef } from "react";
import { IconUser } from "../icons/IconUser";
import { Button } from "./";

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
    <div className={`relative flex ${className}`}>
      {currentUser ? (
        <div ref={dropdownRef} className="flex justify-center items-center p-1 cursor-pointer rounded-t-lg border border-transparent hover:border-gray-300">
          <IconUser size={32} onClick={toggleDropdown} />
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 z-10 bg-gray-100 border border-gray-300 rounded-b-lg overflow-y-auto">
              <button
                className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-200"
                onClick={() => {
                  openEdit();
                  closeDropdown();
                }}
              >
                Edit Profile
              </button>
              <button
                className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-200 border-t border-gray-300"
                onClick={() => {
                  signOut();
                  closeDropdown();
                  window.location.href = "/";
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <Button type="brand" label="Login" onClick={openAuth} />
      )}
    </div>
  );
};
