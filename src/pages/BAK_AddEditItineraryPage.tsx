import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "../services/store";
import type { Itinerary } from "../services/types";
import HeroSection from "../components/destination/HeroSection";
import ItineraryForm from "../components/forms/ItineraryForm";
import { useItinerariesStore } from "../services/slices/itinerariesSlice";

const AddEditItineraryPage: React.FC = () => {
  const { destinationId, itineraryId } = useParams<{ destinationId: string; itineraryId?: string }>();
  const navigate = useNavigate();
  const destinations = useStore((state) => state.destinations);
  const itineraries = useItinerariesStore((state) => state.itineraries);

  const currentDestination = destinations.find((d) => d.id === destinationId);
  const currentItinerary: Itinerary | undefined = itineraryId ? itineraries[destinationId ?? ""]?.find(it => it.id === itineraryId) : undefined;

  if (!currentDestination) return <div>Loading destination...</div>;

  const handleSubmit = (it: Itinerary) => {
    console.log("Itinerary saved", it);
    navigate(`/destinations/${destinationId}`);
  };

  return (
    <div className="container mx-auto p-4">
      <HeroSection destination={currentDestination} />

      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-4">{currentItinerary ? "Edit Itinerary" : "Add Itinerary"}</h2>
        <ItineraryForm
          initialValues={currentItinerary}
          destinationId={destinationId ?? ""}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/destinations/${destinationId}`)}
        />
      </div>
    </div>
  );
};

export default AddEditItineraryPage;
