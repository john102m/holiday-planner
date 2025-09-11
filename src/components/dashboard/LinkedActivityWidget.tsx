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
}

const LinkedActivityWidget: React.FC<Props> = ({
    join,
    activity,
    onMoveUp,
    onMoveDown,
    onDelete,
    onUpdateNotes
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [draftNotes, setDraftNotes] = useState(join.notes || "");

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleSaveNotes = () => {
        onUpdateNotes(draftNotes);
        closeModal();
    };

    return (
        <>
            <li className="mb-3 pl-1 flex bg-white rounded-lg overflow-hidden hover:shadow-sm transition h-40 relative">
                {/* Left section: drag handle + image */}
                <div className="flex flex-col items-center flex-shrink-0 w-24 p-1">
                    {/* Drag handle */}
                    <div className="w-6 h-6 flex justify-center cursor-grab text-gray-400 select-none mb-1">
                        ⋮⋮⋮⋮
                    </div>

                    {/* Thumbnail */}
                    {activity.imageUrl && (
                        <img
                            src={activity.imageUrl}
                            alt={activity.name}
                            className="w-full aspect-square object-cover rounded"
                        />
                    )}
                </div>

                {/* Main content */}
                <div className="flex-1 p-2 flex flex-col justify-between relative">
                    {/* Badge positioned top-right outside padding */}
                    <div className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full bg-blue-500 text-white text-xs font-bold shadow">
                        {join.sortOrder! + 1}
                    </div>

                    {/* Name */}
                    <div className="font-medium">{activity.name}</div>
                    {activity.details && (
                        <div className="text-xs text-gray-500 line-clamp-2">
                            {activity.details}
                        </div>
                    )}

                    {/* Notes preview */}
                    <Tooltip content="Edit note">
                        <div
                            className="text-xs italic text-blue-500 line-clamp-2 mt-1 cursor-pointer"
                            onClick={openModal}
                        >
                            {join.notes || "Click to add a note"}
                        </div>
                    </Tooltip>

                    {/* Action buttons */}
                    <div className="mt-2 flex gap-2">
                        <button
                            className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                            onClick={onMoveUp}
                        >
                            ↑ Move Up
                        </button>
                        <button
                            className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                            onClick={onMoveDown}
                        >
                            ↓ Move Down
                        </button>
                        <Tooltip content="Delete this activity">
                            <button
                                className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                                onClick={onDelete}
                            >
                                🗑️ Delete
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </li>



            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-lg w-full max-w-md p-4 shadow-lg relative">
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
