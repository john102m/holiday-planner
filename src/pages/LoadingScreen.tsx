// components/common/LoadingScreen.tsx
import React from "react";

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-6 bg-white">
      {/* Logo with animation */}
      <img
        src="/icons/android-chrome-192x192.png"
        alt="App logo"
        className="w-24 h-24 animate-pulse"
      />

      {/* Friendly tagline */}
      <p className="text-gray-600 font-medium text-lg">
        Packing your adventures…
      </p>
    </div>
  );
};

export default LoadingScreen;
