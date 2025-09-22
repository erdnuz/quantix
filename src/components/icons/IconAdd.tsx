import { Icon } from "./Icon";

export const IconAdd : React.FC<{
  size?: number | string;
  className?: string;
  onClick?: () => void;
}> = ({
  size = 16,
  className,
  onClick,
}) => (
  <Icon size={size} className={className} viewBox="0 0 24 24" isClickable={true} onClick={onClick}>
        <path 
    d="M11 13H5V11H11V5H13V11H19V13H13V19H11V13Z"
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"/>
  </Icon>

);


