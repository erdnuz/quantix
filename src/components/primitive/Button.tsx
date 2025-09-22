import React from "react";
import { IconAdd, IconTrash } from "../icons";

interface ButtonProps {
  type?: "primary" | "secondary" | "brand"; // theme-based button types
  label: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  icon?: "none" | "trash" | "plus";
}

export const Button: React.FC<ButtonProps> = ({
  type = "primary",
  label,
  className,
  disabled = false,
  onClick,
  icon = "none",
}) => {
  const baseClasses =
    "flex items-center gap-1.5 px-4 py-2 rounded-md font-medium transition-colors duration-150 border cursor-pointer";

  // Theme-based colors with borders + hover backgrounds
  const typeClasses = {
    primary: `
      bg-primary-light text-light 
      border-border-light 
      hover:bg-secondary-light 
      dark:bg-primary-dark dark:text-dark 
      dark:border-border-dark 
      dark:hover:bg-secondary-dark
    `,
    secondary: `
      bg-surface-light text-secondary-light 
      border-border-light 
      hover:bg-border-light 
      dark:bg-surface-dark dark:text-secondary-dark 
      dark:border-border-dark 
      dark:hover:bg-border-dark
    `,
    brand: `
      bg-accent-light text-light 
      border-border-light 
      hover:bg-primary-light 
      dark:bg-accent-dark dark:text-dark 
      dark:border-border-dark 
      dark:hover:bg-primary-dark
    `,
  };

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  // If destructive/trash action, override colors with accent
  const iconClasses =
    icon !== "none"
      ? `
        bg-accent-light dark:bg-accent-dark text-light dark:text-dark 
        hover:bg-primary-light dark:hover:bg-primary-dark
      `
      : "";

  return (
    <button
      className={`
        ${baseClasses}
        ${typeClasses[type]}
        ${disabledClasses}
        ${iconClasses}
        ${className || ""}
      `}
      onClick={onClick}
      disabled={disabled}
    >
      {icon === "trash" && <IconTrash size={18} />}
      {icon === "plus" && <IconAdd size={24} />}
      <span>{label}</span>
    </button>
  );
};
