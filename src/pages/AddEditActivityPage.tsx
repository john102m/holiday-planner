import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "../services/store";
import type { Activity } from "../services/types";
import HeroSection from "../components/destination/HeroSection";
import ActivityForm from "../components/forms/ActivityForm";

const AddEditActivityPage: React.FC = () => {
  const { destinationId, activityId } = useParams<{ destinationId: string; activityId?: string }>();
  const navigate = useNavigate();
  const destinations = useStore((state) => state.destinations);
  const activities = useStore((state) => state.activities);

  const currentDestination = destinations.find((d) => d.id === destinationId);
  const currentActivity: Activity | undefined = activityId ? activities[destinationId ?? ""]?.find(a => a.id === activityId) : undefined;

  if (!currentDestination) return <div>Loading destination...</div>;

  const handleSubmit = (act: Activity) => {
    console.log("Activity saved", act);
    navigate(`/destinations/${destinationId}`);
  };

  return (
    <div className="container mx-auto p-4">
      <HeroSection destination={currentDestination} />

      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-4">{currentActivity ? "Edit Activity" : "Add Activity"}</h2>
        <ActivityForm
          initialValues={currentActivity}
          destinationId={destinationId ?? ""}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/destinations/${destinationId}`)}
        />
      </div>
    </div>
  );
};

export default AddEditActivityPage;
