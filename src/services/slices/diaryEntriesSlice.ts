// slices/diaryEntriesSlice.ts
import { create } from "zustand";
import type { DiaryEntry, QueuedAction } from "../types";
import { uploadToAzureBlob } from "../storeUtils";
import { createDiaryEntry, editDiaryEntry, deleteDiaryEntry } from "../apis/diaryEntryApi";
import { persist, createJSONStorage } from "zustand/middleware";


export interface DiaryEntriesSliceState {
    diaryEntries: DiaryEntry[];

    setDiaryEntries: (entries: DiaryEntry[]) => void;
    addDiaryEntry: (entry: DiaryEntry) => void;
    replaceDiaryEntry: (tempId: string, saved: DiaryEntry) => void;
    updateDiaryEntry: (updated: DiaryEntry) => void;
    removeDiaryEntry: (id: string) => void;
}


export const useDiaryEntriesStore = create<DiaryEntriesSliceState>()(
    persist(
        (set) => ({
            diaryEntries: [],

            setDiaryEntries: (entries) => set({ diaryEntries: entries }),

            addDiaryEntry: (entry) =>
                set((state) => ({
                    diaryEntries: [...state.diaryEntries, entry],
                })),

            replaceDiaryEntry: (tempId, saved) =>
                set((state) => ({
                    diaryEntries: state.diaryEntries.map((e) =>
                        e.id === tempId ? saved : e
                    ),
                })),

            updateDiaryEntry: (updated) =>
                set((state) => ({
                    diaryEntries: state.diaryEntries.map((e) =>
                        e.id === updated.id ? { ...e, ...updated } : e
                    ),
                })),

            removeDiaryEntry: (id) =>
                set((state) => ({
                    diaryEntries: state.diaryEntries.filter((e) => e.id !== id),
                })),
        }),
        {
            name: "diary-entries-store",
            storage: createJSONStorage(() => localStorage),
        }
    )
);

// ✅ Key Improvements
// Consistent hasImage flag for offline rendering logic.
// Cache-busted URLs ensure fresh images load even after updates.
// Avoids overwriting final image URL with blob previews.
// Store updates use final image metadata, not temporary blobs.

export const handleCreateDiaryEntry = async (action: QueuedAction) => {
    const { addDiaryEntry, replaceDiaryEntry } = useDiaryEntriesStore.getState();
    const entry = action.payload as DiaryEntry;

    console.log("📘 [Queue] Processing CREATE_DIARY_ENTRY for:", entry.title);

    try {
        const { entry: saved, sasUrl } = await createDiaryEntry(entry);
        console.log("✅ [API] Diary entry created:", saved);
        console.log("🔗 [API] Received SAS URL:", sasUrl);

        // Upload image if present
        let finalImageUrl = saved.imageUrl;
        if (sasUrl && entry.imageFile instanceof File) {
            console.log("📤 [Upload] Uploading image to Azure Blob...");
            await uploadToAzureBlob(entry.imageFile, sasUrl);
            console.log("✅ [Upload] Image upload complete");

            // Cache-bust the image URL
            if (finalImageUrl) {
                finalImageUrl = `${finalImageUrl}`;//?t=${Date.now()}
            }
        } else {
            console.log("⚠️ [Upload] No image file found or SAS URL missing");
        }

        const updatedEntry: DiaryEntry = {
            ...saved,
            imageFile: undefined,
            hasImage: !!finalImageUrl,
            imageUrl: finalImageUrl,
        };

        if (action.tempId) {
            console.log("🔄 [Store] Replacing optimistic diary entry with saved one");
            replaceDiaryEntry(action.tempId, updatedEntry);
        } else {
            console.log("➕ [Store] Adding new diary entry to store");
            addDiaryEntry(updatedEntry);
        }
    } catch (error) {
        console.error("❌ [Queue] Failed to process CREATE_DIARY_ENTRY:", error);
    }
};


export const handleUpdateDiaryEntry = async (action: QueuedAction) => {
    const { updateDiaryEntry } = useDiaryEntriesStore.getState();
    const entry = action.payload as DiaryEntry;

    console.log("📘 [Queue] Processing UPDATE_DIARY_ENTRY for:", entry.title);

    try {
        const { sasUrl, imageUrl: backendImageUrl } = await editDiaryEntry(entry.id!, entry);
        console.log("✅ [API] Diary entry updated");
        console.log("🔗 [API] Received SAS URL:", sasUrl);

        // Optimistic update with backend image URL if available
        updateDiaryEntry({
            ...entry,
            imageUrl: backendImageUrl ?? entry.imageUrl,
        });

        if (sasUrl && entry.imageFile instanceof File) {
            console.log("📤 [Upload] Uploading image to Azure Blob...");
            await uploadToAzureBlob(entry.imageFile, sasUrl);
            console.log("✅ [Upload] Image upload complete");

            // Dont Cache-bust the image URL
            if (backendImageUrl) {
                //const cacheBustedUrl = `${backendImageUrl};//?t=${Date.now()}`;
                updateDiaryEntry({
                    ...entry,
                    imageFile: undefined,
                    hasImage: true,
                    imageUrl: `${backendImageUrl}?${crypto.randomUUID()}`,
                });
                console.log("🔄 [Store] Diary entry image updated to:", backendImageUrl);
            }
        } else {
            console.log("⚠️ [Upload] No image file found or SAS URL missing");
        }
    } catch (error) {
        console.error("❌ [Queue] Failed to process UPDATE_DIARY_ENTRY:", error);
    }
};


export const handleDeleteDiaryEntry = async (action: QueuedAction) => {
    const { removeDiaryEntry } = useDiaryEntriesStore.getState();
    const entry = action.payload as DiaryEntry;

    console.log("🗑️ [Queue] Processing DELETE_DIARY_ENTRY for:", entry.title);

    try {
        await deleteDiaryEntry(entry.id!);
        removeDiaryEntry(entry.id!);
        console.log("✅ [Store] Diary entry removed:", entry.id);
    } catch (error) {
        console.error("❌ [Queue] Failed to process DELETE_DIARY_ENTRY:", error);
    }
};

// 🧠 Summary of Fixes
// 🧼 Used correct store methods (removeDiaryEntry, updateDiaryEntry)
// 🔄 Removed incorrect use of updateDiaryEntry(id, updates)—your slice expects the full updated object
// 🧠 Added logging for clarity and traceability
// 🧩 Ensured API calls match your naming (editDiaryEntry instead of updateDiaryEntry)


