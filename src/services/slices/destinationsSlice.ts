
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { uploadToAzureBlob } from "../storeUtils";
import { createDestinationWithSas, editDestinationForSas, deleteDestination } from "../apis/destinationsApi";
import type { Destination, QueuedAction } from "../types";


interface DestinationsSliceState {
  destinations: Destination[];

  // destinations
  setDestinations: (dest: Destination[]) => void;
  addDestination: (dest: Destination) => void;
  replaceDestination: (tempId: string, saved: Destination) => void;
  updateDestination: (updated: Destination) => void;
  removeDestination: (id: string) => void;

}
console.log("🔥 activitiesSlice.ts loaded — check new import resolution");
export const useDestinationsStore = create<DestinationsSliceState>()(
  persist(
    (set) => ({

      destinations: [],
      setDestinations: (dest) => set({ destinations: dest }),
      addDestination: (dest) => set((state) => ({ destinations: [...state.destinations, dest] })),
      replaceDestination: (tempId, saved) =>
        set((state) => {
          const updated = state.destinations.map((d) =>
            d.id === tempId ? saved : d
          );
          return { destinations: updated };
        }),


      updateDestination: (updated: Destination) =>
        set((state) => ({
          destinations: state.destinations.map((d) =>
            d.id === updated.id ? { ...d, ...updated } : d
          ),
        })),

      removeDestination: (id: string) => {
        set((state) => ({
          destinations: state.destinations.filter((d) => d.id !== id),
        }));
      }

    }),
    {
      name: "destinations-store",
      storage: createJSONStorage(() => localStorage)
    }
  )
);

export const handleCreateDestination = async (action: QueuedAction) => {

  const { addDestination, replaceDestination } = useDestinationsStore.getState();
  const dest = action.payload as Destination;

  console.log("📦 [Queue] Processing CREATE_DESTINATION for:", dest.name);

  try {
    const { destination: saved, sasUrl } = await createDestinationWithSas(dest);
    console.log("✅ [API] Destination created:", saved);
    console.log("🔗 [API] Received SAS URL:", sasUrl);

    if (action.tempId) {
      console.log("🔄 [Store] Replacing optimistic destination with saved one");
      replaceDestination(action.tempId, saved);
    } else {
      console.log("➕ [Store] Adding new destination to store");
      addDestination(saved);
    }

    if (sasUrl && "imageFile" in dest && dest.imageFile instanceof File) {
      console.log("📤 [Upload] Uploading image to Azure Blob...");
      await uploadToAzureBlob(dest.imageFile, sasUrl);
      console.log("✅ [Upload] Image upload complete");
    } else {
      console.log("⚠️ [Upload] No image file found or SAS URL missing");
    }
  } catch (error) {
    console.error("❌ [Queue] Failed to process CREATE_DESTINATION:", error);
  }
};


export const handleUpdateDestination = async (action: QueuedAction) => {
  const { updateDestination } = useDestinationsStore.getState();
  const dest = action.payload as Destination;

  console.log("📦 [Queue] Processing UPDATE_DESTINATION for:", dest.name);

  try {
    const { sasUrl, imageUrl: backendImageUrl } = await editDestinationForSas(dest.id!, dest);
    console.log("✅ [API] Destination updated");
    console.log("🔗 [API] Received SAS URL:", sasUrl);

    // 1. Optimistic update (still blob preview if user just picked one)
    updateDestination(dest);

    if (sasUrl && dest.imageFile instanceof File) {
      console.log("📤 [Upload] Uploading image to Azure Blob...");
      await uploadToAzureBlob(dest.imageFile, sasUrl);
      console.log("✅ [Upload] Image upload complete");

      // 2. Replace blob: preview with final Azure URL + cache-busting
      if (backendImageUrl) {
        const cacheBustedUrl = `${backendImageUrl}?t=${Date.now()}`;
        updateDestination({
          ...dest,
          imageFile: undefined,
          hasImage: true,
          imageUrl: cacheBustedUrl, // always update the store with this
        });

        console.log("🔄 [Store] Destination image updated to:", cacheBustedUrl);
      }
    } else {
      console.log("⚠️ [Upload] No image file found or SAS URL missing");
    }
  } catch (error) {
    console.error("❌ [Queue] Failed to process UPDATE_DESTINATION:", error);
  }
};



// ----------------- UPDATE -----------------
// export const handleUpdateDestination = async (action: QueuedAction) => {
//   const { updateDestination } = useDestinationsStore.getState();
//   const dest = action.payload as Destination;
//   if (!dest.id) throw new Error("Cannot update Destination: missing ID");

//   await editDestination(dest.id, dest);
//   updateDestination(dest);
// };

// ----------------- DELETE -----------------
export const handleDeleteDestination = async (action: QueuedAction) => {
  const { removeDestination } = useDestinationsStore.getState();
  const dest = action.payload as Destination;
  if (!dest.id) throw new Error("Cannot delete Destination: missing ID");

  await deleteDestination(dest.id);
  removeDestination(dest.id);
};



