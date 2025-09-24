'use client';

import React from 'react';
import { IconQuantix } from '../icons';
import { Login, Search, DropdownMenu } from '../primitive';
import Link from 'next/link';
import { User } from '../../../types';

interface HeaderProps {
  currentUser: User | null;
  openAuth: () => void;
  signOut: () => void;
  openEdit: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  openAuth,
  signOut,
  openEdit,
}) => {
  return (
    <header
      className="
        sticky top-0 z-50 w-full
        backdrop-blur-lg
        dark:bg-dark
        text-primary-light dark:text-primary-dark
        border-b border-border-light dark:border-border-dark
        shadow-md
      "
    >
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">

          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2">
            <IconQuantix size="40" />
          </Link>

          {/* Right: Nav & Controls */}
          <div className="ml-auto flex items-center gap-6">

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-8 font-medium text-secondary-light dark:text-secondary-dark">
              {[
                { href: '/portfolios', label: 'Portfolios' },
                { href: '/screener', label: 'Screener' },
                { href: '/compare', label: 'Compare' },
                { href: '/dash', label: 'Dashboard' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:text-primary-light dark:hover:text-primary-dark transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Search label="Search assets..." />
            </nav>

            {/* Dropdown & Login */}
            <DropdownMenu
              currentUser={currentUser}
              openAuth={openAuth}
              signOut={signOut}
              openEdit={openEdit}
            />
            <Login
              currentUser={currentUser}
              openAuth={openAuth}
              signOut={signOut}
              openEdit={openEdit}
            />
          </div>
        </div>
      </div>
    </header>
  );
};
