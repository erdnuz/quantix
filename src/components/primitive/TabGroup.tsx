'use client';
import React from 'react';

interface TabGroupProps<T> {
  currentTab: T;
  onSelect: (index: T) => void;
  options: T[];
}

interface TabProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

const Tab: React.FC<TabProps> = ({ label, selected, onClick }) => (
  <button
    className={`
      flex-1 flex justify-center items-center px-4 py-2 min-w-0 truncate 
      text-sm font-medium transition-colors duration-200 border-b-2 
      focus:outline-none cursor-pointer
      ${selected
        ? 'border-brand-light text-primary-light dark:border-brand-dark dark:text-primary-dark'
        : 'border-transparent text-secondary-light dark:text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark hover:border-brand-hover dark:hover:border-brand-hover'}
    `}
    onClick={onClick}
  >
    {label}
  </button>
);


export function TabGroup<T extends string>({
  currentTab,
  onSelect,
  options,
}: TabGroupProps<T>) {
  return (
    <div className="flex w-full border-b border-border-light dark:border-border-dark  rounded-t-md overflow-x-auto">
      {options.map((option) => (
        <Tab
          key={option}
          label={option}
          selected={currentTab === option}
          onClick={() => currentTab !== option && onSelect(option)}
        />
      ))}
    </div>
  );
}

