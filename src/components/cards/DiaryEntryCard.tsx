import React from "react";
import type { DiaryEntry } from "../../services/types";
import { formatFriendlyDate } from "../utilities";
import Spinner from "../common/Spinner";
import { useImageBlobSrc } from "../../components/common/useImageBlobSrc";


interface Props {
    entry: DiaryEntry;
    onClick?: () => void;
    onEdit?: (entry: DiaryEntry) => void;
}

const DiaryEntryCard: React.FC<Props> = ({ entry, onClick, onEdit }) => {

    const imgSrc = useImageBlobSrc(entry);
  
    return (
        <div
            className="relative flex bg-yellow-50 rounded shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition w-full max-w-xs mx-auto"
            onClick={onClick}
        >
            {entry.isPendingUpload && (
                // <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-white/30 z-10">
                //     <Spinner />
                // </div>
                <div className="absolute inset-0 flex items-center justify-center bg-transparent z-10">
                    <Spinner />
                </div>

            )}
            <img
                key={`${entry.id}`}
                src={imgSrc}
                alt={entry.title ?? "Diary Entry"}
                className="w-24 h-24 object-cover flex-shrink-0"
            />

            <div className="p-2 flex-1 flex flex-col justify-between gap-1">
                <div className="flex flex-col gap-1">
                    <h3 className="font-serif text-base  line-clamp-1 font-semibold">{(entry.title) ?? "Untitled Entry"}</h3>
                    <p className="text-gray-600 line-clamp-1">{entry.entryContent ?? "No content available."}</p>
                </div>
                <div className="flex justify-between items-center text-[10px] text-gray-400">
                    <p>{entry.entryDate ? formatFriendlyDate(entry.entryDate) : "No date"}</p>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit?.(entry);
                        }}
                        className="text-xs text-blue-600 hover:underline"
                    >
                        ✎
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DiaryEntryCard;
