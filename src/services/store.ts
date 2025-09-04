import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
//import localForage from "localforage";
import type { Destination, Activity, Package, Itinerary, ActivityComment, UserTrip } from "./types";
import { createActivity, editActivity, deleteActivity } from "./api";


type Entity = Activity | Destination | Itinerary | ActivityComment;

export const CollectionTypes = {
  Activities: "activities",
  Destinations: "destinations",
  Itineraries: "itineraries",
  Comments: "comments"
} as const;
export type CollectionType = typeof CollectionTypes[keyof typeof CollectionTypes];

export const QueueTypes = {
  CREATE_ACTIVITY: "CREATE_ACTIVITY",
  UPDATE_ACTIVITY: "UPDATE_ACTIVITY",
  DELETE_ACTIVITY: "DELETE_ACTIVITY",

  CREATE_ITINERARY: "CREATE_ITINERARY",
  UPDATE_ITINERARY: "UPDATE_ITINERARY",
  DELETE_ITINERARY: "DELETE_ITINERARY",

  CREATE_DESTINATION: "CREATE_DESTINATION",
  UPDATE_DESTINATION: "UPDATE_DESTINATION",
  DELETE_DESTINATION: "DELETE_DESTINATION",

  CREATE_PACKAGE: "CREATE_PACKAGE",
  UPDATE_PACKAGE: "UPDATE_PACKAGE",
  DELETE_PACKAGE: "DELETE_PACKAGE",

  CREATE_COMMENT: "CREATE_COMMENT",
  UPDATE_COMMENT: "UPDATE_COMMENT",
  DELETE_COMMENT: "DELETE_COMMENT",


  VOTE: "VOTE"

  // Add more as needed
}
export type QueueType = typeof QueueTypes[keyof typeof QueueTypes];



//NEXT STEPS - Refactor to use a map of handlers instead of switch/case
// This is a mapping of queue types to their corresponding store operation handlers.
// Each handler takes the store, collection type, entity, and optional metadata (like destinationId or activityId) as arguments.
// When processing the queue, you can look up the appropriate handler based on the action type and invoke it directly,
// eliminating the need for a switch/case statement.
// This approach makes it easier to add new queue types and their handlers in the future without modifying a central switch statement.
// Use optimistic creation and pessimistic updates/deletes for better UX.

// const storeOperationHandlers: Record<QueueType, (store: AppState, collection: CollectionType, entity: Entity, meta?: string) => void> = {
//   [QueueTypes.CREATE_ACTIVITY]: (store, collection, entity, meta) => {
//     store.addActivity(meta!, entity as Activity);
//   },
//   [QueueTypes.UPDATE_ACTIVITY]: (store, collection, entity, meta) => {
//     store.replaceActivity(entity.id!, entity as Activity);
//   },
//   [QueueTypes.REMOVE_ACTIVITY]: (store, collection, entity, meta) => {
//     store.removeActivity(meta!, entity.id!);
//   },
//   // Add other entity types here...
// };



// export const queueEntityAction = async (
//   collection: CollectionType,
//   entity: Entity,
//   queueType: QueueType,
//   destOrActId?: string
// ) => {
//   const store = useStore.getState();

//   const tempId = entity.id ?? `temp-${crypto.randomUUID()}`;
//   const optimisticEntity = { ...entity, id: tempId };

//   // Only apply optimistic update for CREATE
//   if (queueType.toLowerCase().startsWith("create")) {
//     const collectionHandlers: Record<CollectionType, (id: string | undefined, entity: Entity) => void> = {
//       [CollectionTypes.Activities]: (id, entity) =>
//         store.addActivity(id!, entity as Activity),
//       [CollectionTypes.Destinations]: (_, entity) =>
//         store.addDestination(entity as Destination),
//       [CollectionTypes.Itineraries]: (id, entity) =>
//         store.addItinerary(id!, entity as Itinerary),
//       [CollectionTypes.Comments]: (id, entity) =>
//         store.addComment(id!, entity as ActivityComment),
//     };

//     collectionHandlers[collection](destOrActId, optimisticEntity);
//   }

//   store.addQueuedAction({
//     id: crypto.randomUUID(),
//     type: queueType,
//     payload: optimisticEntity,
//     tempId,
//     meta: destOrActId,
//   });

//   if (!store.ui.offline) {
//     await processQueue();
//   }

//   return tempId;
// };


// Simple queued action with unknown payload
interface QueuedAction {
  id: string;
  type: QueueType;
  payload: unknown;
  tempId?: string;
}

export const addOptimisticAndQueue = async (
  collection: CollectionType,
  entity: Entity,
  queueType: QueueType,
  destId?: string
) => {
  const isCreate = queueType.startsWith("CREATE");
  const tempId = isCreate ? `temp-${crypto.randomUUID()}` : entity.id!;
  const optimisticEntity = { ...entity, id: tempId };

  const store = useStore.getState();

  const collectionHandlers: Record<CollectionType, (id: string | undefined, entity: Entity) => void> = {
    [CollectionTypes.Activities]: (id, entity) =>
      store.addActivity(id!, entity as Activity),
    [CollectionTypes.Destinations]: (_, entity) =>
      store.addDestination(entity as Destination),
    [CollectionTypes.Itineraries]: (id, entity) =>
      store.addItinerary(id!, entity as Itinerary),
    [CollectionTypes.Comments]: (id, entity) =>
      store.addComment(id!, entity as ActivityComment),
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
    await processQueue();
  }

  return tempId;
};


interface AppState {
  destinations: Destination[];
  packages: Record<string, Package[]>;
  itineraries: Record<string, Itinerary[]>;
  activities: Record<string, Activity[]>;
  userTrips: UserTrip[];
  comments: Record<string, ActivityComment[]>;
  ui: { offline: boolean };
  queue: QueuedAction[];

  setUserTrips: (trips: UserTrip[]) => void;
  addUserTrip: (trip: UserTrip) => void;
  updateUserTrip: (tripId: string, updates: Partial<UserTrip>) => void;
  removeUserTrip: (tripId: string) => void;

  setDestinations: (dest: Destination[]) => void;
  addDestination: (dest: Destination) => void;

  setPackages: (destId: string, pkgs: Package[]) => void;
  addPackage: (destId: string, pkg: Package) => void;
  removePackage: (destId: string, packageId: string) => void;

  setItineraries: (destId: string, its: Itinerary[]) => void;
  addItinerary: (destId: string, it: Itinerary) => void;
  removeItinerary: (destId: string, itineraryId: string) => void;

  setActivities: (destId: string, acts: Activity[]) => void;
  addActivity: (destId: string, act: Activity) => void;
  updateActivity: (destId: string, updated: Activity) => void;
  replaceActivity: (tempId: string, saved: Activity) => void;
  removeActivity: (destId: string, activityId: string) => void;
  getSavedActivities: () => Activity[];

  setComments: (activityId: string, comms: ActivityComment[]) => void;
  addComment: (activityId: string, comm: ActivityComment) => void;

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
    (set, get) => ({

      //initial state
      destinations: [],
      packages: {},
      itineraries: {},
      activities: {},
      userTrips: [],
      comments: {},
      ui: { offline: false },
      queue: [],

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
      addDestination: (dest) =>
        set((state) => ({ destinations: [...state.destinations, dest] })),

      setPackages: (destId, pkgs) =>
        set((state) => ({
          packages: { ...state.packages, [destId]: pkgs }
        })),
      addPackage: (destId, pkg) =>
        set((state) => ({
          packages: {
            ...state.packages,
            [destId]: [...(state.packages[destId] || []), pkg]
          }
        })),
      removePackage: (destId, packageId) =>
        set((state) => ({
          packages: {
            ...state.packages,
            [destId]: state.packages[destId]?.filter((p) => p.id !== packageId)
          }
        })),

      setItineraries: (destId, its) =>
        set((state) => ({
          itineraries: { ...state.itineraries, [destId]: its }
        })),
      addItinerary: (destId, it) =>
        set((state) => ({
          itineraries: {
            ...state.itineraries,
            [destId]: [...(state.itineraries[destId] || []), it]
          }
        })),
      removeItinerary: (destId, itineraryId) =>
        set((state) => ({
          itineraries: {
            ...state.itineraries,
            [destId]: state.itineraries[destId]?.filter(
              (i) => i.id !== itineraryId
            )
          }
        })),

      setActivities: (destId, acts) =>
        set((state) => ({
          activities: { ...state.activities, [destId]: acts }
        })),
      addActivity: (destId, act) =>
        set((state) => ({
          activities: {
            ...state.activities,
            [destId]: [...(state.activities[destId] || []), act]
          }
        })),
      updateActivity: (destId: string, updated: Activity) =>
        set((state) => {
          const existing = state.activities[destId] || [];
          const updatedList = existing.map((act) =>
            act.id === updated.id ? updated : act
          );

          return {
            activities: {
              ...state.activities,
              [destId]: updatedList
            }
          };
        }),

      replaceActivity: (tempId, saved) =>
        set((state) => {
          // reduce() is a higher-order function, not recursion.
          // map() is also iterative — it loops through arrays and returns a new one.
          const updated = Object.entries(state.activities).reduce(
            (acc, [destId, acts]) => {
              const newActs = acts.map((a) =>
                a.id === tempId ? saved : a
              );
              acc[destId] = newActs;
              return acc;
            },
            {} as Record<string, Activity[]>
          );
          return { activities: updated };
        }),
      removeActivity: (destId, activityId) =>
        set((state) => ({
          activities: {
            ...state.activities,
            [destId]: state.activities[destId]?.filter(
              (a) => a.id !== activityId
            )
          }
        })),
      getSavedActivities: () => {
        const state = get();
        return Object.values(state.activities).flat();
      },

      setComments: (activityId, comms) =>
        set((state) => ({
          comments: { ...state.comments, [activityId]: comms }
        })),
      addComment: (activityId, comm) =>
        set((state) => ({
          comments: {
            ...state.comments,
            [activityId]: [...(state.comments[activityId] || []), comm]
          }
        })),

      //queue management logic
      addQueuedAction: (action) =>
        set((state) => ({ queue: [...state.queue, action] })),

      removeQueuedAction: (id) =>
        set((state) => ({
          queue: state.queue.filter((a) => a.id !== id)
        })),

      //util to manually trigger rehydration if needed
      hydrate: async () => {
        // Zustand persist hydrates automatically
        // Kick off queue processing after rehydration
        if (!get().ui.offline) {
          await processQueue();
        }
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

  await processQueue(); // flush queued actions automatically
});

window.addEventListener("offline", () => {
  useStore.setState({ ui: { offline: true } });
  console.log("Offline status:", useStore.getState().ui.offline);

});


// This is a queue processor. It’s designed to:
// Grab the current list of queued actions from your Zustand store.
// Loop through each action.
// Try to process it (e.g. send it to an API like createActivity).
// If successful, remove it from the queue.
// If it fails, log the error and keep it in the queue for retry later.
const handleCreateActivity = async (action: QueuedAction) => {
  const { replaceActivity, addActivity } = useStore.getState();
  const act = action.payload as Activity;
  const saved = await createActivity(act);

  // When action.tempId is truthy, it means: “This activity was created optimistically and needs to be swapped out with the real one.”
  if (action.tempId) {
    replaceActivity(action.tempId, saved);
  } else {
    addActivity(saved.destinationId!, saved);
  }
};

const handleUpdateActivity = async (action: QueuedAction) => {
  const { updateActivity } = useStore.getState();
  const act = action.payload as Activity;

  //persist the change to backend
  if (!act.id) {
    throw new Error("Cannot update activity: missing activity ID");
  }
  await editActivity(act.id, act);

  //mutate the store with the queued version
  updateActivity(act.destinationId, act);

};

const handleDeleteActivity = async (action: QueuedAction) => {
  const { removeActivity } = useStore.getState();
  const act = action.payload as Activity;

  //persist the change to backend
  if (!act.id) {
    throw new Error("Cannot delete activity: missing activity ID");
  }
  await deleteActivity(act.id);

  //mutate the store
  removeActivity(act.destinationId, act.id);

};


const queueHandlers: Record<QueueType, (action: QueuedAction) => Promise<void>> = {
  [QueueTypes.CREATE_ACTIVITY]: handleCreateActivity,
  [QueueTypes.UPDATE_ACTIVITY]: handleUpdateActivity,
  [QueueTypes.DELETE_ACTIVITY]: handleDeleteActivity,
  // ...others
};


export const processQueue = async () => {
  const { queue, removeQueuedAction } = useStore.getState();

  for (const action of queue) {
    try {
      const handler = queueHandlers[action.type];
      if (!handler) {
        console.warn("Unhandled queue type:", action.type);
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


// export const processQueue = async () => {
//   const { queue, removeQueuedAction } = useStore.getState();

//   for (const action of queue) {
//     try {
//       switch (action.type) {
//         case QueueTypes.CREATE_ACTIVITY:
//           console.log("Processing CREATE_ACTIVITY", action);
//           await handleCreateActivity(action);
//           break;
//         case QueueTypes.UPDATE_ACTIVITY:
//           console.log("Processing UPDATE_ACTIVITY", action);
//           await handleUpdateActivity(action);
//           break;
//         case QueueTypes.DELETE_ACTIVITY:
//           console.log("Processing DELETE_ACTIVITY", action);
//           await handleDeleteActivity(action);
//           break;
//         // Add other cases here...

//         default:
//           console.warn("Unhandled queue type:", action.type);
//       }

//       removeQueuedAction(action.id);
//     } catch (err) {
//       console.error("Failed to process queued action", action, err);
//       removeQueuedAction(action.id);
//     }
//   }
// };

// 🔧 Optional Enhancements
// If you're looking to refine further:
// Add retry logic for failed actions (e.g. exponential backoff).
// Persist the queue to local storage so it survives page reloads.
// Add timestamps to queued actions for debugging or timeout logic.
// Support DELETE or other types with similar handler patterns.


//Use a simple hook to detect online status:
// const useNetworkStatus = () => {
//   const [online, setOnline] = useState(navigator.onLine);
//   useEffect(() => {
//     const update = () => setOnline(navigator.onLine);
//     window.addEventListener("online", update);
//     window.addEventListener("offline", update);
//     return () => {
//       window.removeEventListener("online", update);
//       window.removeEventListener("offline", update);
//     };
//   }, []);
//   return online;
// };


// ✅ Why This Is Sound
// Simple state shape: No over-engineering.
// Queue-based sync: Easy to reason about and retry.
// Local-first UX: Instant feedback, no spinner purgatory.
// Extensible: You can later add conflict resolution, timestamps, or versioning.

