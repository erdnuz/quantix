import React from "react";
import Image from "next/image";

interface BeveledImageProps {
  theme: string;
  image: string;
}

export const BeveledImage: React.FC<BeveledImageProps> = ({ theme, image }) => {
  const imagePath = `/images/${image}-${theme}.png`;

  return (
    <div className="overflow-hidden rounded-xl shadow-md inline-block">
      <Image
        src={imagePath}
        alt={`${image} ${theme}`}
        unoptimized
        className="block w-full h-auto"
      />
    </div>
  );
};
