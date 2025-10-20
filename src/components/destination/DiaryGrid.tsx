import React, { useState, useMemo } from "react";
import type { DiaryEntry } from "../../services/types";
import DiaryEntryCard from "../../components/cards/DiaryEntryCard";
import DiaryEntryModal from "../../components/cards/DiaryEntryModal";
import { useDiaryEntriesStore } from "../../services/slices/diaryEntriesSlice";
import AddEditDiaryEntryModal from "../cards/AddEditDiaryEntryModal";
import ErrorToast from "../../components/common/ErrorToast";

interface Props {
    tripId: string;
    tripName?: string;
}

const DiaryGrid: React.FC<Props> = ({ tripId, tripName }) => {
    const allEntries = useDiaryEntriesStore((s) => s.diaryEntries);
    const { errorMessage, setError } = useDiaryEntriesStore();

    console.log("Diary entries: ", allEntries);
    const entries = useMemo(
        () => allEntries.filter((e) => e.tripId?.toLowerCase() === tripId.toLowerCase()),
        [allEntries, tripId]
    );

    console.log("tripId: ", tripId);
    console.log("Diary entries for this trip: ", entries);
    const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
    const [editEntry, setEditEntry] = useState<DiaryEntry | null>(null);

    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 px-0">
                {[...entries]
                    .sort((a, b) => new Date(b.entryDate ?? "").getTime() - new Date(a.entryDate ?? "").getTime())
                    .map((entry) => (
                        <DiaryEntryCard
                            key={entry.id}
                            entry={entry}
                            onClick={() => setSelectedEntry(entry)}
                            onEdit={(entry) => setEditEntry(entry)}
                        />
                    ))}

                {selectedEntry && (
                    <DiaryEntryModal
                        entry={selectedEntry}
                        onClose={() => setSelectedEntry(null)}
                    />
                )}
            </div>
            {editEntry && (
                <AddEditDiaryEntryModal
                    tripName={tripName}
                    isOpen={true}
                    onClose={() => setEditEntry(null)}
                    initialValues={editEntry} // ← full entry object
                />
            )}
            <ErrorToast errorMessage={errorMessage} onClose={() => setError(null)} />
        </>
        //You could even expand it later to:
        // Stack multiple errors in a queue.
        // Auto-dismiss after a few seconds.
        // Highlight slice or source (like [DiarySlice] vs [ActivitiesSlice]).

    );
};

export default DiaryGrid;
