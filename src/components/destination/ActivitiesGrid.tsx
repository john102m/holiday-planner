// components/destination/ActivitiesGrid.tsx
import React from "react";
import type { Activity } from "../../services/types";
import ActivityCard from "../cards/ActivityCard";

interface Props {
  activities: Activity[];
  destinationId: string;
}

const ActivitiesGrid: React.FC<Props> = ({ activities, destinationId }) => {
  if (activities.length === 0) return <div>No activities added yet.</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {activities.map((act) => (
        <ActivityCard key={act.id} activity={act} destinationId={destinationId}/>
      ))}
    </div>
  );
};

export default ActivitiesGrid;

// Changes / Improvements:
// Uses ActivityCard for each activity
// Mobile-first responsive grid: 1 column on mobile, 2 on tablet, 3 on desktop
// Gap consistent with other grids (Packages / Itineraries)
