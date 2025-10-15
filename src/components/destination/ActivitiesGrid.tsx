// ActivitiesGrid.tsx
import React from "react";
import { useActivitiesStore } from "../../services/slices/activitiesSlice";
import type { Activity } from "../../services/types"
import ActivityCard from "../cards/ActivityCard";
import ErrorToast from "../../components/common/ErrorToast";

interface Props {
  destinationId: string;
  tripId?: string;
  hideGeneralActivities?: boolean;
}
// Subscribe directly in grid → automatic re-render on updates.
// All CRUD ops go through queue → consistent handling of optimistic UI and backend sync.
// Parent page is simpler → just passes destinationId.
// Eliminates props stale problem → no more “name doesn’t update after hard refresh”.
const empty: Activity[] = [];
const ActivitiesGrid: React.FC<Props> = ({ destinationId, tripId, hideGeneralActivities }) => {

  const { errorMessage, setError } = useActivitiesStore();
  // ✅ Selector returns either the real array from the store
  // or the stable `empty` fallback above.
  const activities = useActivitiesStore(
    (state) => state.activities[destinationId] ?? empty
  );
  // ✅ If empty → show placeholder message.
  if (activities.length === 0) return <div>No activities added yet.</div>;

  console.log("Activties: ", activities);
  console.log("Trip Id: ", tripId);

  const filteredActivities = activities.filter((act) => {
    if (tripId) {
      // Trip page
      if (act.tripId === tripId) {
        return true; // always include trip-specific activities
      }

      if (!act.tripId) {
        // General destination activities
        return hideGeneralActivities ? act.isPrivate === true : act.isPrivate === false;
      }

      return false;
    } else {
      // Destination page (guest view)
      return !act.tripId && act.isPrivate === false;
    }
  });


  return (
    <>
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 items-stretch">
          {[...filteredActivities]
            .sort((a, b) => new Date(b.createdAt ?? "").getTime() - new Date(a.createdAt ?? "").getTime())
            .map((act) => (
              <ActivityCard
                key={act.id}
                activity={act}
                destinationId={destinationId}
                tripId={tripId}
                showActions={!!tripId}           
              />
            ))}

        </div>
      </div>

      {/* your grid content */}
      <ErrorToast errorMessage={errorMessage} onClose={() => setError(null)} />

    </>
  );
};

export default ActivitiesGrid;
