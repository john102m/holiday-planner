import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore, addOptimisticAndQueue } from "../services/store";
import { useActivitiesStore } from "../services/slices/activitiesSlice";
import { QueueTypes, CollectionTypes } from "../services/types"; // value import

import type { Activity, QueueType } from "../services/types";
import HeroSection from "../components/destination/HeroSection";
import ActivityForm from "../components/forms/ActivityForm";

const AddEditActivityPage: React.FC = () => {
  const { destinationId, activityId } = useParams<{ destinationId: string; activityId?: string }>();
  const navigate = useNavigate();
  const destinations = useStore((state) => state.destinations);
  const activities = useActivitiesStore((state) => state.activities);

  const currentDestination = destinations.find((d) => d.id === destinationId);
  const currentActivity: Activity | undefined = activityId ? activities[destinationId ?? ""]?.find(a => a.id === activityId) : undefined;

  if (!currentDestination || !destinationId) return <div>Loading destination...</div>;

  const handleSubmit = async (act: Activity) => {
    console.log("Activity saved", act);

    const queueType: QueueType = activityId
      ? QueueTypes.UPDATE_ACTIVITY
      : QueueTypes.CREATE_ACTIVITY;

    // Use the generic helper to optimistically add + queue
    const tempId = await addOptimisticAndQueue(
      CollectionTypes.Activities,  // collection
      act,                        // activity object
      queueType,                  // queue type
      currentDestination.id       // destination ID for nested collection
    );
    // toast.success("Activity saved! Syncing in background...");
    // todo get real id from backend response and replace
    console.log("Temporary ID assigned:", tempId);

    // Navigate after adding
    navigate(`/destinations/${destinationId}`);
  };

  return (
    <div className="container mx-auto p-4">
      <HeroSection destination={currentDestination} />

      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-4">{currentActivity ? "Edit Activity" : "Add Activity"}</h2>
        <ActivityForm
          initialValues={currentActivity}
          destinationId={destinationId}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/destinations/${destinationId}`)}
        />
      </div>
    </div>
  );
};

export default AddEditActivityPage;
