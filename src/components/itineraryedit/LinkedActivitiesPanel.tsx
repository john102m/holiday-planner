import React, { useMemo, useState } from "react";
import { useItinerariesStore } from "../../services/slices/itinerariesSlice";
import { useActivitiesStore } from "../../services/slices/activitiesSlice";
import { addOptimisticAndQueue } from "../../services/store";
import { QueueTypes, CollectionTypes } from "../../services/types";
import type { Activity } from "../../services/types";
import ActivitySelector from "./ActivitySelector";
import LinkedActivityList from "./LinkedActivityList";
import DeleteConfirmModal from "./DeleteConfirmModal";
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
        <div className="max-w-5xl mx-auto sm:px-4 mt-6">
            <div className="flex flex-col md:flex-row">
                {/* Left: Selector */}
                <div className="w-full md:w-1/3">
                    <ActivitySelector
                        filteredActivities={filteredActivities}
                        selectedActivityId={selectedActivityId}
                        setSelectedActivityId={setSelectedActivityId}
                        onAdd={handleAddActivity}
                        selectedActivity={selectedActivity}
                    />
                </div>

                {/* Right: Activity List */}
                <div className="flex-1 overflow-y-auto">
                    <LinkedActivityList
                        joins={joins}
                        flatActivitiesById={flatActivitiesById}
                        onMoveJoin={moveJoin}
                        onDelete={handleDeleteActivity}
                        onUpdateNotes={handleSaveNotes}
                    />
                </div>
            </div>

            {/* Modal */}
            {deleteModalJoinId && (
                <DeleteConfirmModal
                    onCancel={() => setDeleteModalJoinId(null)}
                    onConfirm={() => confirmDelete(deleteModalJoinId)}
                />
            )}
        </div>

    );
};

export default LinkedActivitiesPanel;
