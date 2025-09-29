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

  const filtered = suggestions.filter((value) => {
    // Safely extract name and ticker
    const nameStr =
      typeof value.name === 'string'
        ? value.name.toLowerCase().replace(fillerWords, '').trim()
        : '';
    const tickerStr =
      typeof value.ticker === 'string' ? value.ticker.toLowerCase() : '';

    return (
      tickerStr.startsWith(lowerQuery) || nameStr.startsWith(lowerQuery)
    );
  });



    const finalFiltered = filter ? filtered.filter(filter) : filtered;

    // Sort matches: exact start matches first, then by size descending
    return finalFiltered.sort((a, b) => {
      const aTicker = typeof a.ticker === 'string' ? a.ticker.toLowerCase() : '';
      const aName   = typeof a.name === 'string' ? a.name.toLowerCase() : '';
      const bTicker = typeof b.ticker === 'string' ? b.ticker.toLowerCase() : '';
      const bName   = typeof b.name === 'string' ? b.name.toLowerCase() : '';

      const aStarts = aTicker.startsWith(lowerQuery) || aName.startsWith(lowerQuery);
      const bStarts = bTicker.startsWith(lowerQuery) || bName.startsWith(lowerQuery);

      if (!aStarts && bStarts) return 1;
      if (aStarts && !bStarts) return -1;

      return (typeof b.size === 'number' ? b.size : 0) -
            (typeof a.size === 'number' ? a.size : 0);
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
          flex items-center px-2 py-0.5 sm:px-3 sm:py-1 bg-transparent text-primary-light dark:text-primary-dark placeholder-secondary-light dark:placeholder-secondary-dark
          rounded-t-2xl ${dropdownVisible ? 'rounded-b-none' : 'rounded-b-2xl'}
          border border-border-light dark:border-border-dark
        `}
      >
        <input
          type="text"
          value={query}
          placeholder={label}
          className="flex-1 text-sm sm:text-base bg-transparent outline-none text-primary-light dark:text-primary-dark placeholder-secondary-light dark:placeholder-secondary-dark truncate"
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
          {(filter ? filteredSuggestions.filter(filter) : filteredSuggestions).slice(0, 5).map((value:ProxyAsset, index) =>
            onClick ? (
              <div
                key={value.ticker}
                className={`
                  cursor-pointer px-2 py-1 sm:px-4 sm:py-2
                  text-sm sm:text-base
                   text-primary-light dark:text-primary-dark truncate
                  hover:bg-accent-light/10 dark:hover:bg-accent-dark/10
                  ${index === filteredSuggestions.length - 1 ? '' : 'border-b border-border-light dark:border-border-dark'}
                `}
                onClick={() => handleSelect(value.ticker)}
              >
                <span className="font-semibold">{value.ticker}</span> - <span>{value.name}</span>
              </div>
            ) : (
              <Link
                key={value.ticker}
                href={`/metrics/${value.ticker}/`}
                className={`
                  block px-2 py-1 sm:px-4 sm:py-2 truncate
                  text-sm sm:text-base
                  hover:bg-accent-light/10 dark:hover:bg-accent-dark/10
                  ${index === filteredSuggestions.length - 1 ? '' : 'border-b border-border-light dark:border-border-dark'}
                `}
                onClick={() => {
                  setDropdownVisible(false)
                  setQuery("")
                }}
              >
                <span className="font-semibold">{value.ticker}</span> - <span>{value.name}</span>
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
