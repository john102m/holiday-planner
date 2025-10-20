// ActivitiesGrid.tsx
import React, { useState, useEffect } from "react";
import { useActivitiesStore } from "../../services/slices/activitiesSlice";
import type { Activity } from "../../services/types"
import ActivityCard from "../cards/ActivityCard";
import ErrorToast from "../../components/common/ErrorToast";

import ActivitySwipeModal from "../cards/ActivitySwipeModal";
interface Props {
  destinationId: string;
  tripId?: string;
  hideGeneralActivities?: boolean;
}

const empty: Activity[] = [];

const ActivitiesGrid: React.FC<Props> = ({ destinationId, tripId, hideGeneralActivities }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { errorMessage, setError } = useActivitiesStore();
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);

  // ✅ Selector returns either the real array from the store
  // or the stable `empty` fallback above.
  const activities = useActivitiesStore(
    (state) => state.activities[destinationId] ?? empty
  );
  // ✅ If empty → show placeholder message.


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

  const selectedActivity = selectedIndex !== null ? filteredActivities[selectedIndex] : null;
  useEffect(() => {
    if (swipeDirection) {
      const timeout = setTimeout(() => setSwipeDirection(null), 200);
      return () => clearTimeout(timeout);
    }
  }, [swipeDirection]);


  useEffect(() => {
    if (!selectedActivity && swipeDirection) {
      const timeout = setTimeout(() => setSwipeDirection(null), 200);
      return () => clearTimeout(timeout);
    }
  }, [selectedActivity, swipeDirection]);

  if (activities.length === 0) return <div>No activities added yet.</div>;

  return (
    <>
      <div className="w-full">
        <div className="columns-2 sm:columns-3 md:columns-4 gap-2">
          {[...filteredActivities]
            .sort((a, b) => new Date(b.createdAt ?? "").getTime() - new Date(a.createdAt ?? "").getTime())
            .map((act) => (
              <div key={act.id} className="mb-3 break-inside-avoid">
                <ActivityCard
                  activity={act}
                  destinationId={destinationId}
                  tripId={tripId}
                  showActions={!!tripId}
                  onClick={() => {
                    const index = filteredActivities.findIndex((a) => a.id === act.id);
                    setSelectedIndex(index);
                  }}
                />

              </div>
            ))}
        </div>
      </div>
      {selectedActivity && (
        <ActivitySwipeModal
          activity={selectedActivity}
          tripId={tripId}
          destinationId={destinationId}
          swipeDirection={swipeDirection}
          onClose={() => {
            setSwipeDirection(null);
            setSelectedIndex(null);
          }}

          onNext={() => {
            if (selectedIndex !== null && selectedIndex < filteredActivities.length - 1) {
              setSwipeDirection("right");
              setTimeout(() => {
                setSelectedIndex(selectedIndex + 1);
              }, 150); // match animation duration
            }
          }}

          onPrev={() => {
            if (selectedIndex !== null && selectedIndex > 0) {
              setSwipeDirection("left");
              setTimeout(() => {
                setSelectedIndex(selectedIndex - 1);
              }, 150);
            }
          }}


        />
      )}

      <ErrorToast errorMessage={errorMessage} onClose={() => setError(null)} />
    </>

  );
};

export default ActivitiesGrid;
