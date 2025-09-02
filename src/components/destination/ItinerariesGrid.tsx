// components/destination/ItinerariesGrid.tsx
import React from "react";
import type { Itinerary } from "../../services/types";
import ItineraryCard from "../cards/ItineraryCard";

interface Props {
  itineraries: Itinerary[];
  destinationId: string;
}

const ItinerariesGrid: React.FC<Props> = ({ itineraries, destinationId }) => {
  if (itineraries.length === 0) return <div>No itineraries added yet.</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {itineraries.map((it) => (
        <ItineraryCard key={it.id} itinerary={it} destinationId={destinationId} />
      ))}
    </div>
  );
};

export default ItinerariesGrid;

// Notes:
// Same responsive grid as Packages / Activities
// Uses ItineraryCard for consistent styling

