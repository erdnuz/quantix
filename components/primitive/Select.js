'use client'
import React, { useState, useRef, useEffect } from "react";
import { IconChevronDown } from "../icons/IconChevronDown"; // Replace with your chevron icon
import styles from "./select.module.css";

export function Select({ options = [], size=1, selected, setSelected }) {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const selectRef = useRef(null);

  const handleToggleDropdown = () => {
    setDropdownVisible((prev) => !prev);
  };

  const handleOptionSelect = (option) => {
    setSelected(option);
    setDropdownVisible(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setDropdownVisible(false); // Hide dropdown if clicking outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={selectRef} className={`${styles["select-container"]} ${size===0 ? styles["small"] : ""}`}>
      <div className={`${styles["select-box"]} ${dropdownVisible ? styles["dropdown-visible"] : ""}`} onClick={options.length>1?handleToggleDropdown:()=>{}}>
        <p className={`${styles["selected-value"]} ${size===0 ? styles["small"] : ""}`} >{options[selected][0]}</p>
        {options.length>1?
        <IconChevronDown size={size===0?"16":"24"} isClickable={false}  className={styles["chevron-icon"]}/>: 
        <div style={{width:size===0?"16":"24", height:size===0?"16":"24"}}></div>}
      </div>
      {dropdownVisible && (
        <div className={styles["select-dropdown"]}>
          {options.map((option, index) =>
            selected !== index ? (
              <p
                key={index}
                className={`${styles["select-item"]} ${dropdownVisible ? styles["last"] : ""} ${size===0 ? 'small' : ""}`}
                onClick={() => handleOptionSelect(index)}
              >
                {option[0]}
              </p>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
