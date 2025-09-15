'use client'
import React, { ReactNode, useState } from "react";
import clsx from "clsx";

interface IconProps {
  size?: number | string;
  className?: string;
  children: ReactNode;
  viewBox?: string;
  hoverStrokeColor?: string;
  hoverFillColor?: string;
  defaultStrokeColor?: string;
  defaultFillColor?: string;
  isClickable?: boolean;
  onClick?: () => void;
}

export const Icon: React.FC<IconProps> = ({
  size = 16,
  className,
  children,
  viewBox = "0 0 16 16",
  hoverStrokeColor = "var(--sds-color-icon-default-secondary)",
  hoverFillColor = "var(--sds-color-icon-default-secondary)",
  defaultStrokeColor = "var(--sds-color-icon-default-default)",
  defaultFillColor = "none",
  isClickable = false,
  onClick,
}) => {
  const [hover, setHover] = useState(false);

  // If fill or stroke is none, prevent hover from changing it
  const effectiveHoverFill = defaultFillColor === "none" ? "none" : hoverFillColor;
  const effectiveHoverStroke = defaultStrokeColor === "none" ? "none" : hoverStrokeColor;

  return (
    <svg
      className={clsx(
        "transition-colors duration-150",
        isClickable && "cursor-pointer",
        className
      )}
      width={size}
      height={size}
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, {
              stroke: hover ? effectiveHoverStroke : defaultStrokeColor,
              fill: hover ? effectiveHoverFill : defaultFillColor,
            })
          : child
      )}
    </svg>
  );
};
