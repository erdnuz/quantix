'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { IconSearch } from '../icons/IconSearch';
import { getStockIdsAndNames } from '../../../services/firebase/db';
import { ProxyAsset } from '../../../types';

interface SearchProps {
  label?: string;
  onClick?: ((id: string) => void) | null;
}

export const Search: React.FC<SearchProps> = ({
  label = 'Search',
  onClick = null,
}) => {
  const [query, setQuery] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<ProxyAsset[]>([]);
  const [suggestions, setSuggestions] = useState<ProxyAsset[]>([]);
  const previousQueryRef = useRef('');
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getStockIdsAndNames().then((data) => setSuggestions(data));
  }, []);

  const reset = () => {
    setDropdownVisible(false);
    setQuery('');
  };

  const filterSuggestions = (input: string, previousResults: ProxyAsset[]) => {
    const lowerInput = input.toLowerCase();
    const fillerWords = /(the|inc\.|company|corporation)/gi;

    if (
      input.length > previousQueryRef.current.length &&
      lowerInput.startsWith(previousQueryRef.current.toLowerCase()) &&
      previousQueryRef.current.length > 0
    ) {
      return previousResults.filter(({ ticker, name }) => {
        const cleanName = name?.toLowerCase().replace(fillerWords, '').trim();
        return ticker.toLowerCase().startsWith(lowerInput) || cleanName?.startsWith(lowerInput);
      });
    }

    return suggestions.filter(({ ticker, name }) => {
      const cleanName = name?.toLowerCase().replace(fillerWords, '').trim();
      return ticker.toLowerCase().startsWith(lowerInput) || cleanName?.startsWith(lowerInput);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setDropdownVisible(newQuery.length > 0);
  };

  useEffect(() => {
    const filtered = filterSuggestions(query, filteredSuggestions);
    setFilteredSuggestions(
      filtered
        .sort((a, b) => {
          const aStarts = a.ticker.toLowerCase().startsWith(query.toLowerCase()) || a.name.toLowerCase().startsWith(query.toLowerCase());
          const bStarts = b.ticker.toLowerCase().startsWith(query.toLowerCase()) || b.name.toLowerCase().startsWith(query.toLowerCase());
          if (!aStarts && bStarts) return 1;
          if (aStarts && !bStarts) return -1;
          else return b.size - a.size;
        })
    );
    previousQueryRef.current = query;
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        reset();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      {dropdownVisible && filteredSuggestions.length > 0 && (
        <div
          className="
            absolute top-full left-0 right-0 z-10 max-h-52 overflow-y-auto
            rounded-b-2xl border border-border-light dark:border-border-dark border-t-0
            bg-surface-light dark:bg-surface-dark shadow-sm
          "
        >
          {filteredSuggestions.slice(0, 5).map(({ ticker, name }, index) =>
            onClick ? (
              <div
                key={ticker}
                className={`
                  cursor-pointer px-4 py-2 text-primary-light dark:text-primary-dark truncate
                  hover:bg-accent-light/10 dark:hover:bg-accent-dark/10
                  ${index === filteredSuggestions.length - 1 ? '' : 'border-b border-border-light dark:border-border-dark'}
                `}
                onClick={() => {
                  onClick(ticker);
                  reset();
                }}
              >
                <span className="font-semibold">{ticker}</span> - <span>{name}</span>
              </div>
            ) : (
              <Link
                key={ticker}
                href={`/metrics/${ticker}/`}
                className={`
                  block px-4 py-2 text-primary-light dark:text-primary-dark truncate
                  hover:bg-accent-light/10 dark:hover:bg-accent-dark/10
                  ${index === filteredSuggestions.length - 1 ? '' : 'border-b border-border-light dark:border-border-dark'}
                `}
                onClick={reset}
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
