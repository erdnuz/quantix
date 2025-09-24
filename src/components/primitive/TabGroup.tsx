'use client';
import React, { useEffect, useState } from 'react';

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
      flex-1 flex justify-center items-center px-3 py-2 sm:px-4 sm:py-3 min-w-0 truncate 
      text-xs md:text-sm lg:text-base font-medium transition-colors duration-200 border-b-2 
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
    <div className="flex w-full border-b border-border-light dark:border-border-dark rounded-t-md overflow-x-auto scrollbar-thin scrollbar-thumb-accent-light dark:scrollbar-thumb-accent-dark">
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

import { Select } from './Select';

function useIsMediumOrSm() {
  const [isMediumOrSm, setIsMediumOrSm] = useState(false);

  useEffect(() => {
    const update = () => setIsMediumOrSm(window.innerWidth <= 768); // md breakpoint
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return isMediumOrSm;
}

interface ResponsiveTabsProps<T extends string> {
  currentTab: T;
  onSelect: (tab: T) => void;
  options: T[];
}

export function ResponsiveTabs<T extends string>({ currentTab, onSelect, options }: ResponsiveTabsProps<T>) {
  const isMediumOrSm = useIsMediumOrSm();
  const selectedIndex = options.indexOf(currentTab);

  if (isMediumOrSm) {
    // Render the Select dropdown on medium/small screens
    return (
      <Select
        options={options.map((label) => ({ label }))}
        selected={selectedIndex}
        setSelected={(index) => onSelect(options[index])}
      />
    );
  }

  // Render the TabGroup on large screens
  return <TabGroup currentTab={currentTab} onSelect={onSelect} options={options} />;
}
