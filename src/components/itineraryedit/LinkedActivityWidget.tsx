import React, { useState } from "react";
import type { Activity, ItineraryActivity } from "../../services/types";
import { Tooltip } from "../Tooltip";

interface Props {
    join: ItineraryActivity;
    activity: Activity;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onDelete: () => void;
    onUpdateNotes: (newNotes: string) => void;
    sortIndex: number; // 👈 new prop
}

const LinkedActivityWidget: React.FC<Props> = ({
    join,
    activity,
    onMoveUp,
    onMoveDown,
    onDelete,
    onUpdateNotes,
    sortIndex
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [draftNotes, setDraftNotes] = useState(join.notes || "");

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleSaveNotes = () => {
        onUpdateNotes(draftNotes);
        closeModal();
    };

console.log(`Badge for ${join.id}: sortIndex=${sortIndex}, join.sortOrder=${join.sortOrder}`);

    return (
        <>
            <li className="mb-3 border border-gray-200 bg-white rounded-lg shadow-sm transition overflow-hidden">
                {/* Top row: image + text */}
                <div className="flex w-full p-2 gap-2">
                    {/* Left: Image with drag + badge */}
                    <div className="w-3/8 relative">
                        {/* Drag handle - top left */}
                        <div className="absolute top-1 left-1 text-gray-300 hover:text-gray-500 cursor-grab select-none text-lg z-10">
                            ⋮⋮⋮⋮
                        </div>

                        {/* Badge - top right */}
                        <div className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full bg-blue-500 text-white text-xs font-bold shadow ring-1 ring-white z-10">
                            {sortIndex + 1}

                        </div>

                        {/* Image */}
                        {activity.imageUrl && (
                            <img
                                src={activity.imageUrl}
                                alt={activity.name}
                                className="w-full aspect-square object-cover rounded"
                            />
                        )}
                    </div>

                    {/* Right: Text */}
                    <div className="w-5/8 flex flex-col justify-between relative">
                        <div className="text-sm font-medium">{activity.name}</div>
                        {activity.details && (
                            <div className="text-xs text-gray-500 line-clamp-2">
                                {activity.details}
                            </div>
                        )}
                        <Tooltip content="Edit note">
                            <div
                                className="text-xs italic text-blue-600 mt-1 cursor-pointer hover:underline"
                                onClick={openModal}
                                tabIndex={0}
                                role="button"
                                aria-label="Edit note"
                            >
                                {join.notes?.trim() || "Click to add a note"}
                            </div>
                        </Tooltip>
                    </div>
                </div>


                {/* Bottom row: buttons */}
                <div className="px-2 pb-2 pt-1 flex justify-between items-center">
                    {/* Left: Up + Down */}
                    <div className="flex gap-2">
                        <button
                            className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                            onClick={onMoveUp}
                        >
                            ↑ Up
                        </button>
                        <button
                            className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                            onClick={onMoveDown}
                        >
                            ↓ Down
                        </button>
                    </div>

                    {/* Right: Delete */}
                    <Tooltip content="Delete this activity">
                        <button
                            className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                            onClick={onDelete}
                        >
                            🗑️ Delete
                        </button>
                    </Tooltip>
                </div>

            </li>


            {/* Modal */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Edit note"
                >
                    <div className="bg-white rounded-lg w-full max-w-md p-4 shadow-lg relative animate-fadeIn">
                        <h3 className="text-lg font-semibold mb-2">Edit Note</h3>
                        <textarea
                            value={draftNotes}
                            onChange={(e) => setDraftNotes(e.target.value)}
                            className="w-full border rounded p-2 text-sm resize-none h-32"
                            autoFocus
                        />
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                onClick={closeModal}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                onClick={handleSaveNotes}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
};

export default LinkedActivityWidget;
