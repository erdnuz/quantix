import { Icon } from "./Icon";

export const IconHash : React.FC<{
  size?: number | string;
  className?: string;
}> = ({
  size = 16,
  className
}) => (
  <Icon size={size} className={className} defaultStrokeColor="var(--sds-color-icon-brand-on-brand)">
    <path
      d="M2.66669 6H13.3334M2.66669 10H13.3334M6.66669 2L5.33335 14M10.6667 2L9.33335 14"
      stroke="var(--svg-stroke-color)"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);
