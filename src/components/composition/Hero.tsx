'use client';

import React from 'react';

interface HeroProps {
  title: string;
  subtitle?: string;
}

export const Hero: React.FC<HeroProps> = ({ title, subtitle }) => {
  return (
    <div className="flex flex-col items-center w-full px-4 sm:px-6 md:px-12 py-12 sm:py-16 md:py-20 gap-3 sm:gap-4 text-center shadow-lg box-border">
      <h1 className="m-0 text-4xl sm:text-6xl font-bold">
        {title}
      </h1>
      {subtitle && (
        <h2 className="m-0 text-base sm:text-xl md:text-2xl text-secondary-light dark:text-secondary-dark">
          {subtitle}
        </h2>
      )}
    </div>
  );
};
