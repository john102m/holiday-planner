import React from "react";

interface Props {
  imageUrl: string;
  name: string;
  description: string;
}

const HeroSection: React.FC<Props> = ({ imageUrl, name, description }) => {
  return (
    <div className="hero relative rounded-lg overflow-hidden shadow-md">
      {/* Background image */}
      <img
        src={imageUrl}
        alt={name}
        className="w-full h-64 sm:h-80 md:h-96 object-cover"
      />

      {/* Desktop/Tablet overlay with blur */}
      <div className="hidden md:block absolute inset-x-0 bottom-0 p-4 bg-black/30 backdrop-blur-sm">
        <h1 className="text-white text-2xl sm:text-3xl font-bold">{name}</h1>
        <p className="text-gray-200 mt-1">{description}</p>
      </div>

      {/* Mobile stacked card */}
      <div className="md:hidden p-3 bg-white rounded-b-lg shadow-md space-y-1">
        <h1 className="text-base font-semibold text-gray-800">{name}</h1>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
};

export default HeroSection;
