'use client';
import React from 'react';
import { BounceLoader } from 'react-spinners';

export const Loading: React.FC = () => {
  return (
    <div className="w-full p-8 flex justify-center">
      <BounceLoader 
        color="var(--sds-color-text-default-default)" 
        size={100} 
        speedMultiplier={1.2} 
      />
    </div>
  );
};
