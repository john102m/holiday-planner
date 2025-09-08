import React from "react";
import ItinerariesGridSection from "../components/dashboard/ItinerariesGridSection";
import SavedActivitiesSection from "../components/dashboard/SavedActivitiesSection";
import InvitationsSection from "../components/dashboard/InvitationsSection";
import CommentsFeedSection from "../components/dashboard/CommentsFeedSection";
import ProfileSection from "../components/dashboard/ProfileSection";
import TravelMoodToggle from "../components/dashboard/TravelMoodleSection";
import TripsGridSection from "../components/dashboard/TripsGridSection";
import ScrollToTopButton from "../components/ScrollToTop";

const DashboardPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <TravelMoodToggle />
      <ProfileSection />
      <TripsGridSection />
      <ItinerariesGridSection />
      <SavedActivitiesSection />
      <InvitationsSection />
      <CommentsFeedSection />
      <ScrollToTopButton />
    </div>
  );
};

export default DashboardPage;
