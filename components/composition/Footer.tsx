'use client';

import React from 'react';
import { IconQuantix } from '../icons';
import styles from './footer.module.css';
import Link from 'next/link';

interface FooterProps {
  openContact: () => void;
  openEdit: () => void;
  logout: () => void;
}

export const Footer: React.FC<FooterProps> = ({ openContact, openEdit, logout }) => {
  return (
    <div className={styles.footer}>
      <div className={styles.content}>
        <div className={styles.logo}>
          <IconQuantix size="48" />
        </div>

        <div className={styles.links}>
          <div className={styles.title}>Navigation</div>
          <Link href="/portfolios/" className={styles.item}>Portfolios</Link>
          <Link href="/screener" className={styles.item}>Screener</Link>
          <Link href="/compare" className={styles.item}>Compare</Link>
          <Link href="/macro" className={styles.item}>Macro Risk</Link>
        </div>

        <div className={styles.links}>
          <div className={styles.title}>Resources</div>
          <button onClick={openContact} className={styles.item}>Contact</button>
          <Link href="/faq" className={styles.item}>FAQ</Link>
          <Link href="/terms" className={styles.item}>Terms and Condition</Link>
          <Link href="/privacy" className={styles.item}>Privacy Policy</Link>
        </div>

        <div className={styles.links}>
          <div className={styles.title}>Account</div>
          <Link href="/dash" className={styles.item}>My Dashboard</Link>
          <button onClick={openEdit} className={styles.item}>Edit Profile</button>
          <button onClick={logout} className={styles.item}>Logout</button>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>&copy; 2025 Quantix. All Rights Reserved.</p>
      </div>
    </div>
  );
};
