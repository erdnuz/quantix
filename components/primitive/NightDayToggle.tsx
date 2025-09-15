'use client'
import React, { useState, useEffect } from "react";
import { IconSun, IconMoon } from "../icons"; // Assuming you have these imported

// Define the NightDayToggle component
export function NightDayToggle() {
  const [isDay, setIsDay] = useState(true); // Default to light theme initially
  const [mounted, setMounted] = useState(false); // State to track if component is mounted on the client

  // This useEffect ensures code related to window, localStorage, etc. only runs on the client
  useEffect(() => {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    let savedTheme = localStorage.getItem('theme'); 

    if (!savedTheme) {
      savedTheme = systemTheme;
      localStorage.setItem('theme', systemTheme); 
    }

    document.documentElement.setAttribute('data-theme', savedTheme);
    setIsDay(savedTheme !== 'light'); // Set the theme state based on saved or system theme
    setMounted(true); // Once the component is mounted, update the state
  }, []);

  // Toggle the theme between dark and light
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme); 
  }

  // Handle click to toggle the theme
  const handleClick = () => {
    setIsDay(!isDay); // Toggle day/night state
    toggleTheme(); // Call toggleTheme to change the theme
  };

  // If the component has not mounted yet (SSR), return null to prevent rendering on the server
  if (!mounted) {
    return null;
  }

  return (
    <div onClick={handleClick} style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
      {/* Render either the sun or moon icon based on the isDay state */}
      {isDay ? (
        <IconSun size={32}/>
      ) : (
        <IconMoon size={32} />
      )}
    </div>
  );
};
