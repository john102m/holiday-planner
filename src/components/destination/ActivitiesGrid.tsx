// ActivitiesGrid.tsx
import React from "react";
import { useActivitiesStore } from "../../services/slices/activitiesSlice";
import type { Activity } from "../../services/types"
import ActivityCard from "../cards/ActivityCard";

interface Props {
  destinationId: string;
}
// Subscribe directly in grid → automatic re-render on updates.
// All CRUD ops go through queue → consistent handling of optimistic UI and backend sync.
// Parent page is simpler → just passes destinationId.
// Eliminates props stale problem → no more “name doesn’t update after hard refresh”.
const empty: Activity[] = [];
const ActivitiesGrid: React.FC<Props> = ({ destinationId }) => {
  // ✅ Selector returns either the real array from the store
  // or the stable `empty` fallback above.
  const activities = useActivitiesStore(
    (state) => state.activities[destinationId] ?? empty
  );
  // ✅ If empty → show placeholder message.
  if (activities.length === 0) return <div>No activities added yet.</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full px-2 sm:px-0">

      {activities.map((act) => (
        <ActivityCard key={act.id} activity={act} destinationId={destinationId} />
      ))}
    </div>
  );
};

export default ActivitiesGrid;
