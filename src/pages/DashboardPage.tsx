import React from "react";
//import ItinerariesSection from "../components/dashboard/ItinerariesSection";
//import ActivitiesSection from "../components/dashboard/ActivitiesSection";
//import InvitationsSection from "../components/dashboard/InvitationsSection";
//import ProfileSection from "../components/dashboard/ProfileSection";
//import TravelMoodToggle from "../components/dashboard/TravelMoodleSection";
import TripsSection from "../components/dashboard/TripsSection";
import ScrollToTopButton from "../components/ScrollToTop";

const DashboardPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-6 mt-2 mb-6">
      {/* <h1 className="text-3xl font-bold mb-6">Dashboard</h1> */}
      {/* <TravelMoodToggle /> */}
      {/* <ProfileSection /> */}
      <TripsSection />
      {/* <ItinerariesSection />
      <ActivitiesSection />
      <InvitationsSection />*/}
      <ScrollToTopButton />
    </div>
  );
};

export default DashboardPage;
