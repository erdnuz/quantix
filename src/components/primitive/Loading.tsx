'use client';
import React from 'react';
import { BounceLoader } from 'react-spinners';
import clsx from 'clsx';

export const Loading: React.FC = () => {
  // Dynamically pick color based on theme (light/dark)
  const loaderColor = clsx(
    'text-primary-light dark:text-primary-dark'
  );

  return (
    <div className="w-full p-8 flex justify-center">
      <BounceLoader 
        color="currentColor" // uses CSS currentColor
        size={100} 
        speedMultiplier={1.2} 
        className={loaderColor}
      />
    </div>
  );
};
