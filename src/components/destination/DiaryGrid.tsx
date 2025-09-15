import React, { useState, useMemo } from "react";
import type { DiaryEntry } from "../../services/types";
import DiaryEntryCard from "../../components/cards/DiaryEntryCard";
import DiaryEntryModal from "../../components/cards/DiaryEntryModal";
import { useDiaryEntriesStore } from "../../services/slices/diaryEntriesSlice";
import AddEditDiaryEntryModal from "../test/AddEditDiaryEntryModal";

interface Props {
    tripId: string;
    tripName?: string;
}

const DiaryGrid: React.FC<Props> = ({ tripId, tripName }) => {
    const allEntries = useDiaryEntriesStore((s) => s.diaryEntries);
    const entries = useMemo(
        () => allEntries.filter((e) => e.tripId === tripId),
        [allEntries, tripId]
    );

    const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
    const [editEntry, setEditEntry] = useState<DiaryEntry | null>(null);

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {entries.map((entry) => (
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

        </>

    );
};

export default DiaryGrid;
