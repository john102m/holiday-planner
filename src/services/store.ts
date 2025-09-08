import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { updateItineraryActivitiesBatch } from "./apis/itinerariesApi"
import type {
  Destination, Activity, Package,
  Itinerary, ActivityComment, UserTrip,
  QueueType, CollectionType, QueuedAction,
  ItineraryActivity, ItineraryActivitiesBatch
} from "./types";
import { CollectionTypes, QueueTypes } from "./types";

import { useActivitiesStore, handleCreateActivity, handleUpdateActivity, handleDeleteActivity } from "./slices/activitiesSlice";
import { usePackageStore, handleCreatePackage, handleUpdatePackage, handleDeletePackage } from "./slices/packagesSlice";
import {
  useItinerariesStore, handleCreateItinerary, handleUpdateItinerary,
  handleDeleteItinerary, handleCreateItineraryActivity, handleUpdateItineraryActivity, handleDeleteItineraryActivity

} from "./slices/itinerariesSlice";
type Entity = Activity | Package | Destination | Itinerary | ActivityComment | ItineraryActivity | ItineraryActivitiesBatch;
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
  const store = useStore.getState();


  const collectionHandlers: Record<CollectionType, (id: string | undefined, entity: Entity) => void> = {
    [CollectionTypes.Activities]: (id, entity) =>
      activitiesStore.addActivity(id!, entity as Activity),
    [CollectionTypes.Comments]: (id, entity) =>
      activitiesStore.addComment(id!, entity as ActivityComment),

    [CollectionTypes.Packages]: (id, entity) =>
      packageStore.addPackage(id!, entity as Package),

    [CollectionTypes.Destinations]: (_, entity) =>
      store.addDestination(entity as Destination),

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
  destinations: Destination[];
  packages: Record<string, Package[]>;
  userTrips: UserTrip[];
  ui: { offline: boolean };
  queue: QueuedAction[];

  setUserTrips: (trips: UserTrip[]) => void;
  addUserTrip: (trip: UserTrip) => void;
  updateUserTrip: (tripId: string, updates: Partial<UserTrip>) => void;
  removeUserTrip: (tripId: string) => void;

  setDestinations: (dest: Destination[]) => void;
  addDestination: (dest: Destination) => void;

  // Queue
  addQueuedAction: (action: QueuedAction) => void;
  removeQueuedAction: (id: string) => void;

  hydrate: () => Promise<void>;
}

// This creates a Zustand store using the create() function, 
// and wraps it with the persist() middleware. 
// The result is a hook called useStore that you can use throughout your app to read and update state.

export const useStore = create<AppState>()(

  //This wraps your store logic with persistence. It takes two arguments:
  persist(
    (set) => ({

      //initial state
      // Flat arrays
      queue: [],
      destinations: [],
      userTrips: [],
      // Grouped by destinationId
      packages: {},

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
      removeUserTrip: (tripId) =>
        set((state) => ({
          userTrips: state.userTrips.filter((t) => t.id !== tripId)
        })),

      setDestinations: (dest) => set({ destinations: dest }),
      addDestination: (dest) => set((state) => ({ destinations: [...state.destinations, dest] })),


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


const queueHandlers: Record<QueueType, (action: QueuedAction) => Promise<void>> = {
  [QueueTypes.CREATE_ACTIVITY]: handleCreateActivity,
  [QueueTypes.UPDATE_ACTIVITY]: handleUpdateActivity,
  [QueueTypes.DELETE_ACTIVITY]: handleDeleteActivity,

  // Packages
  [QueueTypes.CREATE_PACKAGE]: handleCreatePackage,
  [QueueTypes.UPDATE_PACKAGE]: handleUpdatePackage,
  [QueueTypes.DELETE_PACKAGE]: handleDeletePackage,

  // Comments
  // [QueueTypes.CREATE_COMMENT]: handleCreateComment,
  // [QueueTypes.UPDATE_COMMENT]: handleUpdateComment,
  // [QueueTypes.DELETE_COMMENT]: handleDeleteComment,

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
