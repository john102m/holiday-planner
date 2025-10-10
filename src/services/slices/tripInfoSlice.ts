import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { TripInfo, QueuedAction } from "../types";
import { createTripInfo, updateTripInfo, deleteTripInfo } from "../apis/tripInfoApi";
import { uploadToAzureBlob } from "../storeUtils";
import { handleQueueError } from "../../components/common/useErrorHandler";
import type { BaseSliceState } from "../../components/common/useErrorHandler";
import { finalizeImageUpload } from "../../components/utilities"

export interface TripInfoSliceState extends BaseSliceState {
    tripInfoList: TripInfo[];

    setTripInfoList: (entries: TripInfo[]) => void;
    addTripInfo: (entry: TripInfo) => void;
    replaceTripInfo: (tempId: string, saved: TripInfo) => void;
    updateTripInfoEntry: (updated: TripInfo) => void;
    removeTripInfo: (id: string) => void;

    errorMessage: string | null;
    setError: (msg: string | null) => void;
}
console.log("🔥 tripInfoSlice.ts loaded — check new import resolution");
export const useTripInfoStore = create<TripInfoSliceState>()(
    persist(
        (set) => ({
            tripInfoList: [],

            setTripInfoList: (entries) => set({ tripInfoList: entries }),

            addTripInfo: (entry) =>
                set((state) => ({
                    tripInfoList: [...state.tripInfoList, entry],
                })),

            replaceTripInfo: (tempId, saved) =>
                set((state) => ({
                    tripInfoList: state.tripInfoList.map((e) =>
                        e.id === tempId ? saved : e
                    ),
                })),

            updateTripInfoEntry: (updated) =>
                set((state) => ({
                    tripInfoList: state.tripInfoList.map((e) =>
                        e.id === updated.id ? { ...e, ...updated } : e
                    ),
                })),

            removeTripInfo: (id) =>
                set((state) => ({
                    tripInfoList: state.tripInfoList.filter((e) => e.id !== id),
                })),

            errorMessage: null,
            setError: (msg) => set({ errorMessage: msg }),
        }),
        {
            name: "trip-info-store",
            storage: createJSONStorage(() => localStorage),
        }
    )
);


export const handleCreateTripInfo = async (action: QueuedAction) => {
    const { addTripInfo, replaceTripInfo, updateTripInfoEntry } = useTripInfoStore.getState();
    const info = action.payload as TripInfo;

    console.log("📘 [Queue] Processing CREATE_TRIP_INFO for:", info.title);

    try {
        // Step 1: create the entry on the server
        const { entry: saved, sasUrl } = await createTripInfo(info);
        console.log("✅ [API] TripInfo created:", saved);
        console.log("🔗 [API] Received SAS URL:", sasUrl);

        // Step 2: preserve blob & imageFile for optimistic display
        const merged: TripInfo = {
            ...saved,
            previewBlobUrl: info.previewBlobUrl,
            isPendingUpload: !!info.imageFile,
            imageFile: info.imageFile,
            imageUrl: info.imageUrl,
        };

        // Step 3: add or replace optimistic entry in store
        if (action.tempId) {
            console.log("🔄 [Store] Replacing optimistic TripInfo with saved one");
            replaceTripInfo(action.tempId, merged);
        } else {
            console.log("➕ [Store] Adding new TripInfo to store");
            addTripInfo(merged);
        }

        // Step 4: upload image if present
        if (sasUrl && info.imageFile instanceof File) {
            console.log("📤 [Upload] Uploading image to Azure Blob...");
            await uploadToAzureBlob(info.imageFile, sasUrl);
            console.log("✅ [Upload] Image upload complete");

            // Step 5: finalize image upload
            // const finalized: TripInfo = {
            //     ...saved,
            //     imageUrl: saved.imageUrl!,       // replace blob with final URL
            //     previewBlobUrl: undefined,
            //     imageFile: undefined,
            //     isPendingUpload: false,
            // };
            const finalized = finalizeImageUpload(saved, sasUrl);
            updateTripInfoEntry(finalized as TripInfo);
            console.log("🔄 [Store] TripInfo image updated to:", finalized.imageUrl);
        } else {
            console.log("⚠️ [Upload] No image file found or SAS URL missing");
        }
    } catch (error: unknown) {
        handleQueueError(useTripInfoStore.getState(), error);
    }
};


export const handleUpdateTripInfo = async (action: QueuedAction) => {
    const { updateTripInfoEntry } = useTripInfoStore.getState();
    const entry = action.payload as TripInfo;

    console.log("📘 [Queue] Processing UPDATE_TRIP_INFO for:", entry.title);

    try {
        // Optimistic update
        updateTripInfoEntry({
            ...entry,
            imageFile: entry.imageFile,
            previewBlobUrl: entry.previewBlobUrl,
            isPendingUpload: !!entry.imageFile,
            imageUrl: entry.imageFile ? "" : entry.imageUrl,
        });

        // Request SAS URL and final image URL
        const { sasUrl, imageUrl: backendImageUrl } = await updateTripInfo(entry.id!, entry);
        console.log("✅ [API] TripInfo updated");
        console.log("🔗 [API] Received SAS URL:", sasUrl);

        // Upload image if needed
        if (sasUrl && entry.imageFile instanceof File) {
            console.log("📤 [Upload] Uploading image to Azure Blob...");
            await uploadToAzureBlob(entry.imageFile, sasUrl);
            console.log("✅ [Upload] Image upload complete");

            updateTripInfoEntry({
                ...entry,
                imageFile: undefined,
                previewBlobUrl: undefined,
                isPendingUpload: false,
                imageUrl: backendImageUrl,
            });

            console.log("🔄 [Store] TripInfo image updated to:", backendImageUrl);
        } else {
            console.log("⚠️ [Upload] No image file found or SAS URL missing");
        }
    } catch (error: unknown) {
        handleQueueError(useTripInfoStore.getState(), error);
    }
};
export const handleDeleteTripInfo = async (action: QueuedAction) => {
    const { removeTripInfo } = useTripInfoStore.getState();
    const entry = action.payload as TripInfo;

    console.log("🗑️ [Queue] Processing DELETE_TRIP_INFO for:", entry.title);

    try {
        await deleteTripInfo(entry.id!);
        removeTripInfo(entry.id!);
        console.log("✅ [Store] TripInfo removed:", entry.id);
    } catch (error: unknown) {
        handleQueueError(useTripInfoStore.getState(), error);
    }
};



