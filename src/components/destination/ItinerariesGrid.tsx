import React, { useMemo } from "react";
import { useItinerariesStore, getItinerariesWithActivities } from "../../services/slices/itinerariesSlice";
import { useActivitiesStore } from "../../services/slices/activitiesSlice";
import ItineraryCard from "../cards/ItineraryCard";
import type { Itinerary, ResolvedItinerary } from "../../services/types";

interface Props {
  tripId?: string;
  destinationId: string;
}

// ⚠️ Important:
// We return a stable empty array for destinations with no itineraries or activities.
// Without this, Zustand detects a new array reference on each render,
// causing an infinite re-render loop (Maximum update depth exceeded).

// Stable empty array to avoid unnecessary re-renders
// e.g. the dreaded 
// The result of getSnapshot should be cached to avoid an infinite loop
// Maximum update depth exceeded

// This happens because of how zustand (or any useSyncExternalStore) works:
// useStore(selector) subscribes your component to changes in the store.
// On every store update, it calls your selector to get the latest slice.
// If the selector returns a new object/array each time, even if the contents haven’t changed, React thinks it’s “changed” and will re-render.
// Then, the re-render can trigger another store check, which returns a new array, which triggers another re-render… and voilà, infinite loop.
// So the problem isn’t just “use an array” — it’s object identity. Every new array [] is a new reference, even if it’s empty.

const EMPTY_ITINERARIES: Itinerary[] = [];

const ItinerariesGrid: React.FC<Props> = ({ destinationId, tripId }) => {

  // TODO: Refactor to use tripId exclusively once all itineraries are migrated

  const rawItineraries = useItinerariesStore(state => state.itineraries);
  console.log(rawItineraries);
  const itineraries = useMemo(() => {
    return Object.values(rawItineraries).flat().filter(it => it.tripId === tripId);
  }, [rawItineraries, tripId]);

  const itineraryActivities = useItinerariesStore(state => state.itineraryActivities);
  const activitiesForDestination = useActivitiesStore(state => state.activities[destinationId] ?? EMPTY_ITINERARIES);

  const resolvedItineraries: ResolvedItinerary[] = useMemo(() => {
    return getItinerariesWithActivities(itineraries, itineraryActivities, activitiesForDestination);
  }, [itineraries, itineraryActivities, activitiesForDestination]);

  // Always show either the grid or a friendly message
  if (!resolvedItineraries.length) return <div>No itineraries added yet.</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full px-2 sm:px-0">

      {resolvedItineraries.map(it => (
        <ItineraryCard key={it.id} itinerary={it} destinationId={destinationId} tripId={tripId} />
      ))}
    </div>
  );
};

export default ItinerariesGrid;
