import React, { useMemo, useState } from "react";
import { useItinerariesStore } from "../../services/slices/itinerariesSlice";
import { useActivitiesStore } from "../../services/slices/activitiesSlice";
import { addOptimisticAndQueue } from "../../services/store";
import { QueueTypes, CollectionTypes } from "../../services/types";
import type { Activity } from "../../services/types";
import LinkedActivityWidget from "./LinkedActivityWidget";
import ActivityPreview from "./ActivityPreview"; // new preview component
import { Tooltip } from "../Tooltip";

interface Props {
    itineraryId: string;
}

const LinkedActivitiesPanel: React.FC<Props> = ({ itineraryId }) => {
    const [selectedActivityId, setSelectedActivityId] = useState<string>("");
    const [deleteModalJoinId, setDeleteModalJoinId] = useState<string | null>(null);

    const itineraryActivities = useItinerariesStore(state => state.itineraryActivities);
    const activitiesByDestId = useActivitiesStore(state => state.activities);

    const joins = useMemo(() => itineraryActivities[itineraryId] ?? [], [itineraryActivities, itineraryId]);
    const itinerary = useItinerariesStore(state =>
        state.getItineraries().find(i => i.id === itineraryId)
    );
    console.log("Itinerary: ", itinerary)
    const flatActivitiesById = useMemo(() => {
        const flat: Record<string, Activity> = {};
        Object.values(activitiesByDestId).flat().forEach(act => { if (act.id) flat[act.id] = act; });
        return flat;
    }, [activitiesByDestId]);

    const linkedActivityIds = new Set(joins.map(j => j.activityId));
    //this will make the dropdown have activities for this destination but not private ones from another trip
    const filteredActivities = Object.values(flatActivitiesById)
        .filter(act =>
            !linkedActivityIds.has(act.id!) &&                         // exclude already linked activities
            act.destinationId === itinerary?.destinationId &&          // only for this destination
            (!itinerary?.tripId || !act.tripId || act.tripId === itinerary.tripId) // exclude private activities from other trips
        );



    const selectedActivity = selectedActivityId ? flatActivitiesById[selectedActivityId] : null;

    const moveJoin = (direction: "up" | "down", joinId: string) => {
        useItinerariesStore.getState().moveItineraryActivity(itineraryId, joinId, direction);
    };

    const handleAddActivity = () => {
        if (!selectedActivityId) return;
        const newJoin = {
            id: `temp-${Date.now()}`,
            itineraryId,
            activityId: selectedActivityId,
            sortOrder: joins.length,
            notes: ""
        };
        useItinerariesStore.getState().addItineraryActivity(itineraryId, newJoin);
        setSelectedActivityId("");
    };

    const handleDeleteActivity = (joinId: string) => {
        const store = useItinerariesStore.getState();
        const activityToDelete = store.itineraryActivities[itineraryId].find(a => a.id === joinId);
        if (!activityToDelete) return;

        // If there’s a note, open modal
        if (activityToDelete.notes && activityToDelete.notes.trim() !== "") {
            setDeleteModalJoinId(joinId);
            return;
        }

        // Otherwise delete immediately
        confirmDelete(joinId);
    };


    const confirmDelete = async (joinId: string) => {
        const store = useItinerariesStore.getState();
        const activityToDelete = store.itineraryActivities[itineraryId].find(a => a.id === joinId);
        if (!activityToDelete) return;

        const updated = store.itineraryActivities[itineraryId].filter(a => a.id !== joinId);
        store.setItineraryActivities(itineraryId, updated);

        await addOptimisticAndQueue(
            CollectionTypes.ItineraryActivities,
            activityToDelete,
            QueueTypes.DELETE_ITINERARY_ACTIVITY
        );

        setDeleteModalJoinId(null);
    };


    const handleSaveNotes = (joinId: string, newNotes: string) => {
        const store = useItinerariesStore.getState();
        const updated = store.itineraryActivities[itineraryId].map(a =>
            a.id === joinId ? { ...a, notes: newNotes } : a
        );
        store.setItineraryActivities(itineraryId, updated);

        const activityToUpdate = store.itineraryActivities[itineraryId].find(a => a.id === joinId);
        if (activityToUpdate) {
            addOptimisticAndQueue(
                CollectionTypes.ItineraryActivities,
                { ...activityToUpdate, notes: newNotes },
                QueueTypes.UPDATE_ITINERARY_ACTIVITY
            );
        }
    };

    if (!itineraryId) return <p>Loading itinerary...</p>;

    return (
        <div className="flex flex-col md:flex-row gap-6">
            {/* Dropdown + Add */}
            <div className="order-1 md:order-none w-full md:w-1/3">
                <div className="mb-4 flex gap-2 items-center">
                    <select
                        value={selectedActivityId}
                        onChange={(e) => setSelectedActivityId(e.target.value)}
                        className="text-sm px-2 py-1 border rounded w-full"
                    >
                        <option value="">Select an activity</option>
                        {filteredActivities.map((act) => (
                            <option key={act.id} value={act.id}>
                                {act.name}
                            </option>
                        ))}
                        {filteredActivities.length === 0 && <option disabled>No available activities</option>}
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

                {/* Preview */}
                {selectedActivity && <ActivityPreview activity={selectedActivity} />}
            </div>

            {/* Activity List */}
            <div className="order-2 md:order-none flex-1">
                <ul className="list-none text-sm text-gray-700">
                    {joins.map((join) => {
                        const act = flatActivitiesById[join.activityId];
                        if (!act) return null;

                        return (
                            <LinkedActivityWidget
                                key={join.id}
                                join={join}
                                activity={act}
                                onMoveUp={() => moveJoin("up", join.id!)}
                                onMoveDown={() => moveJoin("down", join.id!)}
                                onDelete={() => handleDeleteActivity(join.id!)}
                                onUpdateNotes={(newNotes) => handleSaveNotes(join.id!, newNotes)}
                            />
                        );
                    })}
                </ul>
            </div>
            {deleteModalJoinId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/20 p-4">
                    <div className="bg-white rounded-lg w-full max-w-sm p-4 shadow-lg">
                        <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
                        <p className="text-sm text-gray-700 mb-4">
                            This activity has a note. Deleting it will remove the note. Are you sure?
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                onClick={() => setDeleteModalJoinId(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                onClick={() => confirmDelete(deleteModalJoinId)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>


    );
};

export default LinkedActivitiesPanel;
