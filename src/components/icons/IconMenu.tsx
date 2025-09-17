import { Icon } from "./Icon";

export const IconMenu : React.FC<{
  size?: number | string;
  className?: string;
  onClick?: () => void;
}> = ({
  size = 16,
  className,
  onClick,
}) => (
  <Icon size={size} className={className} viewBox="0 0 48 48" isClickable={true} onClick={onClick}>
        <path 
    d="M6 24H42M6 12H42M6 36H42" 
    stroke="var(--svg-stroke-color)" 
    strokeWidth="4" 
    strokeLinecap="round" 
    strokeLinejoin="round"/>
  </Icon>

);
