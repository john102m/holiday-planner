import React from 'react';

const Hero: React.FC = () => {
  return (
    <div className="relative h-64 sm:h-80 md:h-96 bg-[url('https://myjohnblogimages.blob.core.windows.net/images/fuerteventura.webp')] bg-center bg-cover flex items-center justify-center">
      <div className="bg-black/40 p-4 sm:p-6 rounded-lg text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
          10-Day Fuerteventura Itinerary
        </h1>
        <h2 className="text-sm sm:text-base md:text-lg text-white mt-1">
          May/June 2026
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-white mt-1">
          Base: Sheraton Fuerteventura Beach, Golf & Spa (Caleta de Fuste)
        </p>
      </div>
    </div>
  );
};

export default Hero;


