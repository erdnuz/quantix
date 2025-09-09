import { Icon } from "./Icon";

export const IconArrowLeft = ({ size = "16", className, onClick}) => (
  <Icon size={size} className={className} isClickable={true} onClick={onClick}>
    <path d="M12.6668 7.99992H3.3335M3.3335 7.99992L8.00016 12.6666M3.3335 7.99992L8.00016 3.33325" stroke="var(--svg-stroke-color)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></Icon>
);
