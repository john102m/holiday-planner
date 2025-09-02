import React from "react";
import { useStore } from "../../services/store";
import ItineraryCard from "../ItineraryCard";
import type { DashboardItinerary } from "../../services/types";

// 🔹 Improvements:
// Handles undefined store state safely (itinerariesObj | undefined).
// Filters out any null or undefined arrays before flattening.
// Uses React.useMemo to cache the flattened array — avoids unnecessary re-renders.
// Fully typed with DashboardItinerary, so no unused import warnings.

// ✅ TL;DR
// Infinite loops usually happen when:
// setState is called inside a useEffect that depends on that same state.
// External store selectors create new references every render (arrays/objects).
// Re-rendering triggers a recalculation that changes the value again → loop.
// Fix: memoize, correct dependencies, avoid recreating arrays/objects in selectors.

const ItinerariesSection: React.FC = () => {
  // Grab the itineraries object from the store
  const itinerariesObj = useStore(
    (state) => state.itineraries
  ) as Record<string, DashboardItinerary[]> | undefined;

  // Flatten into a single array safely; default to empty array if undefined
  const itineraries: DashboardItinerary[] = React.useMemo(() => {
    if (!itinerariesObj) return [];
    return Object.values(itinerariesObj)
      .filter(Boolean) // remove any undefined/null arrays
      .flat();
  }, [itinerariesObj]);

  return (
    <section className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Your Itineraries</h2>
        <button className="text-blue-500 hover:underline">
          + Create New Itinerary
        </button>
      </div>

      {itineraries.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {itineraries.map((it) => (
            <ItineraryCard key={it.id} itinerary={it} showRoleBadge />
          ))}
        </div>

      ) : (
        <p className="text-gray-500">You have no itineraries yet.</p>
      )}
    </section>
  );
};

export default ItinerariesSection;
