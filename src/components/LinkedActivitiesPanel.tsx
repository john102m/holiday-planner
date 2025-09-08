import React, { useMemo, useState } from "react";
import { useItinerariesStore } from "../services/slices/itinerariesSlice";
import { useActivitiesStore } from "../services/slices/activitiesSlice";
import ActivityCard from "./cards/ActivityCard";
import type { Activity, ItineraryActivity } from "../services/types";
import { addOptimisticAndQueue } from "../services/store";
import { QueueTypes, CollectionTypes } from "../services/types"; // value import
import { Tooltip } from "./Tooltip";

/**
 * LinkedActivitiesPanel
 * ---------------------
 * This component renders the list of activities linked to a specific itinerary
 * and allows the user to add new activities or reorder/delete existing ones.
 *
 * Props:
 *  - itineraryId: string -- the ID of the itinerary to render
 *
 * State & Store:
 *  - selectedActivityId: local state for dropdown selection
 *  - itineraryActivities: all itinerary-activity links from Zustand
 *  - activitiesByDestId: all activities grouped by destination from Zustand
 *
 * Core Logic:
 *  1. Joins: 'joins' contains all ItineraryActivity objects for this itinerary.
 *     'linkedActivityIds' is a Set of activity IDs already linked.
 *  2. Available Activities:
 *     - Flatten all activities into a lookup map for quick access by ID.
 *     - Filter activities to only those not yet linked and matching
 *       the itinerary's destination.
 *  3. Selected Activity:
 *     - 'selectedActivity' is the activity currently chosen in the dropdown.
 *  4. Adding / Deleting:
 *     - handleAddActivity: adds a new join to Zustand and resets dropdown.
 *     - handleDeleteActivity: removes the join locally and queues deletion for backend.
 *  5. Reordering:
 *     - moveJoin: changes the sort order of linked activities in the store.
 *
 * UI:
 *  - Dropdown + Add button
 *  - Preview panel for selected activity
 *  - List of linked activities with reorder and delete buttons
 *
 * Performance Notes:
 *  - useMemo is used to avoid recomputing filtered lists or flattened maps
 *    on every render unnecessarily.
 */

// Props: expects an itineraryId to render activities for
interface Props {
    itineraryId: string;
}

const LinkedActivitiesPanel: React.FC<Props> = ({ itineraryId }) => {
    // --- State for the dropdown selection ---
    const [selectedActivityId, setSelectedActivityId] = useState<string>("");

    console.log("Passed in itinerary id:", itineraryId);

    // --- Pull all itinerary-activity joins (the "link table") from Zustand ---
    const itineraryActivities = useItinerariesStore(state => state.itineraryActivities);

    // --- Pull all activities grouped by destination from Zustand ---
    const activitiesByDestId = useActivitiesStore(state => state.activities);

    // --- Get the list of joins for this specific itinerary ---
    // This will return an array of ItineraryActivity objects for the given itinerary
    const joins: ItineraryActivity[] = useMemo(() => {
        return itineraryActivities[itineraryId] ?? [];
    }, [itineraryActivities, itineraryId]);

    // --- Pull the itinerary object itself to access properties like destinationId ---
    const itinerary = useItinerariesStore(state =>
        state.getItineraries().find(i => i.id === itineraryId)
    );

    // --- Flatten activities into a lookup map by their ID for easy access ---
    // This is useful for quickly finding an activity by ID when rendering linked activities
    const flatActivitiesById: Record<string, Activity> = useMemo(() => {
        const flat: Record<string, Activity> = {};
        Object.values(activitiesByDestId)
            .flat() // flatten arrays by destination
            .forEach(act => {
                if (act.id) flat[act.id] = act;
            });
        return flat;
    }, [activitiesByDestId]);

    // --- Compute the set of activity IDs already linked to this itinerary ---
    const linkedActivityIds = new Set(joins.map(j => j.activityId));

    // --- Compute available activities for this itinerary's destination ---
    // Only show activities not yet linked and that match the itinerary's destination
    const availableActivities = Object.values(flatActivitiesById).filter(
        act => !linkedActivityIds.has(act.id!) && act.destinationId === itinerary?.destinationId
    );

    // --- Preview activity for the dropdown selection ---
    const selectedActivity = selectedActivityId
        ? flatActivitiesById[selectedActivityId]
        : null;

    // --- Handler for reordering activities in the itinerary ---
    const moveJoin = (direction: "up" | "down", joinId: string) => {
        useItinerariesStore.getState().moveItineraryActivity(itineraryId, joinId, direction);
    };

    console.log("itineraryId: ", itineraryId);

    // --- Handler for adding a new activity to the itinerary ---
    const handleAddActivity = () => {
        const newJoin: ItineraryActivity = {
            id: `temp-${Date.now()}`, // temporary ID until backend persists
            itineraryId,
            activityId: selectedActivityId,
            sortOrder: joins.length, // append to the end
            notes: "" // default empty note
        };
        useItinerariesStore.getState().addItineraryActivity(itineraryId, newJoin);
        setSelectedActivityId(""); // reset dropdown selection
    };

    // --- Handler for deleting a linked activity ---
    const handleDeleteActivity = async (activityId: string) => {
        const store = useItinerariesStore.getState();
        const activityToDelete = store.itineraryActivities[itineraryId].find(a => a.id === activityId);
        if (!activityToDelete) return;

        // Update local store immediately
        const updatedActivities = store.itineraryActivities[itineraryId].filter(a => a.id !== activityId);
        store.setItineraryActivities(itineraryId, updatedActivities);

        // Queue the deletion for backend persistence
        await addOptimisticAndQueue(
            CollectionTypes.ItineraryActivities,
            activityToDelete,
            QueueTypes.DELETE_ITINERARY_ACTIVITY
        );
    };

    // --- Guard: if no itineraryId passed in, show loading state ---
    if (!itineraryId) return <p>Loading itinerary...</p>;

    return (
        <div className="flex flex-col md:flex-row gap-6">
            {/* 🔹 Dropdown + Add Button */}
            <div className="order-1 md:order-none w-full md:w-1/3">
                <div className="mb-4 flex gap-2 items-center">
                    <select
                        value={selectedActivityId}
                        onChange={(e) => setSelectedActivityId(e.target.value)}
                        className="text-sm px-2 py-1 border rounded w-full"
                    >
                        <option value="">Select an activity</option>
                        {availableActivities.map((act) => (
                            <option key={act.id} value={act.id}>
                                {act.name}
                            </option>
                        ))}
                    </select>

                    <Tooltip content={!selectedActivityId ? "Select an activity first" : ""}>
                        <button
                            disabled={!selectedActivityId}
                            className="text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                            onClick={handleAddActivity}
                        >
                            ➕ Add Activity
                        </button>
                    </Tooltip>


                </div>

                {/* 🔹 Preview Panel for the selected activity */}
                {selectedActivity && (
                    <div>
                        <h4 className="text-sm font-semibold mb-2 text-gray-600">Preview</h4>
                        <ActivityCard
                            activity={selectedActivity}
                            destinationId={selectedActivity.destinationId}
                            showActions={false} // no edit/delete buttons in preview
                        />
                    </div>
                )}
            </div>

            {/* 🔹 Activity List */}
            <div className="order-2 md:order-none flex-1">
                <ul className="list-none text-sm text-gray-700">
                    {joins.map((join) => {
                        const act = flatActivitiesById[join.activityId];
                        if (!act) return null; // safety check

                        return (
                            <li key={join.id} className="mb-3 flex items-start gap-3">
                                {/* Sort order badge */}
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
                                    {join.sortOrder! + 1}
                                </div>

                                <div className="flex-1">
                                    {/* Activity name */}
                                    <div className="font-medium">{act.name}</div>
                                    {/* Activity details */}
                                    {act.details && <div className="text-xs text-gray-500">{act.details}</div>}
                                    {/* Optional notes */}
                                    {join.notes && <div className="text-xs italic text-blue-500">Note: {join.notes}</div>}

                                    {/* Action buttons */}
                                    <div className="mt-1 flex gap-2">
                                        <button
                                            className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                                            onClick={() => moveJoin("up", join.id!)}
                                        >
                                            ↑ Move Up
                                        </button>
                                        <button
                                            className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                                            onClick={() => moveJoin("down", join.id!)}
                                        >
                                            ↓ Move Down
                                        </button>
                                        <button
                                            className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                                            onClick={() =>
                                                handleDeleteActivity(join.id!)
                                            }
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div >
    );
};

export default LinkedActivitiesPanel;
