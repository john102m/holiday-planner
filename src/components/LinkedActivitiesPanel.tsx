import React, { useMemo, useState } from "react";
import { useItinerariesStore } from "../services/slices/itinerariesSlice";
import { useActivitiesStore } from "../services/slices/activitiesSlice";
import ActivityCard from "./cards/ActivityCard";
import type { Activity, ItineraryActivity } from "../services/types";
import { addOptimisticAndQueue } from "../services/store";
import { QueueTypes, CollectionTypes } from "../services/types"; // value import

// Props: expects an itineraryId to render activities for
interface Props {
    itineraryId: string;
}

const LinkedActivitiesPanel: React.FC<Props> = ({ itineraryId }) => {
    const [selectedActivityId, setSelectedActivityId] = useState<string>("");

    // Pull all itinerary-activity joins from Zustand
    const itineraryActivities = useItinerariesStore(state => state.itineraryActivities);

    // Pull all activities grouped by destination from Zustand
    const activitiesByDestId = useActivitiesStore(state => state.activities);

    // Get the list of joins for this specific itinerary
    const joins: ItineraryActivity[] = useMemo(() => {
        return itineraryActivities[itineraryId] ?? [];
    }, [itineraryActivities, itineraryId]);

    // Flatten the activity store into a lookup map by activityId
    const flatActivitiesById: Record<string, Activity> = useMemo(() => {
        const flat: Record<string, Activity> = {};
        Object.values(activitiesByDestId).flat().forEach(act => {
            if (act.id) flat[act.id] = act;
        });
        return flat;
    }, [activitiesByDestId]);

    const selectedActivity = selectedActivityId
        ? flatActivitiesById[selectedActivityId]
        : null;

    // Resolve full Activity objects from the join table
    const linkedActivities: Activity[] = useMemo(() => {
        const activities: Activity[] = [];
        joins.forEach(join => {
            const act = flatActivitiesById[join.activityId];
            if (!act) {
                console.warn("Missing activity for join:", join);
                return;
            }
            activities.push(act);
        });

        return activities;
    }, [joins, flatActivitiesById]);

    // Reorder handler: moves a join up or down in the list
    const moveJoin = (direction: "up" | "down", joinId: string) => {
        useItinerariesStore.getState().moveItineraryActivity(itineraryId, joinId, direction);
    };

    // Render the list of joins with resolved activity data
    const linkedActivityIds = new Set(joins.map(j => j.activityId));

    const availableActivities = Object.values(flatActivitiesById).filter(
        act => !linkedActivityIds.has(act.id!)
    );

    const handleAddActivity = () => {
        const newJoin: ItineraryActivity = {
            id: `temp-${Date.now()}`,
            itineraryId,
            activityId: selectedActivityId,
            sortOrder: joins.length,
            notes: ""
        };
        useItinerariesStore.getState().addItineraryActivity(itineraryId, newJoin);
        setSelectedActivityId(""); // reset dropdown
    };

    const handleDeleteActivity = async (activityId: string) => {

        const store = useItinerariesStore.getState();
        const activityToDelete = store.itineraryActivities[itineraryId].find(a => a.id === activityId);
        if (!activityToDelete) return;

        const updatedActivities = store.itineraryActivities[itineraryId].filter(a => a.id !== activityId);
        store.setItineraryActivities(itineraryId, updatedActivities);

        // Queue the delete for backend
        await addOptimisticAndQueue(
            CollectionTypes.ItineraryActivities,
            activityToDelete,
            QueueTypes.DELETE_ITINERARY_ACTIVITY
        );
    };

    // If no activities are linked, show a placeholder
    if (linkedActivities.length === 0) {
        return <p className="text-sm italic text-gray-400">No linked activities</p>;
    }

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

                    <button
                        disabled={!selectedActivityId}
                        className="text-xs px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                        onClick={handleAddActivity}
                    >
                        ➕ Add Activity
                    </button>
                </div>

                {/* 🔹 Preview Panel (now appears right after dropdown on mobile) */}
                {selectedActivity && (
                    <div>
                        <h4 className="text-sm font-semibold mb-2 text-gray-600">Preview</h4>
                        <ActivityCard
                            activity={selectedActivity}
                            destinationId={selectedActivity.destinationId}
                            showActions={false}
                        />
                    </div>
                )}
            </div>

            {/* 🔹 Activity List */}
            <div className="order-2 md:order-none flex-1">
                <ul className="list-none text-sm text-gray-700">
                    {joins.map((join) => {
                        const act = flatActivitiesById[join.activityId];
                        if (!act) return null;

                        return (
                            <li key={join.id} className="mb-3 flex items-start gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
                                    {join.sortOrder! + 1}
                                </div>

                                <div className="flex-1">
                                    <div className="font-medium">{act.name}</div>
                                    {act.details && <div className="text-xs text-gray-500">{act.details}</div>}
                                    {join.notes && <div className="text-xs italic text-blue-500">Note: {join.notes}</div>}

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
