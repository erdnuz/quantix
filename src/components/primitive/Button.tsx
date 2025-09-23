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
  className = "",
  disabled = false,
  onClick,
  icon = "none",
}) => {
  const baseClasses =
    "flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors duration-150 border cursor-pointer justify-center";

  const typeClasses: Record<string, string> = {
    primary: `
      bg-primary-light text-light border-border-light
      hover:bg-primary-light-hover
      dark:bg-primary-dark dark:text-dark dark:border-border-dark
      dark:hover:bg-primary-dark-hover
    `,
    secondary: `
      bg-surface-light text-secondary-light border-border-light
      hover:bg-surface-light-hover
      dark:bg-surface-dark dark:text-secondary-dark dark:border-border-dark
      dark:hover:bg-surface-dark-hover
    `,
    brand: `
      bg-brand-light text-light border-border-light
      hover:bg-brand-hover
      dark:bg-accent-dark dark:text-dark dark:border-border-dark
      dark:hover:bg-accent-dark-hover
    `,
  };

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  const iconComponent =
    icon === "trash" ? <IconTrash size={18} /> : icon === "plus" ? <IconAdd size={18} /> : null;

  return (
    <button
      className={`${baseClasses} ${typeClasses[type]} ${disabledClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {iconComponent}
      <span>{label}</span>
    </button>
  );
};
