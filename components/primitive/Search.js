'use client'
import { IconSearch } from "../icons/IconSearch";
import { useState, useMemo, useEffect, useRef } from "react";
import styles from "./search.module.css";
import Link from "next/link";
import { getStockIdsAndNames } from "../../services/firebase/db";

export function Search({ className='', label = "Search", onClick=null}) {
  const [query, setQuery] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const previousQueryRef = useRef("");
  const searchRef = useRef(null);
  const [suggestions, setSuggestions] =  useState([])
  
  useEffect(()=>{
    getStockIdsAndNames().then(
      (data) => setSuggestions(data)
    )
  }, [])

  const reset = () => {
    setDropdownVisible(false);
    setQuery('')
  }

  const filterSuggestions = (input, previousResults) => {
    const lowerInput = input.toLowerCase();

    if (
      (input.length > previousQueryRef.current.length &&
      lowerInput.startsWith(previousQueryRef.current.toLowerCase())
    && previousQueryRef.current.length > 0)
    ) {
      return previousResults.filter(({ id, name }) =>
      {
        const fillerWords = /(the|inc\.|company|corporation)/gi;
        name = name?.toLowerCase().replace(fillerWords, "").trim(); 
        return id.toLowerCase().startsWith(lowerInput) || name?.toLowerCase().startsWith(lowerInput);
    });
    }
    return suggestions.filter(({ id, name }) =>
    {
      const fillerWords = /(the|inc\.|company|corporation)/gi;
      name = name?.toLowerCase().replace(fillerWords, "").trim(); 
      return id.toLowerCase().startsWith(lowerInput) || name?.toLowerCase().startsWith(lowerInput)
  });
  };

  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setDropdownVisible(newQuery.length > 0);
  };

  useEffect(() => {
    const filtered = filterSuggestions(query, filteredSuggestions);
    setFilteredSuggestions(
      filtered
        .sort((a, b) => {
          const aStarts = `${a.id} ${a.name}`.toLowerCase().startsWith(query.toLowerCase());
          const bStarts = `${b.id} ${b.name}`.toLowerCase().startsWith(query.toLowerCase());
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          return 0;
        })
    );
    previousQueryRef.current = query;
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setQuery(""); // Reset query
        setDropdownVisible(false); // Hide dropdown
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={searchRef} className={`${styles.container} ${dropdownVisible ? styles.visible : ''} ${className}`}>
      <div className={`${styles.box} ${dropdownVisible ? styles.visible : ''}`}>
        <input
          type="text"
          value={query}
          placeholder={label}
          className={styles.query}
          onChange={handleInputChange}
        />
        <IconSearch size="24" isClickable={false} />
      </div>

      {dropdownVisible && (
        <div className={styles.dropdown}>
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.slice(0, 5).map(({ id, name }, index) => (
              onClick?
              <div 
              key={id}
              className={`${styles.item} ${index === Math.min(filteredSuggestions.length - 1, 4) ? styles.last : ''}`}
              onClick={() => {
                onClick(id);
                setDropdownVisible(false);
                setQuery('')
              }
                }>
                <span className={styles.id}>{id}</span> - <span className={styles.name}>{name}</span>
              </div>:
              <Link
                key={id}
                className={`${styles.item} ${index === Math.min(filteredSuggestions.length - 1, 4) ? styles.last : ''}`}
                href={`/metrics/${id}/`}
                onClick={reset}
              >
                <span className={styles.id}>{id}</span> - <span className={styles.name}>{name}</span>
              </Link>
            ))
          ) : (
            <div className={styles.nresults}>No results found.</div>
          )}
        </div>
      )}
    </div>
  );
}
