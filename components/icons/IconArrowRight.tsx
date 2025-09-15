import React from "react";
import { Icon } from "./Icon";


export const IconArrowRight: React.FC<{
  size?: number | string;
  className?: string;
  onClick?: () => void;
}> = ({
  size = 16,
  className,
  onClick,
}) => (
  <Icon size={size} className={className} isClickable={!!onClick} onClick={onClick} defaultStrokeColor="currentColor">
    <path
      d="M3.33331 7.99992H12.6666M12.6666 7.99992L7.99998 3.33325M12.6666 7.99992L7.99998 12.6666"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);
