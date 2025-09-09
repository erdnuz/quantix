import { Icon } from "./Icon";

export const IconChevronUp = ({ size = "16", className }) => (
  <Icon size={size} className={className}>
    <path
      d="M12 10L8 6L4 10"
      stroke="var(--svg-stroke-color)"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);
