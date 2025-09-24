'use client';

import React from 'react';
import { IconQuantix } from '../icons';
import Link from 'next/link';

interface FooterProps {
  openEdit: () => void;
  logout: () => void;
}

export const Footer: React.FC<FooterProps> = ({ openEdit, logout }) => {
  return (
    <footer className="border-t border-border-light dark:border-border-dark py-8">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-row gap-6">
          {/* Logo Section */}
          <div className="hidden sm:flex flex-1 justify-start mb-0">
            <IconQuantix size="48" />
          </div>

          {/* Navigation Links */}
          <div className="flex flex-1 flex-col text-center">
            <h3 className="text-base sm:text-lg font-semibold text-accent-light dark:text-accent-dark">Navigation</h3>
            <ul className="space-y-1 sm:space-y-2 text-sm sm:text-base">
              <li>
                <Link
                  href="/portfolios/"
                  className="text-secondary-light dark:text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark"
                >
                  Portfolios
                </Link>
              </li>
              <li>
                <Link
                  href="/screener"
                  className="text-secondary-light dark:text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark"
                >
                  Screener
                </Link>
              </li>
              <li>
                <Link
                  href="/compare"
                  className="text-secondary-light dark:text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark"
                >
                  Compare
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Actions */}
          <div className="flex flex-1 flex-col text-center items-center ">
            <h3 className="text-base sm:text-lg font-semibold text-accent-light dark:text-accent-dark">Account</h3>
            <ul className="space-y-1 sm:space-y-2 text-sm sm:text-base">
              <li>
                <Link
                  href="/dash"
                  className="text-secondary-light dark:text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark"
                >
                  My Dashboard
                </Link>
              </li>
              <li>
                <button
                  onClick={openEdit}
                  className="w-full cursor-pointer text-secondary-light dark:text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark"
                >
                  Edit Profile
                </button>
              </li>
              <li>
                <button
                  onClick={logout}
                  className="w-full cursor-pointer text-secondary-light dark:text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark"
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-6 sm:mt-8 text-center text-secondary-light dark:text-secondary-dark text-xs sm:text-sm">
          <p>&copy; 2025 Quantix. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};