import React, { useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
//import { useStore } from "../services/store";
import { useItinerariesStore } from "../services/slices/itinerariesSlice";
//import HeroSection from "../components/destination/HeroSection";
import ItineraryForm from "../components/forms/ItineraryForm";
import type { Itinerary } from "../services/types";
import { addOptimisticAndQueue } from "../services/store";
import { QueueTypes, CollectionTypes } from "../services/types";

//const EMPTY_ITINERARIES: Itinerary[] = [];

const AddEditItineraryPage: React.FC = () => {
    const { itineraryId } = useParams<{ itineraryId: string; }>();

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const tripId = searchParams.get("tripId") ?? "";
    const destId = searchParams.get("destId") ?? "";

    const navigate = useNavigate();
    const isEditMode = Boolean(itineraryId);
    console.log(isEditMode);
    //const destinations = useStore((state) => state.destinations);
    const rawItineraries = useItinerariesStore(state => state.itineraries);

    console.log(rawItineraries);

    const allItineraries = useMemo(() => {
        return Object.values(rawItineraries).flat();
    }, [rawItineraries]);

    console.log(allItineraries);

    const currentItinerary = useMemo(() => {
        if (!isEditMode) return undefined;
        return allItineraries.find(it => it.id === itineraryId);
    }, [isEditMode, allItineraries, itineraryId]);

    console.log(currentItinerary);
    const destinationId = currentItinerary?.destinationId ?? destId;
    const memoizedInitialValues = useMemo(() => currentItinerary, [currentItinerary]);

    console.log("Trip ID: ", tripId)
    const handleSubmit = async (updated: Itinerary) => {
        const sanitizedItinerary: Itinerary = {
            ...updated,
            name: updated.name ?? "",
            description: updated.description ?? "",
            tripId: tripId,
            slug: updated.slug ?? "",
            imageUrl: updated.imageUrl ?? "",
            tags: Array.isArray(updated.tags)
                ? updated.tags.join(", ")
                : updated.tags ?? "",
            destinationId: updated.destinationId ?? destId
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
    console.log("you are here");

    return (
        <div className="container mx-auto p-4">
            {/* <HeroSection destination={currentDestination} /> */}
            <div className="mt-6 max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold mb-4">{isEditMode ? 'Edit' : 'Create'} Itinerary</h2>
                <ItineraryForm
                    initialValues={memoizedInitialValues}
                    destinationId={destinationId}
                    onSubmit={handleSubmit}
                    onCancel={() => navigate(`/itineraries/view/${destinationId}/${itineraryId}`)}
                />

            </div>
        </div>
    );
};

export default AddEditItineraryPage;
