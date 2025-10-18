import React from "react";
import type { Activity, ItineraryActivity } from "../../services/types";
import LinkedActivityWidget from "./LinkedActivityWidget";

interface Props {
    joins: ItineraryActivity[];
    flatActivitiesById: Record<string, Activity>;
    onMoveJoin: (direction: "up" | "down", joinId: string) => void;
    onDelete: (joinId: string) => void;
    onUpdateNotes: (joinId: string, newNotes: string) => void;
}

const LinkedActivityList: React.FC<Props> = ({
    joins,
    flatActivitiesById,
    onMoveJoin,
    onDelete,
    onUpdateNotes
}) => {
    return (
        <div className="flex-1">
            <ul className="list-none text-sm text-gray-700">
                {joins.map((join, index) => {
                    const act = flatActivitiesById[join.activityId];
                    if (!act) return null;
                    console.log(`Rendering widget for ${join.id} at index ${index}`);
                    return (
                        <LinkedActivityWidget
                            key={join.id}
                            join={join}
                            activity={act}
                            onMoveUp={() => onMoveJoin("up", join.id!)}
                            onMoveDown={() => onMoveJoin("down", join.id!)}
                            onDelete={() => onDelete(join.id!)}
                            onUpdateNotes={(newNotes) => onUpdateNotes(join.id!, newNotes)}
                            sortIndex={index} // 👈 pass this in
                        />
                    );
                })}
            </ul>
        </div>
    );
};

export default LinkedActivityList;
