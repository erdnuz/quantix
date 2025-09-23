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
    <footer className=" border-t border-border-light dark:border-border-dark py-8">
      <div className="max-w-screen-xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Logo Section */}
          <div className="flex justify-center sm:justify-start">
            <IconQuantix size="48" />
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-accent-light dark:text-accent-dark">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/portfolios/" className="text-secondary-light dark:text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark">
                  Portfolios
                </Link>
              </li>
              <li>
                <Link href="/screener" className="text-secondary-light dark:text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark">
                  Screener
                </Link>
              </li>
              <li>
                <Link href="/compare" className="text-secondary-light dark:text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark">
                  Compare
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-accent-light dark:text-accent-dark">Account</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dash" className="text-secondary-light dark:text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark">
                  My Dashboard
                </Link>
              </li>
              <li>
                <button
                  onClick={openEdit}
                  className="w-full text-left cursor-pointer text-secondary-light dark:text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark"
                >
                  Edit Profile
                </button>
              </li>
              <li>
                <button
                  onClick={logout}
                  className="w-full text-left cursor-pointer text-secondary-light dark:text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark"
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-8 text-center text-secondary-light dark:text-secondary-dark">
          <p>&copy; 2025 Quantix. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};
