import { Icon } from "./Icon";

export const IconStar = ({ size = "16", className, isFilled = false, onClick}) => {
  const defaultFillColor = isFilled
    ? "var(--sds-color-icon-default-default)"  // Filled with color
    : "none";  // No fill for unfilled state

  const defaultStrokeColor = isFilled
    ? "none"  // No stroke when filled
    : "var(--sds-color-icon-default-default)";  // Stroke color when not filled
  

  return (
    <Icon
      size={size}
      className={className}
      defaultFillColor={defaultFillColor}
      defaultStrokeColor={defaultStrokeColor}
      isClickable = {true}
      onClick={onClick}
    >
      <path
        d="M7.99992 1.33325L10.0599 5.50659L14.6666 6.17992L11.3333 9.42659L12.1199 14.0133L7.99992 11.8466L3.87992 14.0133L4.66659 9.42659L1.33325 6.17992L5.93992 5.50659L7.99992 1.33325Z"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
};
