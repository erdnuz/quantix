import React from "react";
import { IconTrash } from "../icons";

interface ButtonProps {
  type?: "primary" | "secondary" | "brand"; // adjust based on your design
  label: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  icon?: "none" | "trash";
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
    "flex items-center gap-1.5 px-4 py-2 rounded font-medium transition-colors duration-150";
  const typeClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    brand: "bg-red-600 text-white hover:bg-red-700",
  };
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";
  const iconClasses = icon === "trash" ? "bg-red-500 hover:bg-red-600 text-white" : "";

  return (
    <button
      className={`${baseClasses} ${typeClasses[type]} ${disabledClasses} ${iconClasses} ${className || ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon === "trash" && <IconTrash size={18} />}
      <span>{label}</span>
    </button>
  );
};
