'use client';
import React, { useState, useRef, useEffect } from 'react';
import { IconChevronDown } from '../icons/IconChevronDown';

interface SelectProps {
  options: Record<string, number | string | null>[];
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

  return (
    <div
      ref={selectRef}
      className={`
        relative inline-block
        ${size === 0 ? 'min-w-[100px] sm:min-w-[120px]' : 'min-w-[120px] sm:min-w-[160px]'}
      `}
    >
      {/* Selected Value */}
      <div
        className={`
          flex items-center justify-between gap-2.5 px-2 sm:px-3 py-1 sm:py-2 rounded-xl border 
          bg-light border-border-light dark:bg-dark dark:border-border-dark cursor-pointer
          ${dropdownVisible ? 'rounded-b-none font-semibold' : ''}
        `}
        onClick={handleToggleDropdown}
      >
        <p className={`
          flex-1 truncate 
          ${size === 0 ? 'text-xs sm:text-sm' : 'text-xs sm:text-sm'} 
          text-primary-light dark:text-primary-dark
        `}>
          {options[selected].label}
        </p>
        {options.length > 1 ? (
          <IconChevronDown
            size={size === 0 ? 16 : 20}
            className={`${dropdownVisible ? 'invisible' : ''} text-secondary-light dark:text-secondary-dark`}
          />
        ) : (
          <div style={{ width: size === 0 ? 16 : 20, height: size === 0 ? 16 : 20 }} />
        )}
      </div>

      {/* Dropdown */}
      {dropdownVisible && (
        <div className="
          absolute top-full left-0 right-0 z-10 max-h-52 overflow-y-auto rounded-b-xl border border-border-light border-t-0 
          bg-surface-light dark:border-border-dark dark:bg-surface-dark shadow-light dark:shadow-dark
        ">
          {options.map((k, index) =>
            index !== selected ? (
              <p
                key={index}
                className={`
                  px-2 sm:px-3 py-1 sm:py-2 cursor-pointer w-full truncate 
                  text-primary-light dark:text-primary-dark 
                  hover:bg-primary-hover dark:hover:bg-primary-hover 
                  hover:text-accent-light dark:hover:text-accent-dark
                  ${index !== options.length - 1 ? 'border-b border-border-light dark:border-border-dark' : ''}
                  ${size === 0 ? 'text-xs sm:text-sm' : 'text-xs sm:text-sm'}
                `}
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
