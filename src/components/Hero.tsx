import React from 'react';

const Hero: React.FC = () => (
  <header className="h-[400px] bg-[url('https://myjohnblogimages.blob.core.windows.net/images/fuerteventura.webp')] bg-center bg-cover flex items-center justify-center relative mb-8">
    <div className="bg-black/35 p-8 text-center rounded-lg text-white">
      <h1 className="text-4xl md:text-5xl font-bold">10-Day Fuerteventura Itinerary</h1>
      <h2 className="text-2xl mt-2">May/June 2026</h2>
      <p className="mt-2 text-lg">Base: Sheraton Fuerteventura Beach, Golf & Spa (Caleta de Fuste)</p>
    </div>
  </header>
);

export default Hero;

