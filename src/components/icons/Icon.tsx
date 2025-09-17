'use client';
import React, { ReactNode, useState } from "react";
import clsx from "clsx";

interface IconProps {
  size?: number | string;
  className?: string;
  children: ReactNode;
  viewBox?: string;
  hoverStrokeColor?: string; // Tailwind class
  hoverFillColor?: string;   // Tailwind class
  defaultStrokeColor?: string; // Tailwind class
  defaultFillColor?: string;   // Tailwind class
  isClickable?: boolean;
  onClick?: () => void;
}

export const Icon: React.FC<IconProps> = ({
  size = 16,
  className,
  children,
  viewBox = "0 0 16 16",
  hoverStrokeColor = "text-accent-light dark:text-accent-dark",
  hoverFillColor = "text-accent-light dark:text-accent-dark",
  defaultStrokeColor = "text-secondary-light dark:text-secondary-dark",
  defaultFillColor = "none",
  isClickable = false,
  onClick,
}) => {
  const [hover, setHover] = useState(false);

  return (
    <svg
  className={clsx(
    "transition-colors duration-150",
    isClickable && "cursor-pointer",
    hover && isClickable ? hoverStrokeColor : defaultStrokeColor,
    hover && isClickable ? hoverFillColor : defaultFillColor,
    className
  )}
  width={size}
  height={size}
  viewBox={viewBox}
  xmlns="http://www.w3.org/2000/svg"
  onMouseEnter={() => setHover(true)}
  onMouseLeave={() => setHover(false)}
  onClick={onClick}
>
  {React.Children.map(children, (child) =>
    React.isValidElement(child)
      ? React.cloneElement(child as React.ReactElement<any>, {
          fill: "currentColor",
          stroke: "currentColor",
        })
      : child
  )}
</svg>

  );
};
