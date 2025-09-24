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

interface FilterGroupProps<T> {
  items: Filter<T>[];
}

export const FilterGroup = <T,>({ items }: FilterGroupProps<T>) => (
  <div className="flex flex-wrap gap-1 sm:gap-2 mb-2">
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
  iconType?: 'hash' | 'check' | 'X';
  selectedIndices: number[];
  setSelectedIndices: (indices: number[]) => void;
}

const Tag: React.FC<TagProps> = ({ item, index, isSelected, onClick, iconType }) => {
  const baseClasses = `
    inline-flex items-center align-text-bottom justify-center font-medium whitespace-nowrap 
    transition-colors duration-200 rounded-full cursor-pointer
    focus:outline-none focus:ring-2 focus:ring-offset-1 
    focus:ring-brand-light dark:focus:ring-brand-dark
  `;

  const sizeClasses = 'text-[10px] sm:text-xs md:text-base gap-1.5 px-2 py-1';

  const stateClasses = isSelected
    ? 'bg-brand-light text-light dark:bg-brand-dark dark:text-dark'
    : 'bg-surface-light dark:bg-surface-dark text-secondary-light dark:text-secondary-dark hover:bg-brand-hover hover:text-light dark:hover:bg-brand-hover';

  const iconSizeClasses = 'w-3 h-3 sm:w-4 sm:h-4'; // 12px on small screens, 16px on sm+

  const renderIcon = () => {
    if (!isSelected || !iconType) return null;

    const iconProps = { className: `text-light dark:text-dark ${iconSizeClasses}` };
    switch (iconType) {
      case 'hash':
        return <IconHash  {...iconProps} />;
      case 'check':
        return <IconCheck {...iconProps} />;
      case 'X':
        return <IconX {...iconProps} />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`${baseClasses} ${sizeClasses} ${stateClasses}`}
      onClick={() => onClick(index)}
      role="button"
      aria-pressed={isSelected}
    >
      {renderIcon()}
      {item}
    </div>
  );
};


