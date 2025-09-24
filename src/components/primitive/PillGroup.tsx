'use client';
import React from 'react';

interface PillProps<T> {
  size?: 0 | 1;
  label: T;
  selected: boolean;
  onClick: () => void;
}

interface PillGroupProps<T> {
  currentPill: T;
  size?: 0 | 1;
  onSelect: (option: T) => void;
  options: T[];
}

function MemoPill<T extends string>({
  size = 1,
  label,
  selected,
  onClick,
}: PillProps<T>) {
  const baseClasses =
    'flex flex-1 items-center justify-center rounded-lg cursor-pointer transition-colors duration-200 ease-in-out select-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-light dark:focus:ring-brand-dark';

  const sizeClasses =
    size === 0
      ? 'text-sm py-1.5 px-3'
      : 'text-sm py-1 px-5'; // slightly larger for size=1

  const selectedClasses = selected
    ? 'bg-brand-light text-light dark:bg-brand-dark dark:text-dark'
    : 'bg-surface-light dark:bg-surface-dark text-secondary-light dark:text-secondary-dark hover:bg-brand-hover hover:text-light dark:hover:bg-brand-hover dark:hover:text-dark active:scale-95';

  const classes = `${baseClasses} ${sizeClasses} ${selectedClasses}`;

  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      aria-pressed={selected}
    >
      {label}
    </button>
  );
}

export const PillGroup = <T extends string>({
  currentPill,
  size = 1,
  onSelect,
  options,
}: PillGroupProps<T>) => {
  return (
    <div className="flex gap-2 bg-surface-light dark:bg-surface-dark rounded-lg p-1 shadow-sm w-full min-w-fit">
      {options.map((option) => (
        <MemoPill
          key={option}
          size={size}
          label={option}
          selected={currentPill === option}
          onClick={() => currentPill !== option && onSelect(option)}
        />
      ))}
    </div>
  );
};