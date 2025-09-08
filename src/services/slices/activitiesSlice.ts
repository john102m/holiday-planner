// slices/activitiesSlice.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Activity, ActivityComment, QueuedAction } from "../types";
import { createActivity, editActivity, deleteActivity } from "../apis/activitiesApi";

interface ActivitiesSliceState {
  activities: Record<string, Activity[]>;
  comments: Record<string, ActivityComment[]>;

  // Activities
  setActivities: (destId: string, acts: Activity[]) => void;
  addActivity: (destId: string, act: Activity) => void;
  updateActivity: (destId: string, act: Activity) => void;
  replaceActivity: (tempId: string, saved: Activity) => void;
  removeActivity: (destId: string, activityId: string) => void;
  getActivities: () => Activity[];

  // Comments
  setComments: (activityId: string, comms: ActivityComment[]) => void;
  addComment: (activityId: string, comm: ActivityComment) => void;

}
console.log("🔥 activitiesSlice.ts loaded — check new import resolution");
export const useActivitiesStore = create<ActivitiesSliceState>()(
  persist(
    (set, get) => ({
      activities: {},
      comments: {},
      setActivities: (destId, acts) =>
        set((state) => ({ activities: { ...state.activities, [destId]: acts } })),
      
      addActivity: (destId, act) => {
        console.log("addActivity called", act);
        set((state) => ({
          activities: {
            ...state.activities,
            [destId]: [...(state.activities[destId] || []), act],
          },
        }));
      },


      updateActivity: (destId, updated) =>
        set((state) => {
          const existing = state.activities[destId] || [];
          const updatedList = existing.map((a) => (a.id === updated.id ? updated : a));
          return { activities: { ...state.activities, [destId]: updatedList } };
        }),

      replaceActivity: (tempId, saved) =>
        set((state) => {
          const updated = Object.entries(state.activities).reduce(
            (acc, [destId, acts]) => {
              acc[destId] = acts.map((a) => (a.id === tempId ? saved : a));
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
            [destId]: state.activities[destId]?.filter((a) => a.id !== activityId)
          }
        })),
      getActivities: () => Object.values(get().activities).flat(),

      setComments: (activityId, comms) =>
        set((state) => ({ comments: { ...state.comments, [activityId]: comms } })),
      addComment: (activityId, comm) =>
        set((state) => ({
          comments: {
            ...state.comments,
            [activityId]: [...(state.comments[activityId] || []), comm]
          }
        }))

    }),

    {
      name: "activities-store",
      storage: createJSONStorage(() => localStorage)
    }
  )
);

export const handleCreateActivity = async (action: QueuedAction) => {
  const { replaceActivity, addActivity } = useActivitiesStore.getState();
  const act = action.payload as Activity;
  const saved = await createActivity(act);
  if (action.tempId) replaceActivity(action.tempId, saved);
  else addActivity(saved.destinationId!, saved);
};

export const handleUpdateActivity = async (action: QueuedAction) => {
  const { updateActivity } = useActivitiesStore.getState();
  const act = action.payload as Activity;

  //persist the change to backend
  if (!act.id) {
    throw new Error("Cannot update activity: missing activity ID");
  }
  await editActivity(act.id, act);

  //mutate the store with the queued version
  updateActivity(act.destinationId, act);

};

export const handleDeleteActivity = async (action: QueuedAction) => {
  const { removeActivity } = useActivitiesStore.getState();
  const act = action.payload as Activity;

  //persist the change to backend
  if (!act.id) {
    throw new Error("Cannot delete activity: missing activity ID");
  }
  await deleteActivity(act.id);

  //mutate the store
  removeActivity(act.destinationId, act.id);

};