// slices/activitiesSlice.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ImageEntity, Activity, QueuedAction } from "../types";
import { uploadToAzureBlob } from "../storeUtils";
import { createActivityWithSas, editActivityForSas, deleteActivity } from "../apis/activitiesApi";

interface ActivitiesSliceState {
  activities: Record<string, Activity[]>;


  // Activities
  setActivities: (destId: string, acts: Activity[]) => void;
  addActivity: (destId: string, act: Activity) => void;
  updateActivity: (destId: string, act: Activity) => void;
  replaceActivity: (tempId: string, saved: Activity) => void;
  removeActivity: (destId: string, activityId: string) => void;
  getActivities: () => Activity[];



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


    }),

    {
      name: "activities-store",
      storage: createJSONStorage(() => localStorage)
    }
  )
);


export const finalizeImageUpload = (
  entity: ImageEntity,
  sasUrl: string
): ImageEntity => {
  if (entity.previewBlobUrl) {
    URL.revokeObjectURL(entity.previewBlobUrl);
  }
  return {
    ...entity,
    imageUrl: sasUrl,
    previewBlobUrl: undefined,
    isPendingUpload: false,
    imageFile: undefined
  };
};

export const handleCreateActivity = async (action: QueuedAction) => {
  const { addActivity, replaceActivity, updateActivity } = useActivitiesStore.getState();
  const act = action.payload as Activity;

  console.log("📦 [Queue] Processing CREATE_ACTIVITY for:", act.name);

  try {
    const { activity: saved, sasUrl } = await createActivityWithSas(act);
    console.log("✅ [API] Activity created:", saved);
    console.log("🔗 [API] Received SAS URL:", sasUrl);

    // Preserve preview and upload flags from optimistic payload
    const merged = {
      ...saved,
      previewBlobUrl: act.previewBlobUrl,
      isPendingUpload: !!act.imageFile,
      imageFile: act.imageFile
    };

    if (action.tempId) {
      console.log("🔄 [Store] Replacing optimistic activity with saved one");
      replaceActivity(action.tempId, merged);
    } else {
      console.log("➕ [Store] Adding new activity to store");
      addActivity(saved.destinationId, merged);
    }

    // Upload image if present
    if (sasUrl && act.imageFile instanceof File) {
      console.log("📤 [Upload] Uploading image to Azure Blob...");
      await uploadToAzureBlob(act.imageFile, sasUrl);
      console.log("✅ [Upload] Image upload complete");

      // Finalize image swap
      const finalized = finalizeImageUpload(saved, sasUrl);
      updateActivity(saved.destinationId, finalized as Activity);
    } else {
      console.log("⚠️ [Upload] No image file found or SAS URL missing");
    }
  } catch (error) {
    console.error("❌ [Queue] Failed to process CREATE_ACTIVITY:", error);
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

      // Cache-bust the backend image URL so refresh gets the new image
      if (backendImageUrl) {
        //const cacheBustedUrl = `${backendImageUrl}?t=${Date.now()}`;
        updateActivity(act.destinationId, {
          ...act,
          imageFile: undefined,
          hasImage: true,
          imageUrl: backendImageUrl,
        });
        console.log("🔄 [Store] Activity image updated to:", backendImageUrl);
      }
    } else {
      console.log("⚠️ [Upload] No image file found or SAS URL missing");
    }
  } catch (error) {
    console.error("❌ [Queue] Failed to process UPDATE_ACTIVITY:", error);
  }
};


// export const handleCreateActivity = async (action: QueuedAction) => {
//   const { replaceActivity, addActivity } = useActivitiesStore.getState();
//   const act = action.payload as Activity;
//   const saved = await createActivity(act);
//   if (action.tempId) replaceActivity(action.tempId, saved);
//   else addActivity(saved.destinationId!, saved);
// };

// export const handleUpdateActivity = async (action: QueuedAction) => {
//   const { updateActivity } = useActivitiesStore.getState();
//   const act = action.payload as Activity;

//   //persist the change to backend
//   if (!act.id) {
//     throw new Error("Cannot update activity: missing activity ID");
//   }
//   await editActivity(act.id, act);

//   //mutate the store with the queued version
//   updateActivity(act.destinationId, act);

// };

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