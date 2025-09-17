import { Icon } from "./Icon";

export const IconCheck :React.FC<{
  size?: number | string;
  className?: string
}> = ({
  size = 16,
  className
}) => (
  <Icon size={size} className={className} defaultStrokeColor="var(--sds-color-icon-brand-on-brand)">
    <path d="M13.3333 4L5.99999 11.3333L2.66666 8" stroke="var(--svg-stroke-color)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></Icon>
);
