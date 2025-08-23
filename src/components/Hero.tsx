import React from 'react';

const Hero: React.FC = () => {
    return (
        <div className="relative w-full h-64 sm:h-72 md:h-80 lg:h-96 bg-center bg-cover flex items-center justify-center"
            style={{ backgroundImage: "url('https://myjohnblogimages.blob.core.windows.net/images/fuerteventura.webp')" }}>
            <div className="bg-black/40 p-4 sm:p-6 rounded-lg text-center max-w-md mx-4">
                <h1 className="text-[clamp(1rem,6vw,2rem)] sm:text-[clamp(1.25rem,5vw,2.5rem)] md:text-[clamp(1.5rem,4vw,3rem)] font-bold text-white leading-tight">
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



