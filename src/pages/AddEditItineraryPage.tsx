import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "../services/store";
import { useItinerariesStore } from "../services/slices/itinerariesSlice";
import HeroSection from "../components/destination/HeroSection";
import ItineraryForm from "../components/forms/ItineraryForm";
import type { Itinerary } from "../services/types";
import { addOptimisticAndQueue } from "../services/store";
import { QueueTypes, CollectionTypes } from "../services/types";


const EMPTY_ITINERARIES: Itinerary[] = [];

const AddEditItineraryPage: React.FC = () => {
    const { destinationId, itineraryId } = useParams<{ destinationId: string; itineraryId: string }>();
    const navigate = useNavigate();
    const isEditMode = Boolean(itineraryId);

    const destinations = useStore((state) => state.destinations);
    //const itineraries = useItinerariesStore((state) => state.itineraries);
    const currentDestination = destinations.find((d) => d.id === destinationId);
    //const currentItinerary = itineraries[destinationId ?? ""]?.find(it => it.id === itineraryId);

const itineraryList = useItinerariesStore(state => state.itineraries[destinationId ?? ""] ?? EMPTY_ITINERARIES);
const currentItinerary = React.useMemo(() => {
  return itineraryList.find(it => it.id === itineraryId);
}, [itineraryList, itineraryId]);


    const memoizedInitialValues = useMemo(() => currentItinerary, [currentItinerary]);


    if (!currentDestination || (isEditMode && !currentItinerary)) {
        return <div className="p-4">Loading itinerary...</div>;
    }


    const handleSubmit = async (updated: Itinerary) => {
        const sanitizedItinerary: Itinerary = {
            ...updated,
            name: updated.name ?? "",
            description: updated.description ?? "",
            slug: updated.slug ?? "",
            imageUrl: updated.imageUrl ?? "",
            tags: Array.isArray(updated.tags)
                ? updated.tags.join(", ")
                : updated.tags ?? "",
            destinationId: updated.destinationId
        };

        const queueType = isEditMode
            ? QueueTypes.UPDATE_ITINERARY
            : QueueTypes.CREATE_ITINERARY;

        await addOptimisticAndQueue(
            CollectionTypes.Itineraries,
            sanitizedItinerary,
            queueType,
            destinationId
        );
        // Navigate after adding
        navigate(`/destinations/${destinationId}`);
        //navigate(`/itineraries/view/${destinationId}/${itineraryId}`);
    };

    return (
        <div className="container mx-auto p-4">
            <HeroSection destination={currentDestination} />
            <div className="mt-6 max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold mb-4">{isEditMode ? 'Edit' : 'Create'} Itinerary</h2>
                <ItineraryForm
                    initialValues={memoizedInitialValues}
                    destinationId={destinationId ?? ""}
                    onSubmit={handleSubmit}
                    onCancel={() => navigate(`/itineraries/view/${destinationId}/${itineraryId}`)}
                />

            </div>
        </div>
    );
};

export default AddEditItineraryPage;
