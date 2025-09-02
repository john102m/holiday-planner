// components/destination/HeroSection.tsx
import React from "react";
import type { Destination } from "../../services/types";

interface Props {
  destination: Destination;
}
// HeroSection component displays a large banner image with the destination name and description overlaid.
// The image is set as a background with a gradient overlay to ensure text readability.
// The overlay uses:
// bg-gradient-to-t from-black/40 to-transparent → a gradient that starts with 40% opaque black at the bottom, fading to transparent at the top, ensuring text stands out against the image.
// backdrop-blur-sm and bg-black/20 for the text panel
// bg-black/20 → very subtle black overlay (20% opacity).
// backdrop-blur-sm → soft blur of the image behind the overlay, making text more readable without hiding the picture.
// rounded-t-lg → rounds the top corners of the overlay for a sleek look.
// Text still at the bottom of the image for consistency.

const HeroSection: React.FC<Props> = ({ destination }) => {
  return (
    <div className="hero relative rounded-lg overflow-hidden shadow-md">
      <img
        src={destination.imageUrl}
        alt={destination.name}
        className="w-full h-64 object-cover sm:h-80 md:h-96"
      />

      {/* Gradient fade at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>

      {/* Blurred overlay behind text */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/20 backdrop-blur-sm rounded-t-lg">
        <h1 className="text-white text-2xl sm:text-3xl font-bold">
          {destination.name}
        </h1>
        <p className="text-gray-200 mt-1">{destination.description}</p>
      </div>
    </div>

  );
};

export default HeroSection;



