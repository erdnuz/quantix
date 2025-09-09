'use client'
import clsx from "clsx";
import React, { useState } from "react";

export function Icon({ 
  size = "16", 
  className, 
  children, 
  viewBox = "0 0 16 16", 
  hoverStrokeColor = "var(--sds-color-icon-default-secondary)", 
  hoverFillColor = "var(--sds-color-icon-default-secondary)", 
  defaultStrokeColor = "var(--sds-color-icon-default-default)", 
  defaultFillColor = "none", 
  isClickable = false,  // Add isClickable prop
  onClick = null
}) {
  const [hover, setHover] = useState(false);
  // If the fill color is none, make sure hover doesn't change it.
  if (defaultFillColor === "none") {
    hoverFillColor = "none";
  }
  if (defaultStrokeColor === "none") {
    hoverStrokeColor = "none";
  }

  // Styles for clickable cursor
  const cursorStyle = isClickable ? "pointer" : "default";

  return (
    <svg
      className={clsx("icon", `icon-size-${size}`, className)}
      width={size}
      height={size}
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      onMouseEnter={() => {
        if (isClickable) setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
      onClick = {onClick}
      style={{ cursor: cursorStyle }} // Apply the cursor style
    >
      {/* Apply the hover or default fill/stroke color to all children */}
      {React.Children.map(children, (child) => {
        return React.cloneElement(child, {
          stroke: hover ? hoverStrokeColor : defaultStrokeColor,
          fill: hover ? hoverFillColor : defaultFillColor,
        });
      })}
    </svg>
  );
}
