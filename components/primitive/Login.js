'use client'
import { IconUser } from "../icons/IconUser";
import { Button } from "./";
import styles from "./login.module.css";
import { useState, useEffect, useRef } from "react";


export function Login({ className='', currentUser, openAuth, signOut, openEdit }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const closeDropdown = (event) => {
    if (!event || dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (isDropdownOpen) {
      document.addEventListener("click", closeDropdown);
    } else {
      document.removeEventListener("click", closeDropdown);
    }
    return () => document.removeEventListener("click", closeDropdown);
  }, [isDropdownOpen]);


  return (
    <div className={`${styles["login-container"]} ${className}`}>
      
      {currentUser ? (
        <div
          ref={dropdownRef}
          className={`${styles["holder"]} ${isDropdownOpen ? styles["dropdown-active"] : ""}`}
        >
          <IconUser
            size="32"
            className={styles["icon-user"]}
            onClick={toggleDropdown}
          />
          {isDropdownOpen && (
            <div className={styles["dropdown"]}>
              <button
                className={styles["dropdown-item"]}
                onClick={() => {
                  openEdit();
                  closeDropdown();
                }}
              >
                Edit Profile
              </button>
              <button className={`${styles["dropdown-item"]} ${styles["last"]}`} onClick={() => {
                signOut();
                window.location.href="/"
              }}>
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <Button type="brand" label="Login" onClick={openAuth}/>
      )}
    </div>
  );
}
