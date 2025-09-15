
// 🧠 What This Component Does
// Resolves and displays a single itinerary based on route params
// Pulls data from Zustand stores and hydrates it with full activity objects
// Handles missing data gracefully (destination or itinerary)
// Renders a clean, readable itinerary view with tags and linked activities
// Provides navigation and editing entry points

import React, { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { QueueTypes, CollectionTypes } from "../services/types"; // value import
import type { ItineraryActivity, ItineraryActivitiesBatch } from "../services/types"
// Zustand stores
import { addOptimisticAndQueue } from "../services/store";
import { useItinerariesStore } from "../services/slices/itinerariesSlice";
import { useActivitiesStore } from "../services/slices/activitiesSlice";
import {useDestinationsStore}from "../services/slices/destinationsSlice"

// Resolver utility to hydrate itineraries with full activity objects
import { getItinerariesWithActivities } from "../services/slices/itinerariesSlice";

// UI components
import HeroSection from "../components/destination/HeroSection";
import LinkedActivitiesPanel from "../components/dashboard/LinkedActivitiesPanel";

const ItineraryEditPage: React.FC = () => {
    const navigate = useNavigate();
    console.log("Viewing Itinerary Edit Page");
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const tripId = searchParams.get("tripId") ?? "";
    const destinationId = searchParams.get("destId") ?? "";
    const itineraryId = searchParams.get("itinId") ?? "";

    // Extract route params (destinationId and itineraryId)
    //const { destinationId, tripId } = useParams<{ destinationId: string; tripId: string }>();

    console.log("Welcome to ItineraryEditPage -> it renders LinkedActivitiesPanel to re-order  add delete activties for this itinerary");
    // --- Pull store data ---

    // Get all destinations from global store
    const destinations = useDestinationsStore(state => state.destinations);

    // Find the current destination based on route param
    const currentDestination = destinations.find(d => d.id === destinationId);

    // Get itineraries scoped to this destination
    const itineraries = useItinerariesStore(state => state.itineraries[destinationId ?? ""] ?? []);

    // Get all itinerary-activity joins (join table)
    const itineraryActivities = useItinerariesStore(state => state.itineraryActivities);

    // Get all activities grouped by destination
    const allActivitiesRecord = useActivitiesStore(state => state.activities);

    // --- Flatten all activities into a single array for lookup ---
    const allActivities = useMemo(() => Object.values(allActivitiesRecord).flat(), [allActivitiesRecord]);

    // --- Resolve itineraries with full activity objects ---
    const resolvedItineraries = useMemo(() => {
        return getItinerariesWithActivities(itineraries, itineraryActivities, allActivities);
    }, [itineraries, itineraryActivities, allActivities]);

    // Find the specific itinerary we're viewing
    const itinerary = resolvedItineraries.find(it => it.id === itineraryId);

    // --- Handle missing destination ---
    if (!currentDestination) {
        return (
            <div className="container mx-auto p-4">
                <p className="text-red-500 font-semibold">Destination not found.</p>
            </div>
        );
    }

    const handleSaveItineraryActivities = async (itineraryId: string) => {
        const finalActivities: ItineraryActivity[] =
            useItinerariesStore.getState().itineraryActivities[itineraryId] ?? [];

        const batch: ItineraryActivitiesBatch = {
            itineraryId,
            activities: finalActivities.map(a => ({
                ...a,
                // Convert temp IDs to undefined for inserts
                id: a.id && a.id.toString().startsWith('temp-') ? undefined : a.id,
            })),
        };

        // Log which activities are inserts vs updates
        batch.activities.forEach(a => {
            if (!a.id) {
                console.log(`[Batch Save] INSERT: ${a.activityId} at sortOrder ${a.sortOrder}`);
            } else {
                console.log(`[Batch Save] UPDATE: ${a.id} -> sortOrder ${a.sortOrder}`);
            }
        });

        await addOptimisticAndQueue(
            CollectionTypes.ItineraryActivities,
            batch,
            QueueTypes.BATCH_UPDATE_ITINERARY_ACTIVITIES
        );
    };

    // Debug logs (can be removed once stable)
    console.log("Trip ID:", tripId);
    console.log("Itinerary Activities map:", itineraryActivities[itineraryId ?? ""]);
    console.log("Raw itineraries:", itineraries);
    console.log("Resolved itineraries:", resolvedItineraries);
    console.log("All activities array:", allActivities);
    console.log("Resolved itinerary:", itinerary);

    // --- Handle missing itinerary ---
    if (!itinerary) {
        return (
            <div className="container mx-auto p-4">
                <HeroSection destination={currentDestination} />
                <div className="mt-4 max-w-2xl mx-auto text-center">
                    <h2 className="text-xl font-bold text-gray-700 mb-2">Itinerary not found</h2>
                    <p className="text-gray-500 mb-4">
                        The itinerary you're looking for doesn't exist or may have been deleted.
                    </p>
                    <button
                        onClick={() => navigate(`/destinations/${destinationId}`)}
                        className="px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        Back to Destination
                    </button>
                </div>
            </div>
        );
    }
    console.log("itinerary.id", itinerary.id);
    // --- Render itinerary view ---
    return (
        <div className="container mx-auto p-4">
            {/* Destination hero section */}
            <HeroSection destination={currentDestination} />

            {/* Back link */}
            <div className="mb-4 mt-2">
                <button
                    onClick={() => navigate(`/trips/${tripId}`)}
                    className="w-28 px-2 py-1 bg-orange-500 text-white rounded text-sm"
                >
                    ← Back
                </button>
            </div>

            {/* Itinerary details */}
            <div className="mt-6 max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">{itinerary.name}</h1>
                <p className="text-gray-600 mb-4">{itinerary.description}</p>

                {/* Tags */}
                {itinerary.tags && (
                    <div className="flex gap-2 mb-4">
                        {itinerary.tags.split(",").map(tag => (
                            <span key={tag.trim()} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                {tag.trim()}
                            </span>
                        ))}
                    </div>
                )}

                {/* Linked activities panel (join table rendered with full activity data) */}
                <LinkedActivitiesPanel itineraryId={itinerary.id!} />

                {/* Edit button */}
                <div className="mt-6">
                    <button
                        onClick={() => handleSaveItineraryActivities(itinerary.id!)}
                        className="px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ItineraryEditPage;
