// src/hooks/useItineraryActivities.ts
import { useMemo } from "react";
import { useItinerariesStore } from "../services/slices/itinerariesSlice";
import { useActivitiesStore } from "../services/slices/activitiesSlice"
import type { Activity } from "./types";

/**
 * Custom hook: useItineraryActivities
 *
 * Returns the full Activity objects associated with a given itinerary ID.
 *
 * Data Flow:
 * 1. Pulls all activities grouped by destination from `activitiesByDestId` (Zustand store).
 * 2. Pulls itinerary-specific activity references from `itineraryActivitiesRecord` (Zustand store).
 * 3. Builds a flat lookup map of all activities keyed by their `id` for O(1) access.
 * 4. Maps the itinerary activity references to the full Activity objects using the lookup map.
 *
 * Memoization Strategy:
 * - `activitiesById` is memoized with useMemo; it rebuilds only when `activitiesByDestId` changes.
 * - The mapping from itinerary activity IDs to full Activity objects is also memoized.
 *   - Lookup of `itineraryActivitiesForIds` is done inside useMemo to ensure stable dependencies.
 *   - Dependencies tracked: `itineraryActivitiesRecord`, `itineraryId`, and `activitiesById`.
 *
 * Type Safety:
 * - Checks that `act.id` exists before using it as a key.
 * - Filters out any undefined results from the mapping step using a type predicate.
 *
 * Performance:
 * - Efficient for large datasets because:
 *    - Lookup is O(1) per activity via the map.
 *    - No flattening of all destination arrays on every render.
 *    - useMemo ensures recalculation happens only when relevant data changes.
 *
 * Usage:
 * const activities = useItineraryActivities(itinerary.id);
 */

export function useItineraryActivities(itineraryId: string | null) {
  const activitiesByDestId = useActivitiesStore(state => state.activities ?? {});
  const itineraryActivitiesRecord = useItinerariesStore(state => state.itineraryActivities ?? {});

  const activitiesById = useMemo(() => {
    const map: Record<string, Activity> = {};
    Object.values(activitiesByDestId).forEach(arr =>
      (arr ?? []).forEach(act => {
        if (act?.id) map[act.id] = act;
      })
    );
    return map;
  }, [activitiesByDestId]);

  const filteredActivities = useMemo(() => {
    const itineraryActivitiesForIds = itineraryActivitiesRecord[itineraryId ?? ""] ?? [];
    return itineraryActivitiesForIds
      .map(ia => activitiesById[ia.activityId])
      .filter((a): a is Activity => !!a);
  }, [itineraryActivitiesRecord, itineraryId, activitiesById]);

  return filteredActivities;
}

