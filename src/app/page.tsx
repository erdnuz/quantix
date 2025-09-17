'use client';

import { Hero, ImagePanel } from '../components/composition';
import { useState, useEffect } from 'react';

const Home: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const initialTheme = (document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'light';
      setCurrentTheme(initialTheme);
    }

    const themeObserver = new MutationObserver(() => {
      if (typeof document !== 'undefined') {
        setCurrentTheme(document.documentElement.getAttribute('data-theme') as 'light' | 'dark');
      }
    });

    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => themeObserver.disconnect();
  }, []);

  return (
    <div className="flex flex-col gap-16 bg-light dark:bg-dark">
      <Hero 
        title="Quantix" 
        subtitle="Empowering Investors with Data-Driven Insights" 
      />

      <ImagePanel
        title="Build and Explore Portfolios"
        subtitle="Community Portfolios for Every Investor"
        body="Choose from expertly crafted portfolios or create your own to suit your investment strategy. Our platform offers sector-based, industry-specific, and balanced portfolios designed to meet different risk profiles and financial goals. Start optimizing your investments today."
        buttonText="Go to Portfolios"
        image={`/images/profile-${currentTheme}.png`}
        reverse={false}
        href="/portfolios"
      />

      <ImagePanel
        title="Compare Investments"
        subtitle="Make Informed Decisions with In-Depth Comparisons"
        body="Compare up to five companies, ETFs, or mutual funds side-by-side using key financial metrics and performance indicators. Gain valuable insights and identify the best investment options that align with your objectives. Our comparison tool simplifies complex data for clear, actionable insights."
        buttonText="Start Comparing"
        image={`/images/compare-${currentTheme}.png`}
        reverse={true}
        href="/compare"
        query={['AAPL', 'GOOGL', 'MSFT']}
      />

      <ImagePanel
        title="Screen Assets on Key Metrics"
        subtitle="Discover the Best Investments, Curated by Our Algorithm"
        body="Our proprietary ranking system identifies the top equities, ETFs, and mutual funds based on critical financial indicators. Whether you're looking for high-performing stocks or reliable funds, our dynamic rankings keep you informed about the best opportunities in the market."
        buttonText="Open Screener"
        image={`/images/screener-${currentTheme}.png`}
        reverse={false}
        href="/screener"
      />

    </div>
  );
};

export default Home;
