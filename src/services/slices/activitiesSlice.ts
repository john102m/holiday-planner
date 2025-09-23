// slices/activitiesSlice.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Activity, QueuedAction } from "../types";
import { finalizeImageUpload } from "../../components/utilities"
import { uploadToAzureBlob } from "../storeUtils";
import { createActivityWithSas, editActivityForSas, deleteActivity } from "../apis/activitiesApi";
import { handleQueueError } from "../../components/common/useErrorHandler";
import type { BaseSliceState } from "../../components/common/useErrorHandler";

interface ActivitiesSliceState extends BaseSliceState {
  activities: Record<string, Activity[]>;


  // Activities
  setActivities: (destId: string, acts: Activity[]) => void;
  addActivity: (destId: string, act: Activity) => void;
  updateActivity: (destId: string, act: Activity) => void;
  replaceActivity: (tempId: string, saved: Activity) => void;
  removeActivity: (destId: string, activityId: string) => void;
  getActivities: () => Activity[];


  // new error state
  errorMessage: string | null;
  setError: (msg: string | null) => void;

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

      // error handling
      errorMessage: null,
      setError: (msg) => set({ errorMessage: msg }),
    }),

    {
      name: "activities-store",
      storage: createJSONStorage(() => localStorage)
    }
  )
);


export const handleCreateActivity = async (action: QueuedAction) => {
  const { addActivity, replaceActivity, updateActivity } = useActivitiesStore.getState();
  const act = action.payload as Activity;
  console.log("📦 [Queue] Processing CREATE_ACTIVITY for:", act.name);

  try {

    const { activity: saved, sasUrl } = await createActivityWithSas(act);
    console.log("✅ [API] Activity created:", saved);
    console.log("🔗 [API] Received SAS URL:", sasUrl);

    const merged: Activity = {
      ...saved,
      previewBlobUrl: act.previewBlobUrl,
      isPendingUpload: !!act.imageFile,
      imageFile: act.imageFile,
      imageUrl: act.imageUrl,
    };

    if (action.tempId) {
      console.log("🔄 [Store] Replacing optimistic activity with saved one");
      replaceActivity(action.tempId, merged);
    } else {
      console.log("➕ [Store] Adding new activity to store");
      addActivity(saved.destinationId, merged);
    }

    if (sasUrl && act.imageFile instanceof File) {
      console.log("📤 [Upload] Uploading image to Azure Blob...");
      await uploadToAzureBlob(act.imageFile, sasUrl);
      console.log("✅ [Upload] Image upload complete");

      const finalized = finalizeImageUpload(saved, sasUrl);
      updateActivity(saved.destinationId, finalized as Activity);
      console.log("🔄 [Store] Activity image finalized:", finalized.imageUrl);
    } else {
      console.log("⚠️ [Upload] No image file found or SAS URL missing");
    }
  } catch (error: unknown) {
    handleQueueError(useActivitiesStore.getState(), error);
  }
};


export const handleUpdateActivity = async (action: QueuedAction) => {
  const { updateActivity } = useActivitiesStore.getState();
  const act = action.payload as Activity;

  console.log("📦 [Queue] Processing UPDATE_ACTIVITY for:", act.name);

  try {
    // Ask backend for SAS URL / final image URL **first**
    const { sasUrl, imageUrl: backendImageUrl } = await editActivityForSas(act.id!, act);

    // Optimistic update: show blob preview until backend image is ready
    updateActivity(act.destinationId, {
      ...act,
      imageUrl: backendImageUrl ?? act.imageUrl,
    });

    // Only upload if SAS URL + file exist
    if (sasUrl && act.imageFile instanceof File) {
      console.log("📤 [Upload] Uploading image to Azure Blob...");
      await uploadToAzureBlob(act.imageFile, sasUrl);
      console.log("✅ [Upload] Image upload complete");

      updateActivity(act.destinationId, {
        ...act,
        imageFile: undefined,
        hasImage: true,
        previewBlobUrl: undefined,
        imageUrl: backendImageUrl,
      });

      console.log("🔄 [Store] Activity image updated to:", backendImageUrl);
    } else {
      console.log("⚠️ [Upload] No image file found or SAS URL missing");
    }
  } catch (error: unknown) {
    handleQueueError(useActivitiesStore.getState(), error);
  }
};


export const handleDeleteActivity = async (action: QueuedAction) => {
  const { removeActivity } = useActivitiesStore.getState();
  const act = action.payload as Activity;
  console.log("Deleting Activity", act);
  try {
    //persist the change to backend
    if (!act.id) {
      throw new Error("Cannot delete activity: missing activity ID");
    }
    await deleteActivity(act.id);
    //mutate the store
    removeActivity(act.destinationId, act.id);

  } catch (error: unknown) {
    handleQueueError(useActivitiesStore.getState(), error);
  }

};