// components/modals/AddEditDiaryEntryModal.tsx
import React, { useState, useEffect } from "react";
import { GenericModal } from "../GenericModal";
import { useAddEditWithImage } from "../common/useAddEditWithImage";
import { CollectionTypes, QueueTypes } from "../../services/types";
import type { DiaryEntry } from "../../services/types";
import ImageUploadWidget from "../common/ImageUploadWidget";


// 🧱 Component Purpose
// AddEditDiaryEntryModal is a modal-based form that allows users 
// to create or edit a DiaryEntry. It’s designed to be reusable, reactive, 
// and tightly scoped to the diary entry entity.


// isOpen: Controls whether the modal is visible.
// onClose: Callback to close the modal.
// initialValues: Optional — used to prefill the form when editing an existing entry.
interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialValues?: DiaryEntry;
    tripName?: string; // ← new prop
}


const AddEditDiaryEntryModal: React.FC<Props> = ({ isOpen, onClose, initialValues, tripName }) => {

    // This hook: useAddEditWithImage;
    // Compresses and previews the image
    // Attaches the image to the form payload
    // Queues the submission with optimistic updates
    // It’s generic and reusable across all entities that extend ImageAttachable.
    const isEditMode = !!initialValues?.id;
    console.log(isEditMode ? `You are in edit mode` : `You are in create mode`);

    const { handleImageSelection, handleSubmit } = useAddEditWithImage<DiaryEntry>(
        CollectionTypes.DiaryEntries
    );

    //   Each field is initialized from initialValues if present — perfect for edit mode. 
    //   Otherwise, it defaults to sensible values for a new entry.
    const [title, setTitle] = useState(initialValues?.title || "");
    const [entryContent, setEntryContent] = useState(initialValues?.entryContent || "");
    const [entryDate, setEntryDate] = useState(initialValues?.entryDate || new Date().toISOString().slice(0, 10));
    const [location, setLocation] = useState(initialValues?.location || "");
    const [tags, setTags] = useState(initialValues?.tags || "");
    const [dayNumber, setDayNumber] = useState(initialValues?.dayNumber || undefined);

    useEffect(() => {
        if (!isOpen) return; // only reset when modal is open
        setTitle(initialValues?.title || "");
        setEntryContent(initialValues?.entryContent || "");
        // Only default to today’s date if there's no initial value
        setEntryDate(
            initialValues?.entryDate
                ? initialValues.entryDate.slice(0, 10)
                : new Date().toISOString().slice(0, 10)
        );
        setLocation(initialValues?.location || "");
        setTags(initialValues?.tags || "");
        setDayNumber(initialValues?.dayNumber || undefined);
    }, [initialValues, isOpen]);

    // Constructs a DiaryEntry object
    // Submits it via the generic hook
    // Closes the modal after success
    const onFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const isEditMode = !!initialValues?.id;

        const formValues: DiaryEntry = {
            title,
            entryContent,
            entryDate,
            location,
            tags,
            dayNumber,
            tripId: initialValues?.tripId,
            ...(isEditMode && {
                id: initialValues.id,
                imageUrl: initialValues.imageUrl,
            }),
        };

        console.log("Submitting diary entry:", formValues);
        await handleSubmit(formValues, isEditMode ? QueueTypes.UPDATE_DIARY_ENTRY : QueueTypes.CREATE_DIARY_ENTRY);
        onClose();
    };

    if (!isOpen) return null;

    // 🖼️ Image Upload
    // tsx
    // <ImageUploadWidget onSelect={handleImageSelection} />
    // This widget handles:
    // Drag & drop
    // Paste
    // File input
    // Preview generation
    // Blob revocation

    return (
        <GenericModal onClose={onClose} title={initialValues ? "Edit Diary Entry" : "Add Diary Entry"}>
            {tripName && (
                <div className="text-sm text-gray-600 mb-2">
                    Writing for trip: <span className="font-semibold">{tripName}</span>
                </div>
            )}
            <form onSubmit={onFormSubmit} className="space-y-4 text-sm">
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border p-2 rounded"
                />
                <textarea
                    placeholder="Entry Content"
                    value={entryContent}
                    onChange={(e) => setEntryContent(e.target.value)}
                    className="w-full border p-2 rounded h-32 resize-none"
                    required
                />
                <input
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="w-full border p-2 rounded"
                    required
                />

                {/* Collapsible Optional Fields */}
                <details className="border rounded p-2">
                    <summary className="cursor-pointer text-gray-600">More Options</summary>
                    <div className="mt-2 space-y-2">
                        <input
                            type="text"
                            placeholder="Location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full border p-2 rounded"
                        />
                        <input
                            type="text"
                            placeholder="Tags (comma-separated)"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="w-full border p-2 rounded"
                        />
                        <input
                            type="number"
                            placeholder="Day Number"
                            value={dayNumber ?? ""}
                            onChange={(e) => setDayNumber(Number(e.target.value))}
                            className="w-full border p-2 rounded"
                        />
                    </div>
                </details>

                <ImageUploadWidget
                    onSelect={handleImageSelection}
                    initialUrl={initialValues?.imageUrl}
                />

                <div className="flex justify-end space-x-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className={`px-4 py-2 rounded text-white ${title.trim() && entryContent.trim()
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-gray-400 cursor-not-allowed"
                            }`}
                        disabled={!title.trim() || !entryContent.trim()}
                    >
                        Save
                    </button>
                </div>
            </form>
        </GenericModal>

    );
};

export default AddEditDiaryEntryModal;

// 🧩 UI Layout
// Uses GenericModal for consistent styling and behavior
// Form fields are spaced and styled with Tailwind classes
// Buttons are clearly labeled and positioned for UX clarity
// ✅ Summary
// This modal:
// Is entity-specific but built on shared logic
// Handles both create and edit flows
// Manages image uploads seamlessly
// Keeps the UI clean and declarative
// Avoids unnecessary complexity