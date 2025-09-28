// DestinationPage.tsx
import React, { useState} from "react";
import { useParams, useNavigate} from "react-router-dom";
import { useStore } from "../services/store";
import { useDestinationsStore } from "../services/slices/destinationsSlice";
import type { Destination } from "../services/types";
import ScrollToTopButton from "../components/ScrollToTop";
import TripHeroSection from "../components/destination/TripHeroSection";
import ActivitiesGrid from "../components/destination/ActivitiesGrid";
import ItinerariesGrid from "../components/destination/ItinerariesGrid";
import DiaryGrid from "../components/destination/DiaryGrid";
import AddEditDiaryEntryModal from "../components/cards/AddEditDiaryEntryModal";

type TabType = "Activities" | "Itineraries" | "Diary";
const TripDetailPage: React.FC = () => {
    const navigate = useNavigate();

    const { tripId } = useParams<{ tripId: string }>();
    const destinations = useDestinationsStore((state) => state.destinations);
    const userTrip = useStore((state) => state.userTrips.find((t) => t.id === tripId));

    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>("Activities");

    const currentDest: Destination | undefined = destinations.find(
        (d) => d.id === userTrip?.destinationId
    );


    if (!currentDest) return <div>Loading destination...</div>;
    if (!userTrip) return <div>User trip not found...</div>;

    const tabs: TabType[] = ["Activities", "Itineraries", "Diary"];

    const fabBase =
        "fixed right-4 z-40 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors w-12 h-12 text-2xl md:hidden";

    const navigateToAddEdit = () => {
        console.log("Trip detail");
        const params = new URLSearchParams();
        if (tripId) params.set("tripId", tripId);
        console.log("Sending trip id: ", tripId);
        navigate(`/destinations/${currentDest.id}/activities/edit?${params.toString()}`);
    }


    return (
        <div className="w-full max-w-6xl mx-auto px-1 sm:px-4 lg:px-8 pt-4 pb-4">
            <TripHeroSection destination={currentDest} trip={userTrip} />
   
            {/* Tabs */}
            <div className="flex mb-4 mt-1 w-full">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        className={`flex-1 py-2 rounded-full font-semibold text-sm sm:text-base text-center transition ${activeTab === tab
                            ? "bg-blue-500 text-white shadow"
                            : "border border-gray-300 text-gray-800 hover:bg-gray-100"
                            }`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="tab-content mt-4">
                {activeTab === "Activities" && (
                    <div>
                        {/* Desktop/tablet inline button */}
                        <div className="hidden sm:flex justify-start mb-2 ml-14">
                            <button
                                onClick={() => navigateToAddEdit()}
                                className="px-4 py-2 bg-blue-500 text-white rounded text-sm sm:text-base"
                            >
                                + Add Activity
                            </button>
                        </div>

                        <ActivitiesGrid tripId={tripId} destinationId={currentDest.id ?? ""} />

                        {/* FAB for mobile */}
                        <button
                            onClick={() => navigateToAddEdit()}
                            className={`${fabBase} bottom-4`}
                            aria-label="Add Activity"
                        >
                            ＋
                        </button>

                    </div>
                )}

                {activeTab === "Itineraries" && (
                    <div>
                        {/* Desktop/tablet inline button */}
                        <div className="hidden sm:flex justify-start mb-2 ml-14">
                            <button
                                onClick={() =>
                                    navigate(`/itineraries/edit?tripId=${userTrip.id}&destId=${currentDest.id}`)
                                }
                                className="px-4 py-2 bg-blue-500 text-white rounded text-sm sm:text-base"
                            >
                                + Add Itinerary
                            </button>
                        </div>

                        <ItinerariesGrid destinationId={currentDest.id ?? ""} tripId={userTrip.id} />

                        {/* FAB for mobile */}
                        <button
                            onClick={() =>
                                navigate(`/itineraries/edit?tripId=${userTrip.id}&destId=${currentDest.id}`)
                            }
                            className={`${fabBase} bottom-4`}
                            aria-label="Add Itinerary"
                        >
                            ＋
                        </button>
                    </div>
                )}

                {activeTab === "Diary" && (
                    <div>
                        {/* Desktop/tablet inline button */}
                        <div className="hidden sm:flex justify-start mb-2 ml-14">
                            <button
                                onClick={() => setAddModalOpen(true)}
                                className="px-4 py-2 bg-blue-500 text-white rounded text-sm sm:text-base"
                            >
                                + Add Diary Entry
                            </button>
                        </div>

                        <DiaryGrid tripName={userTrip.name} tripId={userTrip.id ?? ""} />

                        {/* FAB for mobile */}
                        <button
                            onClick={() => setAddModalOpen(true)}
                            className={`${fabBase} bottom-4`}
                            aria-label="Add Diary Entry"
                        >
                            ＋
                        </button>

                        {/* Modal */}
                        <AddEditDiaryEntryModal
                            tripName={userTrip.name}
                            isOpen={isAddModalOpen}
                            onClose={() => setAddModalOpen(false)}
                            initialValues={{ tripId: userTrip.id ?? "" }}
                        />
                    </div>
                )}
            </div>

            <ScrollToTopButton />
        </div>
    );
};

export default TripDetailPage;
