import { Icon } from "./Icon";

export const IconChevronDown :
React.FC<{
  size?: number | string;
  className?: string;
}> = ({
  size = 16,
  className
}) => (
  <Icon size={size} className={className}>
    <path d="M4 6L8 10L12 6" stroke="var(--svg-stroke-color)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></Icon>
);
