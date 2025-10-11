import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { updateItineraryActivitiesBatch } from "./apis/itinerariesApi"
import { uploadToAzureBlob } from "./storeUtils";
import type { BaseSliceState } from "../components/common/useErrorHandler";
import { handleQueueError } from "../components/common/useErrorHandler";
import {
  createUserTrip, editUserTrip, deleteUserTrip
} from "./apis/api";
import type {
  Entity, Destination, Activity, Package,
  Itinerary, UserTrip,
  QueueType, CollectionType, QueuedAction,
  ItineraryActivity, ItineraryActivitiesBatch,
  DiaryEntry, TripInfo
} from "./types";
import { CollectionTypes, QueueTypes } from "./types";

import { useActivitiesStore, handleCreateActivity, handleUpdateActivity, handleDeleteActivity } from "./slices/activitiesSlice";
import { usePackageStore, handleCreatePackage, handleUpdatePackage, handleDeletePackage } from "./slices/packagesSlice";
import { useDestinationsStore, handleCreateDestination, handleDeleteDestination, handleUpdateDestination } from "./slices/destinationsSlice";
import { useDiaryEntriesStore, handleCreateDiaryEntry, handleUpdateDiaryEntry, handleDeleteDiaryEntry } from "./slices/diaryEntriesSlice";
import { useTripInfoStore, handleCreateTripInfo, handleUpdateTripInfo, handleDeleteTripInfo } from "./slices/tripInfoSlice";
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
  const tripInfoStore = useTripInfoStore.getState();
  const store = useStore.getState();

  // 🔁 Recap of the Flow
  // User drops a new image → You generate a preview blob and compress the file.
  // Optimistic update is applied to the store → You call updateDiaryEntry() with the blob, file, and isPendingUpload: true.
  // UI re-renders with the blob → useImageBlobSrc() picks up the blob and shows it immediately.
  // Queue processes the update → Backend returns SAS URL, image is uploaded, final image URL is injected.
  // Blob is revoked after swap → UI transitions seamlessly to the final image.
  const collectionHandlers: Record<CollectionType, (id: string | undefined, entity: Entity) => void> = {
    [CollectionTypes.Activities]: (id, entity) =>
      activitiesStore.addActivity(id!, entity as Activity),

    //  [CollectionTypes.DiaryEntries]: (_id, entity) =>
    //    diaryEntriesStore.addDiaryEntry(entity as DiaryEntry),

    [CollectionTypes.DiaryEntries]: (_id, entity) => {
      const diaryEntry = entity as DiaryEntry;
      if (diaryEntry.id?.startsWith("temp-")) {
        diaryEntriesStore.addDiaryEntry(diaryEntry); // treat as optimistic create
      } else {
        diaryEntriesStore.updateDiaryEntry(diaryEntry); // treat as confirmed update
      }
    },
    [CollectionTypes.TripInfo]: (_, entity) => {
      const tripInfo = entity as TripInfo;
      if (!tripInfo.tripId) {
        console.warn("⚠️ TripInfo is missing tripId:", tripInfo);
        return;
      }
      tripInfoStore.addTripInfo(tripInfo.tripId, tripInfo);
    },


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
  // if (isCreate) {
  //   collectionHandlers[collection](destId, optimisticEntity);
  // }

  if (isCreate || collection === CollectionTypes.DiaryEntries) {
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

interface AppState extends BaseSliceState {
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
  // doing this manually because this slice is not wrapped in Persist
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

      // error handling
      errorMessage: null,
      setError: (msg) => set({ errorMessage: msg }),

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
  const { addUserTrip, replaceUserTrip, updateUserTrip } = useStore.getState();
  const trip = action.payload as UserTrip;

  console.log("📦 [Queue] Processing CREATE_USER_TRIP for:", trip.name);

  try {
    // Step 1: create trip on server
    const { trip: saved, sasUrl } = await createUserTrip(trip);
    console.log("✅ [API] Trip created:", saved);
    console.log("🔗 [API] Received SAS URL:", sasUrl);

    // Step 2: merge optimistic fields (preview + pending state)
    const merged: UserTrip = {
      ...saved,
      previewBlobUrl: trip.previewBlobUrl,   // keep local preview visible
      isPendingUpload: !!trip.imageFile,     // spinner if uploading
      imageFile: trip.imageFile,             // file to upload
      imageUrl: trip.imageUrl,               // may be undefined initially
    };

    // Step 3: replace optimistic trip or add new one
    if (action.tempId) {
      console.log("🔄 [Store] Replacing optimistic trip with saved one");
      replaceUserTrip(action.tempId, merged);
    } else {
      console.log("➕ [Store] Adding new trip to store");
      addUserTrip(merged);
    }

    // Step 4: upload image if present
    if (sasUrl && trip.imageFile instanceof File) {
      console.log("📤 [Upload] Uploading trip image to Azure Blob...");
      await uploadToAzureBlob(trip.imageFile, sasUrl);
      console.log("✅ [Upload] Trip image upload complete");

      // Step 5: finalize trip after upload
      const finalized: UserTrip = {
        ...saved,
        imageUrl: `${saved.imageUrl}?t=${Date.now()}`, // cache-bust to force refresh
        previewBlobUrl: undefined,   // clear temporary blob
        imageFile: undefined,        // clear file
        isPendingUpload: false,      // 🔑 spinner hidden
        hasImage: true,              // mark as having an image
      };

      // Important: use the *saved.id* (server id), not the optimistic one
      updateUserTrip(saved.id!, finalized);
      console.log("🔄 [Store] Trip image updated to:", finalized.imageUrl);
    } else {
      console.log("⚠️ [Upload] No image file found or SAS URL missing");
    }
  } catch (error: unknown) {
    handleQueueError(useStore.getState(), error);
  }
};


export const handleUpdateUserTrip = async (action: QueuedAction) => {
  const { updateUserTrip } = useStore.getState();
  const trip = action.payload as UserTrip;

  console.log("📦 [Queue] Processing UPDATE_USER_TRIP for:", trip.name);

  try {
    // Optimistic update with preview + pending state
    updateUserTrip(trip.id!, {
      ...trip,
      previewBlobUrl: trip.previewBlobUrl,
      isPendingUpload: !!trip.imageFile,
      imageUrl: trip.imageFile ? "" : trip.imageUrl,
    });

    const { sasUrl, imageUrl: backendImageUrl } = await editUserTrip(trip.id!, trip);
    console.log("✅ [API] Trip updated");
    console.log("🔗 [API] Received SAS URL:", sasUrl);

    if (sasUrl && trip.imageFile instanceof File) {
      console.log("📤 [Upload] Uploading trip image to Azure Blob...");
      await uploadToAzureBlob(trip.imageFile, sasUrl);
      console.log("✅ [Upload] Trip image upload complete");

      updateUserTrip(trip.id!, {
        ...trip,
        imageFile: undefined,
        previewBlobUrl: undefined,
        isPendingUpload: false,
        hasImage: true,
        imageUrl: `${backendImageUrl}?t=${Date.now()}`, // cache-busted
      });
      console.log("🔄 [Store] Trip image updated to:", backendImageUrl);
    } else {
      console.log("⚠️ [Upload] No image file found or SAS URL missing");
    }
  } catch (error: unknown) {
    handleQueueError(useStore.getState(), error);
  }
};

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

  [QueueTypes.CREATE_TRIP_INFO]: handleCreateTripInfo,
  [QueueTypes.UPDATE_TRIP_INFO]: handleUpdateTripInfo,
  [QueueTypes.DELETE_TRIP_INFO]: handleDeleteTripInfo,

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
// TODO
// Retry logic with exponential backoff
// Persistent queue across sessions
// Telemetry for queue throughput and failure rates


// Note: In a real app, you’d want to add more error handling, logging, and possibly retry logic.
// 🚀 What You Could Add Next
// Retry Metadata: Add a retryCount or lastAttempt to each QueuedAction for smarter reprocessing.
// Queue Persistence: Store the queue in localStorage or IndexedDB so it survives page reloads.
// Conflict Resolution: Detect if a resource was modified externally before applying updates.
// Queue Visualizer: Build a debug panel to inspect pending actions, their types, and timestamps.

// If you ever decide to open this up to third-party integrations—like syncing
// with Google Calendar, pulling flight data,
// or embedding booking widgets—you’re already halfway there.