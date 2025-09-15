'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { IconSearch } from '../icons/IconSearch';
import { getStockIdsAndNames } from '../../services/firebase/db';
import { ProxyAsset } from '../../types';


interface SearchProps {
  className?: string;
  label?: string;
  onClick?: ((id: string) => void) | null;
}

export const Search: React.FC<SearchProps> = ({ className = '', label = 'Search', onClick = null }) => {
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

    if (input.length > previousQueryRef.current.length && lowerInput.startsWith(previousQueryRef.current.toLowerCase()) && previousQueryRef.current.length > 0) {
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
      filtered.sort((a, b) => {
        const aStarts = `${a.ticker} ${a.name}`.toLowerCase().startsWith(query.toLowerCase());
        const bStarts = `${b.ticker} ${b.name}`.toLowerCase().startsWith(query.toLowerCase());
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return 0;
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
    <div ref={searchRef} className={`relative inline-block ${className}`}>
      <div
        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border border-gray-300 bg-white hover:bg-gray-100 ${
          dropdownVisible ? 'rounded-t-2xl' : ''
        }`}
      >
        <input
          type="text"
          value={query}
          placeholder={label}
          className="flex-1 bg-transparent outline-none text-gray-700 max-w-[140px]"
          onChange={handleInputChange}
        />
        <IconSearch size="24" isClickable={false} />
      </div>

      {dropdownVisible && (
        <div className="absolute top-full left-0 right-0 z-10 max-h-52 overflow-y-auto rounded-b-2xl border border-gray-300 border-t-0 bg-gray-50">
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.slice(0, 5).map(({ ticker, name }, index) =>
              onClick ? (
                <div
                  key={ticker}
                  className={`cursor-pointer px-4 py-2 text-gray-700 hover:bg-gray-100 ${
                    index === Math.min(filteredSuggestions.length - 1, 4) ? '' : 'border-b border-gray-300'
                  }`}
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
                  className={`block px-4 py-2 text-gray-700 hover:bg-gray-100 ${
                    index === Math.min(filteredSuggestions.length - 1, 4) ? '' : 'border-b border-gray-300'
                  }`}
                  onClick={reset}
                >
                  <span className="font-semibold">{ticker}</span> - <span>{name}</span>
                </Link>
              )
            )
          ) : (
            <div className="px-4 py-2 text-gray-500 cursor-auto">No results found.</div>
          )}
        </div>
      )}
    </div>
  );
};
