import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useActivitiesStore } from "../services/slices/activitiesSlice";
import { useDestinationsStore } from "../services/slices/destinationsSlice";
import { CollectionTypes, QueueTypes } from "../services/types";
import type { Activity } from "../services/types";
import ActivityForm from "../components/forms/ActivityForm";
import { useAddEditWithImage } from "../components/common/useAddEditWithImage";

const AddEditActivityPage: React.FC = () => {
  const { destinationId } = useParams<{ destinationId: string; }>();
  const [searchParams] = useSearchParams();

  const activityId = searchParams.get("activityId") ?? undefined;
  const currentTripId = searchParams.get("tripId") ?? undefined;

  const navigate = useNavigate();
  const destinations = useDestinationsStore((state) => state.destinations);
  const activities = useActivitiesStore((state) => state.activities);

  console.log("🏷️ AddEditActivityPage mount");
  console.log("URL params:", { destinationId, activityId, currentTripId });
  console.log("Current activities state:", activities);
  console.log(currentTripId);

  const currentActivity: Activity | undefined = activityId
    ? activities[destinationId ?? ""]?.find(a => a.id === activityId)
    : undefined;

  const { handleImageSelection, handleSubmit } = useAddEditWithImage<Activity>(CollectionTypes.Activities);
  // Local state to track the preview URL
  const [previewUrl, setPreviewUrl] = useState(currentActivity?.imageUrl);
  // Wrap the hook's handleImageSelection to manage preview & cleanup

  const handleSelectImage = async (file: File): Promise<string> => {
    const newPreview = await handleImageSelection(file);

    // Revoke previous object URL if it exists
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(newPreview);
    return newPreview; // ✅ important: return for the widget
  };


  // Cleanup on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);
  const onSubmit = async (formValues: Activity) => {
    console.log("📝 Form submitted:", formValues);

    if (!destinationId) {
      console.error("❌ No destinationId in URL");
      return;
    }

    try {
      const queueType = activityId
        ? QueueTypes.UPDATE_ACTIVITY
        : QueueTypes.CREATE_ACTIVITY;

      // 'currentTripId' is the tripId from context/params
      const formWithTripId: Activity = {
        ...formValues,
        tripId: formValues.isPrivate ? currentTripId : undefined
      };



      console.log("⏳ Queueing activity with queueType:", queueType);
      const tempId = await handleSubmit(formWithTripId, queueType, destinationId);
      console.log("✅ Activity queued with temp ID:", tempId);

      // Log current store after submission
      console.log("🔍 Activities after submission:", activities[destinationId ?? ""]);

      if (currentTripId) {
        navigate(`/trips/${currentTripId}`);
      } else {
        navigate(`/destinations/${destinationId}`);
      }

    } catch (error) {
      console.error("❌ Submit failed:", error);
    }
  };

  if (!destinationId || !destinations.find(d => d.id === destinationId)) {
    console.log("⌛ Loading destination...");
    return <div>Loading destination...</div>;
  }

  const activitiesForDestination = activities[destinationId] ?? [];
  console.log("📌 Rendering activities for this destination:", activitiesForDestination);

  return (
    <div className="container mx-auto p-4">
      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-4">
          {currentActivity ? "Edit Activity" : "Add Activity"}
        </h2>
        <ActivityForm
          initialValues={currentActivity}
          destinationId={destinationId}
          isAttachedToTrip={currentTripId ? true : false}
          onSubmit={onSubmit}
          onCancel={() => {
            if (currentTripId) {
              navigate(`/trips/${currentTripId}`);
            } else {
              navigate(`/destinations/${destinationId}`);
            }
          }}
          onImageSelect={handleSelectImage}
        />

      </div>
    </div>
  );
};

export default AddEditActivityPage;
