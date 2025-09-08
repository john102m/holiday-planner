import { create } from "zustand";
import localforage from "localforage";
import type { Destination, Activity, Package, Itinerary, ActivityComment, UserTrip } from "./types";
import { createActivity } from "./apis/activitiesApi";

type Entity = Activity | Destination | Itinerary | ActivityComment;
type CollectionKey = "activities" | "destinations" | "itineraries" | "comments";
//export type QueueType = "CREATE_ACTIVITY" | "VOTE" | "COMMENT" | "CREATE_DESTINATION" | "DELETE_ACTIVITY";
export const QueueTypes = {
  CREATE_ACTIVITY : "CREATE_ACTIVITY",
  UPDATE_ACTIVITY : "UPDATE_ACTIVITY",
  VOTE : "VOTE",
  COMMENT : "COMMENT",
  CREATE_DESTINATION : "CREATE_DESTINATION",
  DELETE_ACTIVITY : "DELETE_ACTIVITY",

}
export type QueueType = typeof QueueTypes[keyof typeof QueueTypes];

// Simple queued action with unknown payload
interface QueuedAction {
  id: string;
  type: QueueType;
  payload: unknown;
  tempId?: string;
}

export const addOptimisticAndQueue = async (
  collection: CollectionKey,
  entity: Entity,
  queueType: QueueType,
  destOrActId?: string
) => {
  const tempId = entity.id ?? `temp-${crypto.randomUUID()}`;
  const optimisticEntity = { ...entity, id: tempId };

  // Add to store
  if (collection === "activities") {
    useStore.getState().addActivity(destOrActId!, optimisticEntity as Activity);
  } else if (collection === "destinations") {
    useStore.getState().addDestination(optimisticEntity as Destination);
  } else if (collection === "itineraries") {
    useStore.getState().addItinerary(destOrActId!, optimisticEntity as Itinerary);
  } else if (collection === "comments") {
    useStore.getState().addComment(destOrActId!, optimisticEntity as ActivityComment);
  }

  // Queue API call (payload as unknown, cast in handler)
  useStore.getState().addQueuedAction({
    id: crypto.randomUUID(),
    type: queueType,
    payload: optimisticEntity,
    tempId
  });

  // Flush immediately if online
  if (!useStore.getState().ui.offline) {
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
  replaceActivity: (tempId: string, saved: Activity) => void;
  removeActivity: (destId: string, activityId: string) => void;
  getSavedActivities: () => Activity[];

  setComments: (activityId: string, comms: ActivityComment[]) => void;
  addComment: (activityId: string, comm: ActivityComment) => void;

  addQueuedAction: (action: QueuedAction) => void;
  hydrate: () => Promise<void>;
}

// localForage setup
const storage = localforage.createInstance({ name: "holiday-planner" });

export const useStore = create<AppState>((set, get) => ({
  destinations: [],
  packages: {},
  itineraries: {},
  activities: {},
  comments: {},
  userTrips: [],
  ui: { offline: !navigator.onLine },
  queue: [],

  setUserTrips: (trips) => {
    set({ userTrips: trips });
    storage.setItem("userTrips", trips);
  },

  addUserTrip: (trip) => {
    set((state) => {
      const updated = [...state.userTrips, trip];
      // 1️⃣ Update the in-memory Zustand store so any subscribed components see the new data immediately.

      storage.setItem("userTrips", updated);
      // 2️⃣ Persist the updated array to localForage (IndexedDB), so the data survives reloads or offline periods.

      return { userTrips: updated };
      // 3️⃣ Return the new state to Zustand to finalize the update.
    });
  },

  updateUserTrip: (tripId, updates) => {
    set((state) => {
      const updated = state.userTrips.map((t) =>
        t.id === tripId ? { ...t, ...updates } : t
      );
      storage.setItem("userTrips", updated);
      return { userTrips: updated };
    });
  },

  removeUserTrip: (tripId) => {
    set((state) => {
      const updated = state.userTrips.filter((t) => t.id !== tripId);
      storage.setItem("userTrips", updated);
      return { userTrips: updated };
    });
  },

  setDestinations: (dest) => {
    set({ destinations: dest }); // Updates Zustand in-memory store
    storage.setItem("destinations", dest); // Saves to localForage for persistence
  },

  addDestination: (dest) => {
    set((state) => {
      const updated = [...state.destinations, dest];
      storage.setItem("destinations", updated);
      return { destinations: updated };
    });
  },

  setPackages: (destId, pkgs) => {
    set((state) => {
      const updated = { ...state.packages, [destId]: pkgs };
      storage.setItem("packages", updated);
      return { packages: updated };
    });
  },
  addPackage: (destId, pkg) => {
    set((state) => {
      const updated = {
        ...state.packages,
        [destId]: [...(state.packages[destId] || []), pkg],
      };
      storage.setItem("packages", updated);
      return { packages: updated };
    });
  },
  removePackage: (destId: string, packageId: string) => {
    set((state) => {
      const updatedPackages = (state.packages[destId] || []).filter(p => p.id !== packageId);
      const newPackages = { ...state.packages, [destId]: updatedPackages };
      storage.setItem("packages", newPackages);
      return { packages: newPackages };
    });
  },

  setItineraries: (destId, its) => {
    set((state) => {
      const updated = { ...state.itineraries, [destId]: its };
      storage.setItem("itineraries", updated);
      return { itineraries: updated };
    });
  },
  addItinerary: (destId, it) => {
    set((state) => {
      const updated = {
        ...state.itineraries,
        [destId]: [...(state.itineraries[destId] || []), it],
      };
      storage.setItem("itineraries", updated);
      return { itineraries: updated };
    });
  },
  removeItinerary: (destId: string, itineraryId: string) => {
    set((state) => {
      const updatedItineraries = (state.itineraries[destId] || []).filter(p => p.id !== itineraryId);
      const newItineraries = { ...state.itineraries, [destId]: updatedItineraries };
      storage.setItem("itineraries", newItineraries);
      return { itineraries: newItineraries };
    });
  },
  setActivities: (destId, acts) => {
    set((state) => {
      const updated = { ...state.activities, [destId]: acts };
      storage.setItem("activities", updated);
      return { activities: updated };
    });
  },
  addActivity: (destId, act) => {
    set((state) => {
      const updated = {
        ...state.activities,
        [destId]: [...(state.activities[destId] || []), act],
      };
      storage.setItem("activities", updated);
      return { activities: updated };
    });
  },
  /**
 * replaceActivity
 *
 * Purpose:
 *  This function reconciles an "optimistic" placeholder activity with the real
 *  backend response once the API call succeeds. It ensures that the local state
 *  (Zustand) and localForage stay in sync, whether the user was offline or online.
 *
 * Flow:
 *  1️⃣ User creates a new activity while possibly offline:
 *      - We assign a temporary ID (`tempId`) to the activity
 *      - addActivity() adds it immediately to the store so UI shows it
 *      - LocalForage also stores it so it survives reloads
 *      - The action is queued for the backend call later
 *
 *  2️⃣ processQueue() eventually calls the API and returns the saved activity
 *      - The backend generates a "real" ID, timestamps, etc.
 *
 *  3️⃣ replaceActivity() swaps the placeholder activity in Zustand + localForage
 *      with the real backend activity, using tempId to identify it.
 *
 * Data locations:
 *  - state.activities: the in-memory Zustand store
 *      Record keyed by destinationId -> Activity[]
 *  - localForage ("activities"): persisted copy for offline resilience
 *
 * Parameters:
 *  - tempId: the temporary ID of the optimistic activity
 *  - saved: the real activity object returned from the backend
 *
 * Returns:
 *  - Nothing; updates Zustand state and persists to localForage
 *
 * Notes:
 *  - If tempId isn't found in the store (some edge cases), the function
 *    adds the backend activity to its destination anyway.
 *  - This is the key mechanism that lets your app work seamlessly offline
 *    without losing user input.
 *
 */
  replaceActivity: (tempId: string, saved: Activity) => {
    set((state) => {
      const updatedActivities: Record<string, Activity[]> = { ...state.activities };

      // 1️⃣ Find the destination array that contains the tempId
      let destIdContainingTemp: string | undefined;
      for (const [destId, acts] of Object.entries(updatedActivities)) {
        if (acts.some(a => a.id === tempId)) {
          destIdContainingTemp = destId;
          break;
        }
      }

      // 2️⃣ Replace the temp activity with the saved one
      if (destIdContainingTemp) {
        updatedActivities[destIdContainingTemp] = updatedActivities[destIdContainingTemp].map(a =>
          a.id === tempId ? saved : a
        );
      } else {
        // fallback: add to its real destination if temp not found
        const destId = saved.destinationId!;
        if (!updatedActivities[destId]) updatedActivities[destId] = [];
        updatedActivities[destId] = [...updatedActivities[destId], saved];
      }

      // 3️⃣ Persist to localForage
      storage.setItem("activities", updatedActivities);

      return { activities: updatedActivities };
    });
  },

  removeActivity: (destId: string, activityId: string) => {
    set((state) => {
      const updatedActivities = (state.activities[destId] || []).filter(p => p.id !== activityId);
      const newActivities = { ...state.activities, [destId]: updatedActivities };
      storage.setItem("activities", newActivities);
      return { activities: newActivities };
    });
  },

  getSavedActivities: () => {
    return Object.values(get().activities).flat().filter((a) => a.votes && a.votes > 0);
  },

  setComments: (activityId, comms) => {
    set((state) => {
      const updated = { ...state.comments, [activityId]: comms };
      storage.setItem("comments", updated);
      return { comments: updated };
    });
  },
  addComment: (activityId, comm) => {
    set((state) => {
      const updated = {
        ...state.comments,
        [activityId]: [...(state.comments[activityId] || []), comm],
      };
      storage.setItem("comments", updated);
      return { comments: updated };
    });
  },

  addQueuedAction: (action) => {
    set((state) => {
      const updated = [...state.queue, action];
      storage.setItem("queue", updated);
      return { queue: updated };
    });
  },

  // Hydrate store from localForage
  hydrate: async () => {
    // 1️⃣ Fetch all persisted data from localForage (IndexedDB). This retrieves whatever was previously saved for offline use.
    const [
      destinations,
      packages,
      itineraries,
      activities,
      comments,
      queue,
      userTrips,
    ] = await Promise.all([
      storage.getItem<Destination[]>("destinations"),
      storage.getItem<Record<string, Package[]>>("packages"),
      storage.getItem<Record<string, Itinerary[]>>("itineraries"),
      storage.getItem<Record<string, Activity[]>>("activities"),
      storage.getItem<Record<string, ActivityComment[]>>("comments"),
      storage.getItem<QueuedAction[]>("queue"),
      storage.getItem<UserTrip[]>("userTrips"),
    ]);

    // 2️⃣ Populate the in-memory Zustand store with the retrieved data.
    // If any of these items are missing (e.g., first app launch), default to empty arrays or objects.
    set({
      destinations: destinations || [],
      packages: packages || {},
      itineraries: itineraries || {},
      activities: activities || {},
      comments: comments || {},
      queue: queue || [],
      userTrips: userTrips || [],
    });

    // ✅ After this runs, all components subscribing to the store have immediate access to the persisted state.
    // This is what makes the app resilient to offline usage — the last saved state is always restored.
  },

}));

// Update offline state and process queue automatically
window.addEventListener("online", async () => {
  useStore.setState({ ui: { offline: false } });
    console.log("Offline status:", useStore.getState().ui.offline);
  
  await processQueue(); // flush queued actions automatically
});

window.addEventListener("offline", () => {
    console.log("Offline status:", useStore.getState().ui.offline);
  
  useStore.setState({ ui: { offline: true } });
});

let isProcessingQueue = false;

const queueHandlers: Record<QueueType, (payload: unknown, tempId?: string) => Promise<void>> = {
  CREATE_ACTIVITY: async (payload, tempId) => {
    const act = payload as Activity;
    console.log("Sending CREATE_ACTIVITY payload:", payload);
    const saved = await createActivity(act);
    if (tempId) useStore.getState().replaceActivity(tempId, saved);
    else useStore.getState().addActivity(saved.destinationId!, saved);
  },
  COMMENT: async (payload) => { // tempId
    const comm = payload as ActivityComment;
    useStore.getState().addComment(comm.activityId!, comm);
  },
  CREATE_DESTINATION: async (payload) => {
    const dest = payload as Destination;
    useStore.getState().addDestination(dest);
  },
  DELETE_ACTIVITY: async (payload) => {
    const act = payload as Activity;
    if (!act.destinationId) throw new Error("Activity missing destinationId");
    useStore.getState().removeActivity(act.destinationId, act.id!);
  },

  VOTE: async (payload) => {
    const vote = payload as { activityId: string; vote: number };
    const state = useStore.getState();
    const acts = state.activities[vote.activityId];
    if (acts) {
      const updatedActs = acts.map(a =>
        a.id === vote.activityId ? { ...a, votes: (a.votes || 0) + vote.vote } : a
      );
      state.setActivities(vote.activityId, updatedActs);
    }
  },
};

export const processQueue = async () => {
  if (isProcessingQueue) return;
  isProcessingQueue = true;
  type MaybeAxiosError = { response?: { status?: number } };
  
  try {
    const state = useStore.getState();

    if (state.ui.offline || state.queue.length === 0) return;

    // Work on a copy of the queue to avoid mutation during iteration
    const queueCopy = [...state.queue];
    const queueToKeep: typeof state.queue = [];

    for (const action of queueCopy) {
      const handler = queueHandlers[action.type];
      if (!handler) {
        console.warn("No handler for queued action type", action.type);
        queueToKeep.push(action);
        continue;
      }

      try {
        await handler(action.payload, action.tempId);
        // ✅ processed successfully, do NOT keep in queue
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("Failed to process queued action", action, err.message);
        } else {
          console.error("Failed to process queued action", action, err);
        }
        const maybeErr = err as MaybeAxiosError;
        // Decide whether to keep or discard the action
        // Example: discard if 400-level error
        if (maybeErr.response?.status === 400) {
          console.warn("Discarding bad queued action", action);
        } else {
          // Keep for retry
          queueToKeep.push(action);
        }
      }
    }

    // Save the filtered queue back to state and localForage
    useStore.setState({ queue: queueToKeep });
    await localforage.setItem("queue", queueToKeep);

  } finally {
    isProcessingQueue = false;
  }
};

