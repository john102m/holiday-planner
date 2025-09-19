// slices/itinerariesSlice.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Itinerary, ItineraryActivity, QueuedAction, Activity, ResolvedItinerary } from "../types";
import { uploadToAzureBlob } from "../storeUtils";
import { handleQueueError } from "../../components/common/useErrorHandler";
import type { BaseSliceState } from "../../components/common/useErrorHandler";

//import { useActivitiesStore } from "./activitiesSlice";
import {
    createItinerary,
    editItinerary,
    deleteItinerary,
    editItineraryActivity,
    createItineraryActivity,
    deleteItineraryActivity,

} from "../apis/itinerariesApi";

interface ItinerariesSliceState extends BaseSliceState {
    itineraries: Record<string, Itinerary[]>; // grouped by destination
    itineraryActivities: Record<string, ItineraryActivity[]>; // grouped by itineraryId

    // Itineraries
    setItineraries: (destId: string, itins: Itinerary[]) => void;
    addItinerary: (destId: string, itin: Itinerary) => void;
    updateItinerary: (destId: string, itin: Itinerary) => void;
    replaceItinerary: (tempId: string, saved: Itinerary) => void;
    removeItinerary: (destId: string, itineraryId: string) => void;
    getItineraries: () => Itinerary[];
    getItinerariesByTrip: (tripId: string) => Itinerary[],

    // ItineraryActivities (join table)
    setItineraryActivities: (itinId: string, items: ItineraryActivity[]) => void;
    addItineraryActivity: (itinId: string, item: ItineraryActivity) => void;
    replaceItineraryActivity: (itinId: string, item: ItineraryActivity) => void;
    moveItineraryActivity: (itineraryId: string, joinId: string, direction: "up" | "down") => void;
    updateItineraryActivity: (itinId: string, item: ItineraryActivity) => void;
    removeItineraryActivity: (itinId: string, id: string) => void;


    // new error state
    errorMessage: string | null;
    setError: (msg: string | null) => void;
}

/**
 * Resolves itineraries so each has an `activities` array of actual Activity objects.
 * @param itineraries - Array of itineraries for a destination
 * @param itineraryActivities - Record of itineraryId → join table entries
 * @param allActivities - Flat array of all Activity objects
 */
export function getItinerariesWithActivities(
    itineraries: Itinerary[],
    itineraryActivities: Record<string, ItineraryActivity[]>,
    allActivities: Activity[]
): ResolvedItinerary[] {

    // Build a lookup for activities by ID
    const activitiesById: Record<string, Activity> = {};
    allActivities.forEach(act => {
        if (act.id) activitiesById[act.id] = act;
    });

    return itineraries.map(itinerary => {
        // Only process if itinerary has an ID
        const id = itinerary.id;
        if (!id) {
            return { ...itinerary, activities: [] } as ResolvedItinerary;
        }

        const joins: ItineraryActivity[] = itineraryActivities[id] ?? [];

        // Map join table to actual activities, filtering out missing IDs
        const activities: Activity[] = joins
            .map((join: ItineraryActivity) => activitiesById[join.activityId])
            .filter((act: Activity | undefined): act is Activity => !!act);

        return { ...itinerary, activities };
    });
}


console.log("🔥 itinerariesSlice.ts loaded — check new import resolution");

export const useItinerariesStore = create<ItinerariesSliceState>()(
    persist(
        (set, get) => ({
            itineraries: {},
            itineraryActivities: {},

            // -------- Itineraries --------
            setItineraries: (destId, itins) => //Replace all itineraries for a destination
                set((state) => ({
                    itineraries: { ...state.itineraries, [destId]: itins },
                })),

            addItinerary: (destId, itin) => //Append a new itinerary to the destination’s list
                set((state) => ({
                    itineraries: {
                        ...state.itineraries,
                        [destId]: [...(state.itineraries[destId] || []), itin],
                    },
                })),

            updateItinerary: (destId, updated) =>//Finds an itinerary by ID and updates it
                set((state) => {
                    const existing = state.itineraries[destId] || [];
                    const updatedList = existing.map((i) =>
                        i.id === updated.id ? updated : i
                    );
                    return { itineraries: { ...state.itineraries, [destId]: updatedList } };
                }),

            replaceItinerary: (tempId, saved) =>//Replaces an itinerary with a temporary ID (used after creation)
                set((state) => {
                    const updated = Object.entries(state.itineraries).reduce(
                        (acc, [destId, itins]) => {
                            acc[destId] = itins.map((i) => (i.id === tempId ? saved : i));
                            return acc;
                        },
                        {} as Record<string, Itinerary[]>
                    );
                    return { itineraries: updated };
                }),

            removeItinerary: (destId, itineraryId) =>//Removes an itinerary by ID from the destination’s list
                set((state) => ({
                    itineraries: {
                        ...state.itineraries,
                        [destId]: state.itineraries[destId]?.filter(
                            (i) => i.id !== itineraryId
                        ),
                    },
                })),

            getItineraries: () => Object.values(get().itineraries).flat(),//Returns all itineraries across all destinations
            // TODO: Refactor to use tripId instead of destinationId once trip-based itineraries are fully supported
            getItinerariesByTrip: (tripId: string) => {
                const allItineraries = Object.values(get().itineraries).flat();
                return allItineraries.filter(it => it.tripId === tripId);
            },

            // -------- ItineraryActivities --------
            setItineraryActivities: (itinId, items) =>//Replace all itinerary activities for a given itinerary
                set((state) => ({
                    itineraryActivities: {
                        ...state.itineraryActivities,
                        [itinId]: items,
                    },
                })),

            addItineraryActivity: (itinId, item) =>//Appends a new itinerary activity to the itinerary’s list
                set((state) => ({
                    itineraryActivities: {
                        ...state.itineraryActivities,
                        [itinId]: [...(state.itineraryActivities[itinId] || []), item],
                    },
                })),

            updateItineraryActivity: (itinId, item) =>//Finds an itinerary activity by ID and updates it
                set((state) => {
                    const existing = state.itineraryActivities[itinId] || [];
                    const updatedList = existing.map((ia) =>
                        ia.id === item.id ? item : ia
                    );
                    return {
                        itineraryActivities: { ...state.itineraryActivities, [itinId]: updatedList },
                    };
                }),
            replaceItineraryActivity: (tempId, confirmedItem) =>
                set((state) => {
                    const updated = { ...state.itineraryActivities };

                    for (const [itinId, acts] of Object.entries(updated)) {
                        const index = acts.findIndex((a) => a.id === tempId);
                        if (index !== -1) {
                            updated[itinId] = [
                                ...acts.slice(0, index),
                                confirmedItem,
                                ...acts.slice(index + 1)
                            ];
                            break;
                        }
                    }

                    return { itineraryActivities: updated };
                }),

            moveItineraryActivity: (
                itineraryId: string,       // The ID of the itinerary we're modifying
                joinId: string,            // The ID of the activity join we want to move
                direction: "up" | "down"   // Direction to move the activity
            ) => {
                // Clone the current list of joins for this itinerary from the store
                const joins = [...get().itineraryActivities[itineraryId]];

                // Find the index of the join we're trying to move
                const index = joins.findIndex(j => j.id === joinId);

                // Calculate the target index based on the direction
                const targetIndex = direction === "up" ? index - 1 : index + 1;

                // If the target index is out of bounds, do nothing
                if (targetIndex < 0 || targetIndex >= joins.length) return;

                // Swap the join at the current index with the one at the target index
                [joins[index], joins[targetIndex]] = [joins[targetIndex], joins[index]];

                // Reindex all joins to ensure sortOrder values are sequential and gap-free
                const reordered = joins.map((join, i) => ({
                    ...join,
                    sortOrder: i // Assign new sortOrder based on array position
                }));

                // Update the store with the newly ordered list
                get().setItineraryActivities(itineraryId, reordered);
            },

            removeItineraryActivity: (itinId: string, id: string) => {
                set((state) => {
                    // Filter out the deleted join
                    const updatedJoins = (state.itineraryActivities[itinId] ?? []).filter(
                        (ia) => ia.id !== id
                    );

                    // Reindex sortOrder to keep it clean
                    const reindexed = updatedJoins.map((join, i) => ({
                        ...join,
                        sortOrder: i
                    }));

                    return {
                        itineraryActivities: {
                            ...state.itineraryActivities,
                            [itinId]: reindexed
                        }
                    };
                });
            },
            // error handling
            errorMessage: null,
            setError: (msg) => set({ errorMessage: msg }),
        }),

        {   //Wraps the store so its state is saved to localStorage under the key "itineraries-store"
            name: "itineraries-store",
            storage: createJSONStorage(() => localStorage),
        }
    )
);

// 🧠 Why This Design Works
// Decoupling: Activities live in their own slice, and itineraries reference them via itineraryActivities. This avoids duplication and keeps updates clean.
// Flexibility: You can easily support drag-and-drop reordering, activity reuse, and even offline queuing.
// Scalability: As your app grows (e.g. multi-user, collaborative editing), this structure will hold up.
// If you ever want to add features like:
// Draft itineraries
// Activity suggestions based on itinerary context
// Conflict detection (e.g. overlapping time slots)
// …this architecture will support it beautifully.

export const handleCreateItinerary = async (action: QueuedAction) => {
    const { replaceItinerary, addItinerary } = useItinerariesStore.getState();
    const itin = action.payload as Itinerary;

    console.log("📦 [Queue] Processing CREATE_ITINERARY for:", itin.name);

    try {
        const { itinerary: saved, sasUrl } = await createItinerary(itin);
        console.log("✅ [API] Itinerary created:", saved);
        console.log("🔗 [API] Received SAS URL:", sasUrl);

        if (action.tempId) {
            console.log("🔄 [Store] Replacing optimistic itinerary with saved one");
            replaceItinerary(action.tempId, saved);
        } else {
            console.log("➕ [Store] Adding new itinerary to store");
            addItinerary(saved.destinationId, saved);
        }

        if (sasUrl && "imageFile" in itin && itin.imageFile instanceof File) {
            console.log("📤 [Upload] Uploading itinerary image to Azure Blob...");
            await uploadToAzureBlob(itin.imageFile, sasUrl);
            console.log("✅ [Upload] Itinerary image upload complete");
        } else {
            console.log("⚠️ [Upload] No image file found or SAS URL missing");
        }
    } catch (error: unknown) {
        handleQueueError(useItinerariesStore.getState(), error);
    }
};


export const handleUpdateItinerary = async (action: QueuedAction) => {
    const { updateItinerary } = useItinerariesStore.getState();
    const itin = action.payload as Itinerary;

    console.log("📦 [Queue] Processing UPDATE_ITINERARY for:", itin.name);

    if (!itin.id) {
        console.error("❌ [Queue] Cannot update itinerary without ID");
        return;
    }

    try {
        const { sasUrl, imageUrl } = await editItinerary(itin.id, itin);

        // Optimistic update first
        updateItinerary(itin.destinationId, {
            ...itin,
            imageUrl: imageUrl ?? itin.imageUrl,
        });

        if (sasUrl && itin.imageFile instanceof File) {
            console.log("📤 [Upload] Uploading itinerary image to Azure Blob...");
            await uploadToAzureBlob(itin.imageFile, sasUrl);
            console.log("✅ [Upload] Itinerary image upload complete");

            if (imageUrl) {
                const cacheBustedUrl = `${imageUrl}?t=${Date.now()}`;
                updateItinerary(itin.destinationId, {
                    ...itin,
                    imageFile: undefined,
                    hasImage: true,
                    imageUrl: cacheBustedUrl,
                });
                console.log("🔄 [Store] Itinerary image updated to:", cacheBustedUrl);
            }
        } else {
            console.log("⚠️ [Upload] No image file found or SAS URL missing");
        }
    } catch (error: unknown) {
        handleQueueError(useItinerariesStore.getState(), error);
    }
};

// export const handleUpdateItinerary = async (action: QueuedAction) => {
//     const { updateItinerary } = useItinerariesStore.getState();
//     const itin = action.payload as Itinerary;
//     if (!itin.id) throw new Error("Cannot update itinerary without ID");
//     await editItinerary(itin.id, itin);
//     updateItinerary(itin.destinationId, itin);
// };

export const handleDeleteItinerary = async (action: QueuedAction) => {
    const { removeItinerary } = useItinerariesStore.getState();
    const itin = action.payload as Itinerary;
    try {
        if (!itin.id) throw new Error("Cannot delete itinerary without ID");
        await deleteItinerary(itin.id);
        removeItinerary(itin.destinationId, itin.id);
    } catch (error: unknown) {
        handleQueueError(useItinerariesStore.getState(), error);
    }

};

// Join table
export const handleCreateItineraryActivity = async (action: QueuedAction) => {
    const { addItineraryActivity, replaceItineraryActivity } = useItinerariesStore.getState();
    const item = action.payload as ItineraryActivity;

    // Strip temp ID before sending to backend
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, ...cleanPayload } = item;
    console.log("🚀 Sending to backend:", cleanPayload);

    try {
        const saved = await createItineraryActivity(cleanPayload);
        console.log("✅ Backend responded with:", saved);
        console.log("🔍 Temp ID to replace:", action.tempId);
        console.log("🧠 Current store before replace:", useItinerariesStore.getState().itineraryActivities);


        if (action.tempId) {
            console.log("🔁 Replacing temp activity:", action.tempId, "with", saved.id);
            replaceItineraryActivity(action.tempId, saved);
        } else {
            console.log("➕ Adding new itinerary activity:", saved);
            addItineraryActivity(saved.itineraryId, saved);
        }

        console.log("📦 Store update complete");
        console.log("🧠 Updated itineraryActivities:", useItinerariesStore.getState().itineraryActivities);


    } catch (error: unknown) {
        handleQueueError(useItinerariesStore.getState(), error);
    }
};



export const handleUpdateItineraryActivity = async (action: QueuedAction) => {
    const { updateItineraryActivity } = useItinerariesStore.getState();
    const item = action.payload as ItineraryActivity;
    try {
        if (!item.id) {
            console.warn("Cannot update itinerary activity: missing ID", item);
            return;
        }

        await editItineraryActivity(item.id, item);
        updateItineraryActivity(item.itineraryId, item);
    } catch (error: unknown) {
        handleQueueError(useItinerariesStore.getState(), error);
    }
};


export const handleDeleteItineraryActivity = async (action: QueuedAction) => {
    const { removeItineraryActivity } = useItinerariesStore.getState();
    const item = action.payload as ItineraryActivity;
    try {

        if (!item.id) {
            console.warn("Cannot delete itinerary activity: missing ID", item);
            return;
        }

        await deleteItineraryActivity(item.id);
        removeItineraryActivity(item.itineraryId, item.id);
    } catch (error: unknown) {
        handleQueueError(useItinerariesStore.getState(), error);
    }

};

