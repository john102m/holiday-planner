import React from "react";
import type { DiaryEntry } from "../../services/types";
import { formatDate } from "../utilities";

interface Props {
    entry: DiaryEntry;
    onClick?: () => void;
    onEdit?: (entry: DiaryEntry) => void;
}

const DiaryEntryCard: React.FC<Props> = ({ entry, onClick, onEdit }) => {
    const imageSrc =
        entry.imageUrl?.trim() && entry.imageUrl !== ""
            ? `${entry.imageUrl}?123`
            : "/placeholder.png";

    //console.log("the title you are after: ", entry.title);  
    console.log("the file you are after: ", entry.imageUrl);       
    return (
        <div
            className="relative bg-yellow-50 rounded shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition max-w-xs w-full mx-auto"
            onClick={onClick}
        >
            <img
                key={`${entry.id}-${Date.now()}`} 
                src={imageSrc}
                alt={entry.title ?? "Diary Entry"}
                className="w-full h-28 object-cover"
            />
            <div className="p-3 text-sm">
                <h3 className="font-serif text-base font-semibold mb-1">
                    {entry.title ?? "Untitled Entry"}
                </h3>
                <p className="text-gray-600 line-clamp-3">
                    {entry.entryContent ?? "No content available."}
                </p>
                <p className="text-[10px] text-gray-400 mt-2">
                    {entry.entryDate
                        ? formatDate(entry.entryDate)
                        : "No date"}
                </p>
            </div>
            <div className="absolute bottom-2 right-2 flex gap-2  opacity-90 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // prevent triggering onClick (view modal)
                        onEdit?.(entry);     // call edit handler if provided
                    }}
                    className="text-xs text-blue-600 hover:underline"
                >
                    ✎
                </button>

            </div>
        </div>
    );
};

export default DiaryEntryCard;
