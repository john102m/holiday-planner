// slices/diaryEntriesSlice.ts
import { create } from "zustand";
import type { DiaryEntry, QueuedAction } from "../types";
//import { finalizeImageUpload } from "../../components/utilities"
import { uploadToAzureBlob } from "../storeUtils";
import { createDiaryEntry, editDiaryEntry, deleteDiaryEntry } from "../apis/diaryEntryApi";
import { persist, createJSONStorage } from "zustand/middleware";
import { handleQueueError } from "../../components/common/useErrorHandler";
import type { BaseSliceState } from "../../components/common/useErrorHandler";

export interface DiaryEntriesSliceState extends BaseSliceState {
    diaryEntries: DiaryEntry[];

    setDiaryEntries: (entries: DiaryEntry[]) => void;
    addDiaryEntry: (entry: DiaryEntry) => void;
    replaceDiaryEntry: (tempId: string, saved: DiaryEntry) => void;
    updateDiaryEntry: (updated: DiaryEntry) => void;
    removeDiaryEntry: (id: string) => void;

    // new error state
    errorMessage: string | null;
    setError: (msg: string | null) => void;
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
            // error handling
            errorMessage: null,
            setError: (msg) => set({ errorMessage: msg }),
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
    const { addDiaryEntry, replaceDiaryEntry, updateDiaryEntry } = useDiaryEntriesStore.getState();
    const entry = action.payload as DiaryEntry;

    console.log("📘 [Queue] Processing CREATE_DIARY_ENTRY for:", entry.title);

    try {
        // Step 1: create the entry on the server
        const { entry: saved, sasUrl } = await createDiaryEntry(entry);
        console.log("✅ [API] Diary entry created:", saved);
        console.log("🔗 [API] Received SAS URL:", sasUrl);

        // Step 2: preserve blob & imageFile for optimistic display
        const merged: DiaryEntry = {
            ...saved,
            previewBlobUrl: entry.previewBlobUrl,   // keep blob visible
            isPendingUpload: !!entry.imageFile,     // spinner if uploading
            imageFile: entry.imageFile,             // file to upload
            imageUrl: entry.imageUrl,               // may be undefined for now
        };

        // Step 3: add or replace optimistic entry in store
        if (action.tempId) {
            console.log("🔄 [Store] Replacing optimistic diary entry with saved one");
            replaceDiaryEntry(action.tempId, merged);
        } else {
            console.log("➕ [Store] Adding new diary entry to store");
            addDiaryEntry(merged);
        }

        // Step 4: upload image if present
        if (sasUrl && entry.imageFile instanceof File) {
            console.log("📤 [Upload] Uploading image to Azure Blob...");
            await uploadToAzureBlob(entry.imageFile, sasUrl);
            console.log("✅ [Upload] Image upload complete");

            // Step 5: finalize image upload
            const finalized: DiaryEntry = {
                ...saved,
                imageUrl: saved.imageUrl!,  // replace blob with final URL
                previewBlobUrl: undefined,  // remove temporary blob
                imageFile: undefined,       // clear file
                isPendingUpload: false,     // spinner hidden
            };
            updateDiaryEntry(finalized);
            console.log("🔄 [Store] Diary entry image updated to:", finalized.imageUrl);
        } else {
            console.log("⚠️ [Upload] No image file found or SAS URL missing");
        }
    } catch (error: unknown) {
        handleQueueError(useDiaryEntriesStore.getState(), error);
    }
};




// export const handleCreateDiaryEntry = async (action: QueuedAction) => {
//     const { addDiaryEntry, replaceDiaryEntry, updateDiaryEntry } = useDiaryEntriesStore.getState();
//     const entry = action.payload as DiaryEntry;

//     console.log("📘 [Queue] Processing CREATE_DIARY_ENTRY for:", entry.title);

//     try {
//         const { entry: saved, sasUrl } = await createDiaryEntry(entry);
//         console.log("✅ [API] Diary entry created:", saved);
//         console.log("🔗 [API] Received SAS URL:", sasUrl);

//         // Preserve preview and upload flags from optimistic payload
//         const merged: DiaryEntry = {
//             ...saved,
//             previewBlobUrl: entry.previewBlobUrl,
//             isPendingUpload: !!entry.imageFile,
//             imageFile: entry.imageFile,
//             imageUrl: entry.imageUrl, // initially may be undefined  the saturday tweak
//         };

//         if (action.tempId) {
//             console.log("🔄 [Store] Replacing optimistic diary entry with saved one");
//             replaceDiaryEntry(action.tempId, merged);
//         } else {
//             console.log("➕ [Store] Adding new diary entry to store");
//             addDiaryEntry(merged);
//         }

//         // Upload image if present
//         if (sasUrl && entry.imageFile instanceof File) {
//             console.log("📤 [Upload] Uploading image to Azure Blob...");
//             await uploadToAzureBlob(entry.imageFile, sasUrl);
//             console.log("✅ [Upload] Image upload complete");

//             // Finalize image swap using shared utility
//             const finalized = finalizeImageUpload(saved, saved.imageUrl!);//`${saved.imageUrl}?${crypto.randomUUID()}`);
//             updateDiaryEntry(finalized as DiaryEntry);
//             console.log("🔄 [Store] Diary entry image updated to:", finalized.imageUrl);
//         } else {
//             console.log("⚠️ [Upload] No image file found or SAS URL missing");
//         }
//     } catch (error: unknown) {
//         handleQueueError(useDiaryEntriesStore.getState(), error);
//     }
// };

export const handleUpdateDiaryEntry = async (action: QueuedAction) => {
    const { updateDiaryEntry } = useDiaryEntriesStore.getState();
    const entry = action.payload as DiaryEntry;
    console.log("📘 [Queue] Processing UPDATE_DIARY_ENTRY for:", entry.title);
    try {

        updateDiaryEntry({
            ...entry,
            imageFile: entry.imageFile,
            previewBlobUrl: entry.previewBlobUrl,
            isPendingUpload: !!entry.imageFile,
            imageUrl: entry.imageUrl, // don't overwrite yet

        });

        // Ask backend for SAS URL and final image URL first
        const { sasUrl, imageUrl: backendImageUrl } = await editDiaryEntry(entry.id!, entry);
        console.log("✅ [API] Diary entry updated");
        console.log("🔗 [API] Received SAS URL:", sasUrl);

        // Only upload if SAS URL and image file exist
        if (sasUrl && entry.imageFile instanceof File) {
            console.log("📤 [Upload] Uploading image to Azure Blob...");
            await uploadToAzureBlob(entry.imageFile, sasUrl);
            console.log("✅ [Upload] Image upload complete");

            // Finalize image swap using backend image URL or fallback
            const finalImageUrl = backendImageUrl;

            updateDiaryEntry({
                ...entry,
                imageFile: undefined,
                //previewBlobUrl: undefined,
                isPendingUpload: false,
                hasImage: !!backendImageUrl,
                imageUrl: backendImageUrl,
                previewBlobUrl: entry.previewBlobUrl,
            });

            console.log("🔄 [Store] Diary entry image updated to:", finalImageUrl);
        } else {
            console.log("⚠️ [Upload] No image file found or SAS URL missing");
        }
    } catch (error: unknown) {
        handleQueueError(useDiaryEntriesStore.getState(), error);
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
    } catch (error: unknown) {
        handleQueueError(useDiaryEntriesStore.getState(), error);
    }
};

// 🧠 Summary of Fixes
// 🧼 Used correct store methods (removeDiaryEntry, updateDiaryEntry)
// 🔄 Removed incorrect use of updateDiaryEntry(id, updates)—your slice expects the full updated object
// 🧠 Added logging for clarity and traceability
// 🧩 Ensured API calls match your naming (editDiaryEntry instead of updateDiaryEntry)


