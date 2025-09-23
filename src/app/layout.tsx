import React, { ReactNode } from 'react';
import { AppContent } from '../components/AppContent';
import { AuthProvider } from '../../services/useAuth';
import './globals.css';

export const metadata = {
  title: 'Quantix',
  description:
    'Quantix empowers investors with data-driven insights to analyze stocks, ETFs, mutual funds, and portfolios.',
  keywords:
    'investing, stocks, ETFs, mutual funds, financial analysis, portfolio management, risk assessment',
  author: 'Quantix Team',
  openGraph: {
    type: 'website',
    title: 'Quantix - Data-Driven Investment Insights',
    description:
      'Quantix empowers investors with data-driven insights to analyze stocks, ETFs, mutual funds, and portfolios.',
    url: 'https://quant-algo-4430a.web.app',
    image: '/logo512.png',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quantix - Data-Driven Investment Insights',
    description:
      'Quantix empowers investors with data-driven insights to analyze stocks, ETFs, mutual funds, and portfolios.',
    image: '/logo512.png',
  },
  icons: {
    icon: '/logo.svg',
    type: 'image/svg+xml',
  },
  canonical: 'https://quant-algo-4430a.web.app',
};

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <body className="
        bg-light text-primary-light 
        dark:bg-dark dark:text-primary-dark 
        min-h-screen
      ">
        <AuthProvider>
          <AppContent>
            {children}
          </AppContent>
        </AuthProvider>
      </body>
    </html>
  );
}
