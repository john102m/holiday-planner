import React, { useEffect, useState, useMemo } from "react";
import { useItinerariesStore} from "../../services/slices/itinerariesSlice"
import type { DashboardItinerary } from "../../services/types";
import { getUserByEmail } from "../../services/apis/api";
import ItineraryCard from "../ItineraryCard";

const ItinerariesSection: React.FC = () => {
    const itinerariesObj = useItinerariesStore((state) => state.itineraries);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const itineraries: DashboardItinerary[] = useMemo(() => {
        if (!itinerariesObj || !currentUserId) return [];
        return Object.values(itinerariesObj)
            .flat()
            .filter((it) => it.createdBy === currentUserId);
    }, [itinerariesObj, currentUserId]);

    useEffect(() => {
        const fetchUser = async () => {
            console.log("Fetching current user...");
            try {
                const user = await getUserByEmail("john@test.com"); // replace with actual auth context
                console.log("Fetched user:", user);
                setCurrentUserId(user?.id ?? null);
            } catch (err) {
                console.error("Error fetching user:", err);
            }
        };
        fetchUser();
    }, []);

    if (!currentUserId) return <p>Loading your itineraries...</p>;
    if (itineraries.length === 0)
        return <p className="text-gray-500">You have no itineraries yet.</p>;

    return (
        <section className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">

                <h2 className="section-heading">
                    <span className="section-heading-accent">Your Itineraries</span>
                </h2>

                <button className="text-blue-500 hover:underline">
                    + Create New Itinerary
                </button>
            </div>

            {itineraries.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {itineraries.map((it) => (
                        <ItineraryCard key={it.id} itinerary={it} showRoleBadge />
                    ))}
                </div>

            ) : (
                <p className="text-gray-500">You have no itineraries yet.</p>
            )}
        </section>
    );
};

export default ItinerariesSection;
