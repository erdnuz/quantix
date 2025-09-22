import { Icon } from "./Icon";

export const IconChevronUp : React.FC<{
  size?: number | string;
  className?: string;
}> = ({
  size = 16,
  className
}) => (
  <Icon fillIcon={false} size={size} className={className}>
    <path
      d="M12 10L8 6L4 10"
      stroke="var(--svg-stroke-color)"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);
