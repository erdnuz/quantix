'use client';
import React from 'react';

interface PillProps {
  size?: 0 | 1;
  label: string;
  selected: boolean;
  onClick: () => void;
}

const Pill: React.FC<PillProps> = ({ size = 1, label, selected, onClick }) => {
  const baseClasses = 'flex flex-1 items-center justify-center rounded-lg cursor-pointer transition-colors';
  const sizeClasses = size === 0 ? 'text-base py-1 px-4' : 'text-lg py-2 px-4';
  const selectedClasses = selected
    ? 'bg-brand-secondary text-on-brand-secondary'
    : 'text-text-secondary hover:text-text-default';
  const classes = `${baseClasses} ${sizeClasses} ${selectedClasses}`;

  return (
    <button className={classes} onClick={onClick}>
      {label}
    </button>
  );
};

interface PillGroupProps {
  currentPill: number;
  size?: 0 | 1;
  onSelect: (index: number) => void;
  options: string[];
}

export const PillGroup: React.FC<PillGroupProps> = ({ currentPill, size = 1, onSelect, options }) => {
  return (
    <div className="flex bg-neutral-secondary rounded-lg w-full min-w-fit">
      {options.map((option, index) => (
        <Pill
          key={option}
          size={size}
          label={option}
          selected={currentPill === index}
          onClick={() => {
            if (currentPill !== index) onSelect(index);
          }}
        />
      ))}
    </div>
  );
};
