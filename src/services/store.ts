import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { updateItineraryActivitiesBatch } from "./apis/itinerariesApi"
import { uploadToAzureBlob } from "./storeUtils";

import {
  createUserTrip, editUserTrip, deleteUserTrip
} from "./apis/api";
import type {
  Entity, Destination, Activity, Package,
  Itinerary, UserTrip,
  QueueType, CollectionType, QueuedAction,
  ItineraryActivity, ItineraryActivitiesBatch,
  DiaryEntry
} from "./types";
import { CollectionTypes, QueueTypes } from "./types";

import { useActivitiesStore, handleCreateActivity, handleUpdateActivity, handleDeleteActivity } from "./slices/activitiesSlice";
import { usePackageStore, handleCreatePackage, handleUpdatePackage, handleDeletePackage } from "./slices/packagesSlice";
import { useDestinationsStore, handleCreateDestination, handleDeleteDestination, handleUpdateDestination } from "./slices/destinationsSlice";
import { useDiaryEntriesStore, handleCreateDiaryEntry, handleUpdateDiaryEntry, handleDeleteDiaryEntry } from "./slices/diaryEntriesSlice";
import {
  useItinerariesStore, handleCreateItinerary, handleUpdateItinerary,
  handleDeleteItinerary, handleCreateItineraryActivity, handleUpdateItineraryActivity, handleDeleteItineraryActivity

} from "./slices/itinerariesSlice";

console.log("🔥 store.ts loaded — check new import resolution");


export const addOptimisticAndQueue = async (
  collection: CollectionType,
  entity: Entity,
  queueType: QueueType,
  destId?: string
) => {
  console.log("addOptimisticAndQueue called with:", { collection, entity, queueType, destId });
  // Determine if this is a CREATE operation
  const isCreate = queueType.startsWith("CREATE");
  const tempId = isCreate ? `temp-${crypto.randomUUID()}` : entity.id!;
  const optimisticEntity = { ...entity, id: tempId };

  const activitiesStore = useActivitiesStore.getState();
  const packageStore = usePackageStore.getState();
  const itinerariesStore = useItinerariesStore.getState();
  const destinationStore = useDestinationsStore.getState();
  const diaryEntriesStore = useDiaryEntriesStore.getState();
  const store = useStore.getState();


  const collectionHandlers: Record<CollectionType, (id: string | undefined, entity: Entity) => void> = {
    [CollectionTypes.Activities]: (id, entity) =>
      activitiesStore.addActivity(id!, entity as Activity),

    [CollectionTypes.DiaryEntries]: (_id, entity) =>
      diaryEntriesStore.addDiaryEntry(entity as DiaryEntry),

    [CollectionTypes.Packages]: (id, entity) =>
      packageStore.addPackage(id!, entity as Package),

    [CollectionTypes.UserTrips]: (_, entity) =>
      store.addUserTrip(entity as UserTrip),

    [CollectionTypes.Destinations]: (_, entity) =>
      destinationStore.addDestination(entity as Destination),

    [CollectionTypes.Itineraries]: (id, entity) =>
      itinerariesStore.addItinerary(id!, entity as Itinerary),

    [CollectionTypes.ItineraryActivities]: (id, entity) =>
      itinerariesStore.addItineraryActivity(id!, entity as ItineraryActivity),

    [CollectionTypes.ItineraryActivitiesBatch]: (id: string | undefined, entity: Entity) => {
      // No store update needed for batch yet
      console.log("ItineraryActivitiesBatch received:", { id, entity });
    },
  };

  // Only mutate local state if it's a CREATE
  if (isCreate) {
    collectionHandlers[collection](destId, optimisticEntity);
  }

  store.addQueuedAction({
    id: crypto.randomUUID(),
    type: queueType,
    payload: optimisticEntity,
    tempId,
  });

  if (!store.ui.offline) {
    console.log("Calling processQueue…");
    await processQueue();
  }

  return tempId;
};

interface AppState {
  //destinations: Destination[];

  userTrips: UserTrip[];
  ui: { offline: boolean };
  queue: QueuedAction[];

  setUserTrips: (trips: UserTrip[]) => void;
  addUserTrip: (trip: UserTrip) => void;
  updateUserTrip: (tripId: string, updates: Partial<UserTrip>) => void;
  removeUserTrip: (tripId: string) => void;
  replaceUserTrip: (tempId: string, saved: UserTrip) => void;

  // Queue
  addQueuedAction: (action: QueuedAction) => void;
  removeQueuedAction: (id: string) => void;

  hydrate: () => Promise<void>;
}

// This creates a Zustand store using the create() function, 
// and wraps it with the persist() middleware. 
// The result is a hook called useStore that you can use throughout your app to read and update state.
// hooks/useZustandArray.ts

// THE AI EVEN WENT AS FAR AS SUGGESTING THIS - LETS LOOK INTO THIS INABIT
// import { useMemo } from "react";

// export function useZustandArray<T>(slice: T | Record<string, T> | undefined): T[] {
//   return useMemo(() => {
//     if (!slice) return [];
//     if (Array.isArray(slice)) return slice;
//     return Object.values(slice);
//   }, [slice]);
// }


export const useStore = create<AppState>()(

  //This wraps your store logic with persistence. It takes two arguments:
  persist(
    (set) => ({

      //initial state
      // Flat arrays
      queue: [],
      destinations: [],
      userTrips: [],

      // UI state
      ui: { offline: false },

      //state modification functions - mutators
      setUserTrips: (trips) => set({ userTrips: trips }),
      addUserTrip: (trip) =>
        set((state) => ({ userTrips: [...state.userTrips, trip] })),
      updateUserTrip: (tripId, updates) =>
        set((state) => ({
          userTrips: state.userTrips.map((t) =>
            t.id === tripId ? { ...t, ...updates } : t
          )
        })),

      // <--- Optimistic replacement
      replaceUserTrip: (tempId, saved) =>
        set((state) => ({
          userTrips: state.userTrips.map((t) => (t.id === tempId ? saved : t)),
        })),

      removeUserTrip: (tripId) =>
        set((state) => ({
          userTrips: state.userTrips.filter((t) => t.id !== tripId)
        })),


      addQueuedAction: (action) => set((state) => ({ queue: [...state.queue, action] })),
      removeQueuedAction: (id) => set((state) => ({ queue: state.queue.filter((a) => a.id !== id) })),

      //util to manually trigger rehydration if needed
      hydrate: async () => {
        // Zustand persist hydrates automatically
        // Kick off queue processing after rehydration
        // if (!get().ui.offline) {
        //   console.log("Online: flushing queue now…");
        //   await processQueue();
        // }else{
        //   console.log("Offline: leaving queue intact.");
        // }
        return Promise.resolve();
      }
    }),
    {
      name: "holiday-planner-store",
      //storage: createJSONStorage(() => localForage)
      storage: createJSONStorage(() => localStorage)
    }
  )

);

// Update offline state and process queue automatically
window.addEventListener("online", async () => {
  useStore.setState({ ui: { offline: false } });
  console.log("Offline status:", useStore.getState().ui.offline);
  //Optional: debounce processQueue if many online events fire at once.
  await processQueue(); // flush queued actions automatically
});

window.addEventListener("offline", () => {
  useStore.setState({ ui: { offline: true } });
  console.log("Offline status:", useStore.getState().ui.offline);

});

export const handleCreateUserTrip = async (action: QueuedAction) => {
  const { addUserTrip, replaceUserTrip } = useStore.getState();
  const trip = action.payload as UserTrip;

  console.log("📦 [Queue] Processing CREATE_USER_TRIP for:", trip.name);

  try {
    const { trip: saved, sasUrl } = await createUserTrip(trip);
    console.log("✅ [API] Trip created:", saved);
    console.log("🔗 [API] Received SAS URL:", sasUrl);

    // Replace optimistic trip if tempId exists, otherwise just add
    if (action.tempId) {
      console.log("🔄 [Store] Replacing optimistic trip with saved one");
      replaceUserTrip(action.tempId, saved);
    } else {
      console.log("➕ [Store] Adding new trip to store");
      addUserTrip(saved);
    }

    // Upload image if present
    if (sasUrl && "imageFile" in trip && trip.imageFile instanceof File) {
      console.log("📤 [Upload] Uploading trip image to Azure Blob...");
      await uploadToAzureBlob(trip.imageFile, sasUrl);
      console.log("✅ [Upload] Trip image upload complete");
    } else {
      console.log("⚠️ [Upload] No image file found or SAS URL missing");
    }
  } catch (error) {
    console.error("❌ [Queue] Failed to process CREATE_USER_TRIP:", error);
  }
};

export const handleUpdateUserTrip = async (action: QueuedAction) => {
  const { updateUserTrip } = useStore.getState();
  const trip = action.payload as UserTrip;

  console.log("📦 [Queue] Processing UPDATE_USER_TRIP for:", trip.name);

  try {
    const { sasUrl, imageUrl } = await editUserTrip(trip.id!, trip);

    // Optimistic update first
    updateUserTrip(trip.id!, {
      ...trip,
      imageUrl: imageUrl ?? trip.imageUrl,
    });

    if (sasUrl && trip.imageFile instanceof File) {
      console.log("📤 [Upload] Uploading trip image to Azure Blob...");
      await uploadToAzureBlob(trip.imageFile, sasUrl);
      console.log("✅ [Upload] Trip image upload complete");

      if (imageUrl) {
        const cacheBustedUrl = `${imageUrl}?t=${Date.now()}`;
        updateUserTrip(trip.id!, {
          imageFile: undefined,
          hasImage: true,
          imageUrl: cacheBustedUrl,
        });
        console.log("🔄 [Store] Trip image updated to:", cacheBustedUrl);
      }
    } else {
      console.log("⚠️ [Upload] No image file found or SAS URL missing");
    }
  } catch (error) {
    console.error("❌ [Queue] Failed to process UPDATE_USER_TRIP:", error);
  }
};
// const handleUpdateUserTrip = async (action: QueuedAction) => {
//   const { updateUserTrip } = useStore.getState();
//   const trip = action.payload as UserTrip;
//   if (!trip.id) throw new Error("Cannot update UserTrip: missing ID");

//   await editUserTrip(trip.id, trip);
//   updateUserTrip(trip.id, trip);
// };

const handleDeleteUserTrip = async (action: QueuedAction) => {
  const { removeUserTrip } = useStore.getState();
  const trip = action.payload as UserTrip;
  if (!trip.id) throw new Error("Cannot delete UserTrip: missing ID");

  await deleteUserTrip(trip.id);
  removeUserTrip(trip.id);
};


const queueHandlers: Record<QueueType, (action: QueuedAction) => Promise<void>> = {
  [QueueTypes.CREATE_ACTIVITY]: handleCreateActivity,
  [QueueTypes.UPDATE_ACTIVITY]: handleUpdateActivity,
  [QueueTypes.DELETE_ACTIVITY]: handleDeleteActivity,

  // Packages
  [QueueTypes.CREATE_PACKAGE]: handleCreatePackage,
  [QueueTypes.UPDATE_PACKAGE]: handleUpdatePackage,
  [QueueTypes.DELETE_PACKAGE]: handleDeletePackage,

  [QueueTypes.CREATE_USER_TRIP]: handleCreateUserTrip,
  [QueueTypes.UPDATE_USER_TRIP]: handleUpdateUserTrip,
  [QueueTypes.DELETE_USER_TRIP]: handleDeleteUserTrip,

  [QueueTypes.CREATE_DESTINATION]: handleCreateDestination,
  [QueueTypes.UPDATE_DESTINATION]: handleUpdateDestination,
  [QueueTypes.DELETE_DESTINATION]: handleDeleteDestination,

  [QueueTypes.CREATE_DIARY_ENTRY]: handleCreateDiaryEntry,
  [QueueTypes.UPDATE_DIARY_ENTRY]: handleUpdateDiaryEntry,
  [QueueTypes.DELETE_DIARY_ENTRY]: handleDeleteDiaryEntry,

  // // Itineraries
  [QueueTypes.CREATE_ITINERARY]: handleCreateItinerary,
  [QueueTypes.UPDATE_ITINERARY]: handleUpdateItinerary,
  [QueueTypes.DELETE_ITINERARY]: handleDeleteItinerary,

  [QueueTypes.CREATE_ITINERARY_ACTIVITY]: handleCreateItineraryActivity,
  [QueueTypes.UPDATE_ITINERARY_ACTIVITY]: handleUpdateItineraryActivity,
  [QueueTypes.DELETE_ITINERARY_ACTIVITY]: handleDeleteItineraryActivity,
  [QueueTypes.BATCH_UPDATE_ITINERARY_ACTIVITIES]: async (action: QueuedAction) => {
    const batch = action.payload as ItineraryActivitiesBatch;
    console.log("Processing batch update:", batch);
    // Call API endpoint here
    const updatedActivities = await updateItineraryActivitiesBatch(batch);
    console.log("Updated activities:", updatedActivities);

  },

  // ...others
};

export const processQueue = async () => {
  console.log("Processing queue…");
  const { queue } = useStore.getState();
  const { removeQueuedAction } = useStore.getState();
  console.log("Handling queue, ", queue.length, "actions pending");
  for (const action of queue) {
    try {
      console.log("Handling queue type:", action.type);
      const handler = queueHandlers[action.type];
      if (!handler) {
        console.warn("Unhandled queue type:", action.type);
        console.warn("🔥 QueueHandler missing for type:", action.type);
        continue;
      }
      await handler(action);
      removeQueuedAction(action.id);
    } catch (err) {
      console.error("Queue action failed:", action, err);
      // optional: keep in queue, add retry metadata 
      removeQueuedAction(action.id);

    }
  }
};

// Note: In a real app, you’d want to add more error handling, logging, and possibly retry logic.
// 🚀 What You Could Add Next
// Retry Metadata: Add a retryCount or lastAttempt to each QueuedAction for smarter reprocessing.
// Queue Persistence: Store the queue in localStorage or IndexedDB so it survives page reloads.
// Conflict Resolution: Detect if a resource was modified externally before applying updates.
// Queue Visualizer: Build a debug panel to inspect pending actions, their types, and timestamps.

// If you ever decide to open this up to third-party integrations—like syncing
// with Google Calendar, pulling flight data,
// or embedding booking widgets—you’re already halfway there.