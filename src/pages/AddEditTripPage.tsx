import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore, addOptimisticAndQueue } from "../services/store";
import TripForm from "../components/forms/TripForm";
import HeroSection from "../components/destination/HeroSection";
import { QueueTypes, CollectionTypes, type UserTrip } from "../services/types";

const AddEditTripPage: React.FC = () => {
  const { tripId, destinationId: paramDestId } = useParams<{ tripId?: string; destinationId?: string }>();
  const navigate = useNavigate();

  const rawTrips = useStore(state => state.userTrips);
  const destinations = useStore(state => state.destinations);

  const allTrips = useMemo(() => Object.values(rawTrips).flat(), [rawTrips]);
  const currentTrip = useMemo(() => (tripId ? allTrips.find(t => t.id === tripId) : undefined), [tripId, allTrips]);
  const isEditMode = Boolean(tripId);
  const userId = "1aa26f2f-c41c-4f82-b07a-380e2992bfd9";


  // Track selected destination in state for live Hero updates
  const [selectedDestinationId, setSelectedDestinationId] = useState(
    paramDestId ?? currentTrip?.destinationId ?? destinations[0].id
  );

  if (!destinations || destinations.length === 0) return <div>Loading destinations...</div>;

  const currentDestination = destinations.find(d => d.id === selectedDestinationId);
  if (!currentDestination) return <div>Destination not found</div>;

  const handleSubmit = async (trip: UserTrip) => {
    const queueType = isEditMode ? QueueTypes.UPDATE_USER_TRIP : QueueTypes.CREATE_USER_TRIP;

    await addOptimisticAndQueue(CollectionTypes.UserTrips, trip, queueType, selectedDestinationId);

    navigate("/dashboard");
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
        onDestinationChange={isEditMode ? undefined : setSelectedDestinationId} // only editable when adding
        onSubmit={handleSubmit}
        onCancel={() => navigate("/dashboard")}
      />
    </div>
  );
};

export default AddEditTripPage;
