'use client';
import React from 'react';

interface TabGroupProps {
  currentTab: number;
  onSelect: (index: number) => void;
  options: string[];
}

interface TabProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

const Tab: React.FC<TabProps> = ({ label, selected, onClick }) => (
  <button
    className={`flex justify-center px-4 py-2 min-w-fit border-b-2 text-center truncate cursor-pointer
      ${selected 
        ? 'border-gray-400 text-gray-900' 
        : 'border-gray-300 text-gray-500 hover:border-gray-500 hover:text-gray-700'
      }`}
    onClick={onClick}
  >
    {label}
  </button>
);

export const TabGroup: React.FC<TabGroupProps> = ({ currentTab, onSelect, options }) => {
  return (
    <div className="flex flex-wrap justify-around pb-1 max-w-full">
      {options.map((option, index) => (
        <Tab
          key={option}
          label={option}
          selected={currentTab === index}
          onClick={() => currentTab !== index && onSelect(index)}
        />
      ))}
    </div>
  );
};
