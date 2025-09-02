import { create } from "zustand";
import localforage from "localforage";
import type { Destination, Activity, Package, Itinerary, ActivityComment } from "./types";

interface QueuedAction {
  type: "CREATE_ACTIVITY"
  | "VOTE"
  | "COMMENT"
  | "CREATE_DESTINATION"
  | "DELETE_ACTIVITY";
  payload: unknown;
}

interface AppState {
  destinations: Destination[];
  packages: Record<string, Package[]>;
  itineraries: Record<string, Itinerary[]>;
  activities: Record<string, Activity[]>;
  comments: Record<string, ActivityComment[]>;
  ui: { offline: boolean };
  queue: QueuedAction[];

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
  ui: { offline: !navigator.onLine },
  queue: [],

  setDestinations: (dest) => {
    set({ destinations: dest });
    storage.setItem("destinations", dest);
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
      storage.setItem("activities", newItineraries);
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
    const [
      destinations,
      packages,
      itineraries,
      activities,
      comments,
      queue,
    ] = await Promise.all([
      storage.getItem<Destination[]>("destinations"),
      storage.getItem<Record<string, Package[]>>("packages"),
      storage.getItem<Record<string, Itinerary[]>>("itineraries"),
      storage.getItem<Record<string, Activity[]>>("activities"),
      storage.getItem<Record<string, ActivityComment[]>>("comments"),
      storage.getItem<QueuedAction[]>("queue"),
    ]);

    set({
      destinations: destinations || [],
      packages: packages || {},
      itineraries: itineraries || {},
      activities: activities || {},
      comments: comments || {},
      queue: queue || [],
    });
  },
}));

// Update offline state
window.addEventListener("online", () => useStore.setState({ ui: { offline: false } }));
window.addEventListener("offline", () => useStore.setState({ ui: { offline: true } }));
