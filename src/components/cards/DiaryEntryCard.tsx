import React from "react";
import type { DiaryEntry } from "../../services/types";
import { formatFriendlyDate } from "../utilities";
import Spinner from "../common/Spinner";
import { useImageBlobSrc, isSpinnerVisible } from "../../components/common/useImageBlobSrc";

interface Props {
    entry: DiaryEntry;
    onClick?: () => void;
    onEdit?: (entry: DiaryEntry) => void;
}

const DiaryEntryCard: React.FC<Props> = ({ entry, onClick, onEdit }) => {
    /**
     * Show spinner only if uploading is in progress.
     * - Offline only blob should not show spinner
     * - Online uploading (has imageFile and isPendingUpload) shows spinner
     */
    const imgSrc = useImageBlobSrc(entry);
    const showSpinner = isSpinnerVisible(entry);

    // Detailed logging for debugging
    // console.log("💡 DiaryEntryCard render:");
    // console.log("  title:", entry.title);
    // console.log("  previewBlobUrl:", entry.previewBlobUrl);
    // console.log("  imageFile:", entry.imageFile);
    // console.log("  imageUrl:", entry.imageUrl);
    // console.log("  isPendingUpload:", entry.isPendingUpload);
    // console.log("  Computed imgSrc:", imgSrc);
    // console.log("  Online status:", navigator.onLine);
    console.log("Focal:", entry.focalPointX, entry.focalPointY);

    return (
        <div
            className="relative flex min-w-0 bg-yellow-50 bg-ruled rounded shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition w-full  mx-auto"
            onClick={onClick}
        >
            {showSpinner && (
                <Spinner />
            )}
            <div className="aspect-square w-full max-w-[6rem] overflow-hidden">
                <img
                    key={`${entry.id}`}
                    src={imgSrc}
                    alt={entry.title ?? "Diary Entry"}

                    className="w-full h-full object-cover bg-gray-100"
                    style={{
                        objectPosition: `${(entry.focalPointX ?? 0.5) * 100}% ${(entry.focalPointY ?? 0.5) * 100}%`
                    }}
                />
            </div>
            <div className="p-2 flex-1 flex flex-col justify-between gap-1">
                <div className="flex flex-col gap-1">
                    <h3 className="font-serif text-sm sm:text-base line-clamp-1 font-semibold">
                        {entry.title ?? "Untitled Entry"}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm line-clamp-1">
                        {entry.entryContent ?? "No content available."}
                    </p>
                </div>
                <div className="flex justify-between items-center text-[9px] sm:text-[10px] text-gray-400">

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
