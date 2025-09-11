// DestinationPage.tsx
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useStore } from "../services/store";
import { useActivitiesStore } from "../services/slices/activitiesSlice";
import type { Destination, ActivityComment } from "../services/types";
import { useNavigate } from "react-router-dom";
import ScrollToTopButton from "../components/ScrollToTop";
import TripHeroSection from "../components/destination/TripHeroSection";
import PackagesGrid from "../components/destination/PackagesGrid";
import ActivitiesGrid from "../components/destination/ActivitiesGrid";
import ItinerariesGrid from "../components/destination/ItinerariesGrid";
import CommentsFeed from "../components/destination/CommentsFeed";
import InviteFriendsSection from "../components/destination/InviteFriendsSection";
import QuickActionsBar from "../components/destination/QuickActionsBar";

type TabType = "Packages" | "Activities" | "Itineraries" | "Comments";

// What changed:
// Removed activities prop. The grid now subscribes directly to the store using useActivitiesStore.
// Any update to the activities in the store automatically triggers a re-render.
// Parent component (DestinationPage) just passes destinationId. No need to compute filtered lists

const TripDetailPage: React.FC = () => {
    console.log("Trip Details Page");
    const navigate = useNavigate();
    const { tripId } = useParams<{ tripId: string }>();
    console.log("Trip Id", tripId);
    const destinations = useStore((state) => state.destinations);
    const userTrip = useStore((state) => state.userTrips.find((t) => t.id === tripId));
    console.log("Trip :", userTrip);

    const comments = useActivitiesStore((state) => state.comments);
    const [activeTab, setActiveTab] = useState<TabType>("Itineraries");

    const currentDest: Destination | undefined = destinations.find((d) => d.id === userTrip?.destinationId);
    console.log("Destination :", currentDest);

    if (!currentDest) return <div>Loading destination...</div>;
    if (!userTrip) return <div>User trip not found...</div>;
  
    const dcComments: ActivityComment[] = Object.values(comments)
        .flat()
        .filter((c: ActivityComment) => c.activityId === tripId);

    const tabs: TabType[] = ["Itineraries", "Activities", "Comments"];

    return (
        <div className="destination-page container mx-auto p-4 sm:p-6 lg:p-8">
            {/* Hero Section */}

            <TripHeroSection destination={currentDest} trip={userTrip} />

            {/* Invite & Quick Actions (stacked on mobile, inline on tablet+) */}
            <div className="flex flex-col sm:flex-row justify-between items-start mt-4 mb-4 gap-2">
                <QuickActionsBar destinationId={currentDest.id ?? ""} />
                <InviteFriendsSection destinationId={currentDest.id ?? ""} />
            </div>

            {/* Tabs */}
            <div className="tabs flex overflow-x-auto border-b mb-4">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        className={`px-4 py-2 font-semibold min-w-[90px] whitespace-nowrap ${activeTab === tab
                            ? "border-b-2 border-blue-500 text-blue-500"
                            : "text-gray-600"
                            }`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="tab-content mt-4">

                {activeTab === "Packages" && (
                    <div>
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => navigate(`/destinations/${currentDest.id}/packages/add`)}
                                className="px-4 py-2 bg-blue-500 text-white rounded"
                            >
                                + Add Package
                            </button>
                        </div>
                        <PackagesGrid destinationId={currentDest.id ?? ""} />
                    </div>
                )}

                {activeTab === "Activities" && ( /*   path="/destinations/:destinationId/activities/edit/:activityId?" */
                    <div>
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => navigate(`/destinations/${currentDest.id}/activities/edit`)}
                                className="px-4 py-2 bg-blue-500 text-white rounded"
                            >
                                + Add Activity
                            </button>
                        </div>

                        <ActivitiesGrid destinationId={currentDest.id ?? ""} />
                    </div>
                )}
                {activeTab === "Itineraries" && ( /*"/itineraries/edit/:destinationId/:itineraryId"*/
                    <div>
                        <div className="flex justify-end mb-4">
                            <button
                            
                                onClick={() => navigate(`/itineraries/edit?tripId=${userTrip.id}&destId=${currentDest.id}`)}                                  
                                className="px-4 py-2 bg-blue-500 text-white rounded"
                            >
                                + Add Itinerary
                            </button>
                        </div>
                        <ItinerariesGrid destinationId={currentDest.id ?? ""} tripId={userTrip.id}/>
                    </div>
                )}
                {activeTab === "Comments" && <CommentsFeed comments={dcComments} />}
            </div>
            <ScrollToTopButton />
        </div>
    );
};

export default TripDetailPage;
