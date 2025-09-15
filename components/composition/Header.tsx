'use client';

import React from 'react';
import { IconQuantix } from '../icons';
import { NightDayToggle, Login, Search, DropdownMenu } from '../primitive';
import styles from './header.module.css';
import Link from 'next/link';

interface HeaderProps {
  currentUser: any; // Replace 'any' with your user type
  openAuth: () => void;
  signOut: () => void;
  openEdit: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, openAuth, signOut, openEdit }) => {
  return (
    <header className={styles.header}>
      <IconQuantix size="48" />
      <NightDayToggle />

      <nav className={styles.nav}>
        <Link href="/portfolios" className={styles.item}>Portfolios</Link>
        <Link href="/screener" className={styles.item}>Screener</Link>
        <Link href="/compare" className={styles.item}>Compare</Link>
        <Link href="/macro" className={styles.item}>Macro Risk</Link>
        <Link href="/dash" className={styles.item}>My Dashboard</Link>
        <Search className={styles.search} label="Search assets..." />
      </nav>

      <DropdownMenu
        className={styles.menu}
        currentUser={currentUser}
        openAuth={openAuth}
        signOut={signOut}
        openEdit={openEdit}
      />
      <Login
        className={styles.search}
        currentUser={currentUser}
        openAuth={openAuth}
        signOut={signOut}
        openEdit={openEdit}
      />
    </header>
  );
};
