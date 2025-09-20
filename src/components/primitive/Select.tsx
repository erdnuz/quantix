'use client';
import React, { useState, useRef, useEffect } from 'react';
import { IconChevronDown } from '../icons/IconChevronDown';

interface SelectProps {
  options: Record<string, number|string|null>[];
  size?: 0 | 1;
  selected: number;
  setSelected: (index: number) => void;
}

export const Select: React.FC<SelectProps> = ({ options, size = 1, selected, setSelected }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const handleToggleDropdown = () => {
    if (options.length > 1) setDropdownVisible((prev) => !prev);
  };

  const handleOptionSelect = (index: number) => {
    setSelected(index);
    setDropdownVisible(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setDropdownVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const chevronSize = size === 0 ? 16 : 24;

  return (
    <div ref={selectRef} className={`relative inline-block ${size === 0 ? 'min-w-[100px]' : 'min-w-[120px]'}`}>
      <div
        className={`flex items-center justify-between gap-2.5 px-3 py-1.5 rounded-xl border border-gray-300 bg-white cursor-pointer ${
          dropdownVisible ? 'rounded-b-none font-semibold' : ''
        }`}
        onClick={handleToggleDropdown}
      >
        <p className={`flex-1 truncate ${size === 0 ? 'text-sm' : 'text-base'}`}>{options[selected].label}</p>
        {options.length > 1 ? (
          <IconChevronDown size={chevronSize} className={`${dropdownVisible ? 'invisible' : ''}`} />
        ) : (
          <div style={{ width: chevronSize, height: chevronSize }} />
        )}
      </div>

      {dropdownVisible && (
        <div className="absolute top-full left-0 right-0 z-10 max-h-52 overflow-y-auto rounded-b-xl border border-gray-300 border-t-0 bg-gray-50">
          {options.map((k, index) =>
            index !== selected ? (
              <p
                key={index}
                className={`px-3 py-2 cursor-pointer w-full truncate hover:bg-gray-100 hover:text-gray-900 ${
                  index === options.length - 1 ? '' : 'border-b border-gray-300'
                } ${size === 0 ? 'text-sm' : 'text-base'}`}
                onClick={() => handleOptionSelect(index)}
              >
                {k.label}
              </p>
            ) : null
          )}
        </div>
      )}
    </div>
  );
};
