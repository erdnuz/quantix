'use client';
import React from 'react';
import { IconHash, IconCheck, IconX } from '../icons';

interface TagProps {
  item: string;
  size?: 1 | 0;
  index: number;
  isSelected: boolean;
  onClick: (index: number) => void;
  iconType?: 'hash' | 'check' | 'X';
}

const Tag: React.FC<TagProps> = ({ item, size = 1, index, isSelected, onClick, iconType }) => {
  const iconSize = size ? 4 : 3.5; // rem size: 16px / 14px
  return (
    <div
      className={`inline-flex items-center gap-${size ? 1 : 0.5} px-${size ? 2 : 1.5} py-1 rounded-${size ? 'md' : 'sm'} 
                  cursor-pointer transition-colors whitespace-nowrap 
                  ${isSelected ? 'bg-brand-default text-brand-on-brand' : 'bg-brand-tertiary text-brand-tertiary'} 
                  hover:bg-gray-100`}
      onClick={() => onClick(index)}
    >
      {isSelected && iconType && (
        <>
          {iconType === 'hash' && <IconHash size={iconSize * 4} className="text-brand" />}
          {iconType === 'check' && <IconCheck size={iconSize * 4} className="text-brand" />}
          {iconType === 'X' && <IconX size={iconSize * 4} className="text-brand" />}
        </>
      )}
      {item}
    </div>
  );
};

interface FilterGroupProps {
  items: { display: string; label: string; onRemove: () => void }[];
}

export const FilterGroup: React.FC<FilterGroupProps> = ({ items }) => (
  <div className="flex flex-wrap gap-1 mb-2">
    {items.map((item, index) =>
      item.display ? (
        <Tag
          key={index}
          item={`${item.display} ${item.label}`}
          index={index}
          isSelected={true}
          onClick={() => item.onRemove()}
          iconType="X"
        />
      ) : null
    )}
  </div>
);

interface TagGroupProps {
  items: string[];
  size?: 1 | 0;
  iconType?: 'hash' | 'check' | 'X';
  selectedIndices: number[];
  setSelectedIndices: (indices: number[]) => void;
}

export const TagGroup: React.FC<TagGroupProps> = ({ items, size = 1, iconType, selectedIndices, setSelectedIndices }) => {
  const handleTagClick = (index: number) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter((i) => i !== index));
    } else {
      setSelectedIndices([...selectedIndices, index]);
    }
  };

  return (
    <div className="flex flex-wrap gap-1 mb-2">
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
