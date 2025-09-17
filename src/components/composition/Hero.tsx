'use client';

import React from 'react';

interface HeroProps {
  title: string;
  subtitle?: string;
}

export const Hero: React.FC<HeroProps> = ({ title, subtitle }) => {
  return (
    <div className="flex flex-col items-center w-full px-6 py-18 gap-2 shadow-lg box-border text-center">
      <h1 className="m-0 text-5xl md:text-6xl font-bold">{title}</h1>
      {subtitle && (
        <h2 className="m-0 text-xl md:text-2xl text-gray-500">{subtitle}</h2>
      )}
    </div>
  );
};
