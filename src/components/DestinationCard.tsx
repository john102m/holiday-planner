import React from "react";
import type { Destination } from "../types";

interface DestinationCardProps {
  destination: Destination;
}

const DestinationCard: React.FC<DestinationCardProps> = ({ destination }) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition mb-8">
      {destination.imageUrl && (
        <img
          src={destination.imageUrl}
          alt={destination.name}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h2 className="font-semibold text-lg">{destination.name}</h2>
        {destination.area && (
          <p className="text-sm text-gray-500">{destination.area}</p>
        )}
        {destination.description && (
          <p className="mt-2 text-gray-700 text-sm">{destination.description}</p>
        )}
      </div>
    </div>
  );
};

export default DestinationCard;
