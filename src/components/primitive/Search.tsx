'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { IconSearch } from '../icons/IconSearch';
import { getStockIdsAndNames } from '../../../services/firebase/db';
import { ProxyAsset } from '../../../types';

interface SearchProps {
  label?: string;
  onClick?: ((id: string) => void) | null;
  filter?: ((asset: ProxyAsset) => boolean) | null;
}

export const Search: React.FC<SearchProps> = ({ label = 'Search', onClick = null, filter = null }) => {
  const [query, setQuery] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [suggestions, setSuggestions] = useState<ProxyAsset[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch suggestions once
  useEffect(() => {
    getStockIdsAndNames().then((data) => setSuggestions(data));
  }, []);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setDropdownVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered & sorted suggestions
  const filteredSuggestions = useMemo(() => {
    if (!query) return [];

    const lowerQuery = query.toLowerCase();
    const fillerWords = /(the|inc\.|company|corporation)/gi;

    const filtered = suggestions.filter(({ ticker, name }) => {
      const cleanName = name?.toLowerCase().replace(fillerWords, '').trim();
      return ticker.toLowerCase().startsWith(lowerQuery) || cleanName?.startsWith(lowerQuery);
    });

    const finalFiltered = filter ? filtered.filter(filter) : filtered;

    // Sort matches: exact start matches first, then by size descending
    return finalFiltered.sort((a, b) => {
      const aStarts = a.ticker.toLowerCase().startsWith(lowerQuery) || a.name.toLowerCase().startsWith(lowerQuery);
      const bStarts = b.ticker.toLowerCase().startsWith(lowerQuery) || b.name.toLowerCase().startsWith(lowerQuery);
      if (!aStarts && bStarts) return 1;
      if (aStarts && !bStarts) return -1;
      return (b.size || 0) - (a.size || 0);
    });
  }, [query, suggestions, filter]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setDropdownVisible(e.target.value.length > 0);
  };

  const handleSelect = (ticker: string) => {
    if (onClick) onClick(ticker);
    setDropdownVisible(false);
    setQuery('');
  };

  return (
    <div ref={searchRef} className={`relative inline-block`}>
      {/* Search Box */}
      <div
        className={`
          flex items-center px-3 py-1 bg-transparent text-primary-light dark:text-primary-dark placeholder-secondary-light dark:placeholder-secondary-dark
          rounded-t-2xl ${dropdownVisible ? 'rounded-b-none' : 'rounded-b-2xl'}
          border border-border-light dark:border-border-dark
        `}
      >
        <input
          type="text"
          value={query}
          placeholder={label}
          className="flex-1 bg-transparent outline-none text-primary-light dark:text-primary-dark placeholder-secondary-light dark:placeholder-secondary-dark truncate"
          onChange={handleInputChange}
        />
        <IconSearch size={24} isClickable={false} />
      </div>

      {/* Dropdown */}
      {dropdownVisible && (filter ? filteredSuggestions.filter(filter) : filteredSuggestions).length > 0 && (
        <div
          className="
            absolute top-full left-0 right-0 z-10 max-h-52 overflow-y-auto
            rounded-b-2xl border border-border-light dark:border-border-dark border-t-0
            bg-light dark:bg-dark shadow-sm
          "
        >
          {(filter ? filteredSuggestions.filter(filter) : filteredSuggestions).slice(0, 5).map(({ ticker, name }, index) =>
            onClick ? (
              <div
                key={ticker}
                className={`
                  cursor-pointer px-4 py-2 text-primary-light dark:text-primary-dark truncate
                  hover:bg-accent-light/10 dark:hover:bg-accent-dark/10
                  ${index === filteredSuggestions.length - 1 ? '' : 'border-b border-border-light dark:border-border-dark'}
                `}
                onClick={() => handleSelect(ticker)}
              >
                <span className="font-semibold">{ticker}</span> - <span>{name}</span>
              </div>
            ) : (
              <Link
                key={ticker}
                href={`/metrics/${ticker}/`}
                className={`
                  block px-4 py-2 truncate
                  hover:bg-accent-light/10 dark:hover:bg-accent-dark/10
                  ${index === filteredSuggestions.length - 1 ? '' : 'border-b border-border-light dark:border-border-dark'}
                `}
                onClick={() => {
                  setDropdownVisible(false)
                  setQuery("")
                }}
              >
                <span className="font-semibold">{ticker}</span> - <span>{name}</span>
              </Link>
            )
          )}
        </div>
      )}

      {dropdownVisible && filteredSuggestions.length === 0 && (
        <div className="absolute top-full left-0 right-0 z-10 px-4 py-2 text-secondary-light dark:text-secondary-dark cursor-auto border border-border-light dark:border-border-dark border-t-0 rounded-b-2xl bg-surface-light dark:bg-surface-dark shadow-sm">
          No results found.
        </div>
      )}
    </div>
  );
};
