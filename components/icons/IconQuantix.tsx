import { Icon } from "./Icon";

const handleRedirect = () => {
  window.location.href = "/"; // Redirects to the home page
};

export const IconQuantix : React.FC<{
  size?: number | string;
  className?: string;
}> = ({
  size = 16,
  className
}) => (
  <Icon size={size} className={className} viewBox="0 0 48 48" defaultFillColor="var(--sds-color-icon-default-default)" defaultStrokeColor="none" isClickable={true} onClick={handleRedirect}>
    <g clipPath="url(#clip0_103_1162)">
    <path fillRule="evenodd" clipRule="evenodd" d="M22.6176 0.0829042C30.3758 -0.672666 41.4778 3.73541 45.5956 13.3452C48.5325 19.6827 48.7789 26.1331 46.3349 32.6964C42.8783 40.7444 36.9028 45.6758 28.4083 47.4907C25.5214 48.0579 22.6465 48.0579 19.6746 47.9329C22.3208 44.5648 25.0994 40.7726 27.7922 37.4406C33.6549 35.5876 37.0841 31.5925 38.08 25.4553C38.4628 19.3848 36.1014 14.7863 30.9956 11.6598C24.4156 8.48819 18.5223 9.46611 13.3154 14.5937C9.30346 19.5548 8.70801 24.9232 11.5289 30.6989C9.43628 33.4015 7.30074 36.0649 5.1222 38.689C2.37505 35.2752 0.711763 31.3634 0.132321 26.9535C-0.686018 18.0338 2.2914 10.7303 9.06481 5.04293C13.0752 1.94749 17.6033 0.571178 22.6176 0.0829042Z"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M13.6236 32.197C18.6752 32.1762 23.7267 32.197 28.778 32.2595C24.63 37.4614 20.4821 42.6633 16.3341 47.8653C11.2826 47.9485 6.23117 47.9485 1.17969 47.8653C5.35392 42.6582 9.50194 37.4355 13.6236 32.197Z"/>

    </g>
    
  </Icon>
);


