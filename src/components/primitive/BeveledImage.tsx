import React from "react";

interface BeveledImageProps {
  theme: string;
  image: string;
}

export const BeveledImage: React.FC<BeveledImageProps> = ({ theme, image }) => {
  const imagePath = `/images/${image}-${theme}.png`;

  return (
    <div className="overflow-hidden rounded-xl shadow-md inline-block">
      <img
        src={imagePath}
        alt={`${image} ${theme}`}
        className="block w-full h-auto"
      />
    </div>
  );
};
