// ActivitiesGrid.tsx
import React from "react";
import { useActivitiesStore } from "../../services/slices/activitiesSlice";
import type { Activity } from "../../services/types"
import ActivityCard from "../cards/ActivityCard";
import ErrorToast from "../../components/common/ErrorToast";

interface Props {
  destinationId: string;
  tripId?: string;
}
// Subscribe directly in grid → automatic re-render on updates.
// All CRUD ops go through queue → consistent handling of optimistic UI and backend sync.
// Parent page is simpler → just passes destinationId.
// Eliminates props stale problem → no more “name doesn’t update after hard refresh”.
const empty: Activity[] = [];
const ActivitiesGrid: React.FC<Props> = ({ destinationId, tripId }) => {
  //const errorMessage = useActivitiesStore(state => state.errorMessage);
  // setError = useActivitiesStore(state => state.setError);
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

  // Filter activities based on public/private logic:
  // - Trip page (tripId provided): include public activities (!tripId) + private activities for this trip (act.tripId === tripId)
  // - Public page (tripId undefined): include only public activities (!tripId)
  const filteredActivities = activities.filter((act) =>
    tripId
      ? !act.tripId || act.tripId === tripId
      : !act.tripId
  );

  return (
    <>
      <div className="flex justify-center">
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full px-2 sm:px-4 place-items-center"> */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-stretch">

          {filteredActivities.map((act) => (
            <ActivityCard
              key={act.id}
              activity={act}
              destinationId={destinationId}
              tripId={tripId}
              showActions={!!tripId} // only show edit/delete if viewing within a trip
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
