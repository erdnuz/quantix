import { Icon } from "./Icon";

export const IconX = ({ size = "16", className }) => (
  <Icon size={size} className={className} defaultStrokeColor="var(--sds-color-icon-brand-on-brand)">
    <path d="M12 4L4 12M4 4L12 12" stroke="var(--svg-stroke-color)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></Icon>
);
