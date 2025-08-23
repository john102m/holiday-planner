// src/components/Hero.tsx
export default function Hero() {
  return (
    <header
      className="relative h-[400px] sm:h-[450px] md:h-[500px] lg:h-[550px] bg-center bg-cover flex items-center justify-center"
      style={{
        backgroundImage:
          "url('https://myjohnblogimages.blob.core.windows.net/images/fuerteventura.webp')",
      }}
    >
      <div className="bg-black/40 p-6 rounded-xl text-center max-w-xl mx-4">
        <h1 className="text-white font-bold leading-tight"
            style={{ fontSize: 'clamp(1.5rem, 5vw, 2.8rem)' }}>
          10-Day Fuerteventura Itinerary
        </h1>
        <h2 className="text-white mt-2 font-semibold text-lg sm:text-xl md:text-2xl">
          May/June 2026
        </h2>
        <p className="text-white mt-1 text-sm sm:text-base md:text-lg">
          Base: Sheraton Fuerteventura Beach, Golf & Spa (Caleta de Fuste)
        </p>
      </div>
    </header>
  );
}




