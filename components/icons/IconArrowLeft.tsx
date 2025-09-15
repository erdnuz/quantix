import { Icon } from "./Icon";


export const IconArrowLeft: React.FC<{
        size?: number | string;
        className?: string;
        onClick?: () => void;
      }> = ({
        size = 16,
        className,
        onClick,
      }) => (
  <Icon
    size={size}
    className={className}
    isClickable={!!onClick}
    onClick={onClick}
    defaultStrokeColor="currentColor" // use Tailwind text color
    hoverStrokeColor="text-gray-500"  // optional hover stroke
  >
    <path
      d="M12.6668 7.99992H3.3335M3.3335 7.99992L8.00016 12.6666M3.3335 7.99992L8.00016 3.33325"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);
