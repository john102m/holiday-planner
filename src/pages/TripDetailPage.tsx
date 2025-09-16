// DestinationPage.tsx
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useStore } from "../services/store";
import { useDestinationsStore } from "../services/slices/destinationsSlice"
import type { Destination } from "../services/types";
import { useNavigate } from "react-router-dom";
import ScrollToTopButton from "../components/ScrollToTop";
import TripHeroSection from "../components/destination/TripHeroSection";
import ActivitiesGrid from "../components/destination/ActivitiesGrid";
import ItinerariesGrid from "../components/destination/ItinerariesGrid";
import DiaryGrid from "../components/destination/DiaryGrid"
//import InviteFriendsSection from "../components/destination/InviteFriendsSection";
import QuickActionsBar from "../components/destination/QuickActionsBar";
import AddEditDiaryEntryModal from "../components/test/AddEditDiaryEntryModal";

type TabType = "Activities" | "Itineraries" | "Diary";

const TripDetailPage: React.FC = () => {
    console.log("Trip Details Page");
    const navigate = useNavigate();
    const { tripId } = useParams<{ tripId: string }>();
    console.log("Trip Id", tripId);
    const destinations = useDestinationsStore((state) => state.destinations);
    const userTrip = useStore((state) => state.userTrips.find((t) => t.id === tripId));
    console.log("Trip :", userTrip);

    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>("Itineraries");
    const currentDest: Destination | undefined = destinations.find((d) => d.id === userTrip?.destinationId);
    console.log("Destination :", currentDest);

    if (!currentDest) return <div>Loading destination...</div>;
    if (!userTrip) return <div>User trip not found...</div>;


    const tabs: TabType[] = ["Itineraries", "Activities", "Diary"];

    return (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

            <TripHeroSection destination={currentDest} trip={userTrip} />
            {/* Invite & Quick Actions (stacked on mobile, inline on tablet+) */}
            <div className="flex flex-col sm:flex-row justify-between items-start mt-4 mb-4 gap-2">
                <QuickActionsBar destinationId={currentDest.id ?? ""} />
                {/* <InviteFriendsSection destinationId={currentDest.id ?? ""} /> */}
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

                {activeTab === "Activities" && ( /*   path="/destinations/:destinationId/activities/edit/:activityId?" */
                    <div>

                        <div className="w-full flex justify-start sm:justify-end px-2 sm:px-0 mb-4">
                            <button
                                onClick={() => navigate(`/destinations/${currentDest.id}/activities/edit`)}
                                className="px-4 py-2 bg-blue-500 text-white rounded text-sm sm:text-base">
                                + Add Activity
                            </button>
                        </div>

                        <ActivitiesGrid destinationId={currentDest.id ?? ""} />
                    </div>
                )}
                {activeTab === "Itineraries" && ( /*"/itineraries/edit/:destinationId/:itineraryId"*/
                    <div>

                        <div className="w-full flex justify-start sm:justify-end px-2 sm:px-0 mb-4">
                            <button
                                onClick={() => navigate(`/itineraries/edit?tripId=${userTrip.id}&destId=${currentDest.id}`)}
                                className="px-4 py-2 bg-blue-500 text-white rounded text-sm sm:text-base">
                                + Add Itinerary
                            </button>
                        </div>



                        <ItinerariesGrid destinationId={currentDest.id ?? ""} tripId={userTrip.id} />
                    </div>
                )}
                {activeTab === "Diary" && (
                    <div>

                        <div className="w-full flex justify-start sm:justify-end px-2 sm:px-0 mb-4">
                            <button
                                onClick={() => setAddModalOpen(true)}
                                className="px-4 py-2 bg-blue-500 text-white rounded text-sm sm:text-base">
                                + Add Diary Entry
                            </button>
                        </div>
                        <DiaryGrid tripName={userTrip.name} tripId={userTrip.id ?? ""} />

                        {/* Modal for adding diary entry */}
                        <AddEditDiaryEntryModal
                            tripName={userTrip.name}
                            isOpen={isAddModalOpen}
                            onClose={() => setAddModalOpen(false)}
                            initialValues={{ tripId: userTrip.id ?? "" }} // prefill tripId
                        />
                    </div>
                )}
            </div>
            <ScrollToTopButton />
        </div>
    );
};
export default TripDetailPage;
