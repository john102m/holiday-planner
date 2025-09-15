import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "../services/store";
import { useDestinationsStore } from "../services/slices/destinationsSlice";
import TripForm from "../components/forms/TripForm";
import HeroSection from "../components/destination/HeroSection";
import { QueueTypes, CollectionTypes, type UserTrip } from "../services/types";
import { useAddEditWithImage } from "../components/common/useAddEditWithImage";

const AddEditTripPage: React.FC = () => {
  const { tripId, destinationId: paramDestId } = useParams<{ tripId?: string; destinationId?: string }>();
  const navigate = useNavigate();
  const rawTrips = useStore(state => state.userTrips);
  const destinations = useDestinationsStore(state => state.destinations);

  const allTrips = useMemo(() => Object.values(rawTrips).flat(), [rawTrips]);
  const currentTrip = useMemo(() => (tripId ? allTrips.find(t => t.id === tripId) : undefined), [tripId, allTrips]);
  const [previewUrl, setPreviewUrl] = useState(currentTrip?.imageUrl);
  const isEditMode = Boolean(tripId);
  const userId = "1aa26f2f-c41c-4f82-b07a-380e2992bfd9";
  const { handleImageSelection, handleSubmit } = useAddEditWithImage<UserTrip>(CollectionTypes.UserTrips);

  // Track selected destination in state for live Hero updates
  const [selectedDestinationId, setSelectedDestinationId] = useState(
    paramDestId ?? currentTrip?.destinationId ?? destinations[0].id
  );

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!destinations || destinations.length === 0) return <div>Loading destinations...</div>;

  const currentDestination = destinations.find(d => d.id === selectedDestinationId);
  if (!currentDestination) return <div>Destination not found</div>;




  const handleSelectImage = async (file: File) => {
    const newPreview = await handleImageSelection(file);

    // Revoke previous object URL if it was a blob
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(newPreview);
    return newPreview; // so TripForm/ImageUploadWidget can display it
  };


  const onSubmit = async (formValues: UserTrip) => {
    console.log("📝 Form submitted:", formValues);

    if (!selectedDestinationId) {
      console.error("❌ No destinationId in URL");
      return;
    }

    try {
      const queueType = isEditMode
        ? QueueTypes.UPDATE_USER_TRIP
        : QueueTypes.CREATE_USER_TRIP;

      console.log("⏳ Queueing activity with queueType:", queueType);
      const tempId = await handleSubmit(formValues, queueType, selectedDestinationId);
      console.log("✅ Activity queued with temp ID:", tempId);


      navigate("/dashboard");
    } catch (error) {
      console.error("❌ Submit failed:", error);
    }
  };


  return (
    <div className="container mx-auto p-4">
      <HeroSection destination={currentDestination} />

      <h2 className="text-2xl font-bold mb-4">{isEditMode ? "Trip Summary" : "Add Trip"}</h2>

      <TripForm
        initialValues={currentTrip}
        destinationId={selectedDestinationId ?? ""}
        destinations={destinations}
        userId={userId}
        onDestinationChange={isEditMode ? undefined : setSelectedDestinationId}
        onSubmit={onSubmit}
        onImageSelect={handleSelectImage} // <-- use wrapped version
        onCancel={() => navigate("/dashboard")}
      />

    </div>
  );
};

export default AddEditTripPage;
