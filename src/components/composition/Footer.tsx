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
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="max-w-screen-xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Logo Section */}
          <div className="flex justify-center sm:justify-start">
            <IconQuantix size="48" />
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/portfolios/" className="text-gray-600 hover:text-blue-600">Portfolios</Link>
              </li>
              <li>
                <Link href="/screener" className="text-gray-600 hover:text-blue-600">Screener</Link>
              </li>
              <li>
                <Link href="/compare" className="text-gray-600 hover:text-blue-600">Compare</Link>
              </li>
              <li>
                <Link href="/macro" className="text-gray-600 hover:text-blue-600">Macro Risk</Link>
              </li>
            </ul>
          </div>

          {/* Account Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Account</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dash" className="text-gray-600 hover:text-blue-600">My Dashboard</Link>
              </li>
              <li>
                <button
                  onClick={openEdit}
                  className="w-full text-left text-gray-600 hover:text-blue-600"
                >
                  Edit Profile
                </button>
              </li>
              <li>
                <button
                  onClick={logout}
                  className="w-full text-left text-gray-600 hover:text-blue-600"
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-8 text-center text-gray-600">
          <p>&copy; 2025 Quantix. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};
