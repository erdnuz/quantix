'use client';
import React from 'react';
import { IconHash, IconCheck, IconX } from '../icons';
import { Filter } from '../../../types';

interface TagProps {
  item: string;
  size?: 1 | 0;
  index: number;
  isSelected: boolean;
  onClick: (index: number) => void;
  iconType?: 'hash' | 'check' | 'X';
}

interface FilterGroupProps {
  items: Filter[];
}

export const FilterGroup: React.FC<FilterGroupProps> = ({ items }) => (
  <div className="flex flex-wrap gap-2 mb-2">
    {items.map((item, index) =>
      item.display ? (
        <Tag
          key={index}
          item={`${item.display} ${item.label}`}
          index={index}
          isSelected={true}
          onClick={() => item.onRemove?.()}
          iconType="X"
        />
      ) : null
    )}
  </div>
);

export const TagGroup: React.FC<TagGroupProps> = ({
  items,
  size = 1,
  iconType,
  selectedIndices,
  setSelectedIndices,
}) => {
  const handleTagClick = (index: number) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter((i) => i !== index));
    } else {
      setSelectedIndices([...selectedIndices, index]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {items.map((item, index) => (
        <Tag
          key={index}
          item={item}
          size={size}
          index={index}
          isSelected={selectedIndices.includes(index)}
          onClick={handleTagClick}
          iconType={iconType}
        />
      ))}
    </div>
  );
};


interface TagGroupProps {
  items: string[];
  size?: 1 | 0;
  iconType?: 'hash' | 'check' | 'X';
  selectedIndices: number[];
  setSelectedIndices: (indices: number[]) => void;
}

const Tag: React.FC<TagProps> = ({
  item,
  size = 1,
  index,
  isSelected,
  onClick,
  iconType,
}) => {
  // 16px / 14px icons
  const iconSize = size ? 16 : 14;

  const baseClasses = `inline-flex items-center font-medium whitespace-nowrap transition-colors duration-200 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand-light dark:focus:ring-brand-dark`;

  // size variant
  const sizeClasses = size
    ? 'text-sm gap-2 px-3 py-1.5'
    : 'text-xs gap-1.5 px-2 py-1';

  // state variant
  const stateClasses = isSelected
    ? 'bg-brand-light text-light dark:bg-brand-dark dark:text-dark'
    : 'bg-surface-light dark:bg-surface-dark text-secondary-light dark:text-secondary-dark hover:bg-brand-hover hover:text-light dark:hover:bg-brand-hover';

  return (
    <div
      className={`${baseClasses} ${sizeClasses} ${stateClasses}`}
      onClick={() => onClick(index)}
      role="button"
      aria-pressed={isSelected}
    >
      {isSelected && iconType && (
        <>
          {iconType === 'hash' && <IconHash size={iconSize} className="text-light dark:text-dark" />}
          {iconType === 'check' && <IconCheck size={iconSize} className="text-light dark:text-dark" />}
          {iconType === 'X' && <IconX size={iconSize} className="text-light dark:text-dark" />}
        </>
      )}
      {item}
    </div>
  );
};

