import React from "react";

interface Props {
  imageUrl: string;
  name: string;
  description: string;
}

const HeroSection: React.FC<Props> = ({ imageUrl, name, description }) => {
  return (
    <div className="relative rounded-lg overflow-hidden shadow-md">
      {/* Background image */}
      <img
        src={imageUrl}
        alt={name}
        className="w-full h-64 sm:h-80 md:h-96 object-cover"
      />

      {/* Unified overlay with blur */}
      <div className="absolute inset-x-0 bottom-0 p-2 bg-black/30 backdrop-blur-sm">
        <h1 className="text-white text-xl sm:text-2xl md:text-3xl font-bold">{name}</h1>
        <p className="text-gray-200 mt-1 text-sm sm:text-base">{description}</p>
      </div>
    </div>
  );
};

export default HeroSection;
