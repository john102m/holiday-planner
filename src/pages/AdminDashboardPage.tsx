import React from "react";
import ItinerariesSection from "../components/dashboard/ItinerariesSection";
import SavedActivitiesSection from "../components/dashboard/SavedActivitiesSection";
import InvitationsSection from "../components/dashboard/InvitationsSection";
import CommentsFeedSection from "../components/dashboard/CommentsFeedSection";

import ScrollToTopButton from "../components/ScrollToTop";

const AdminDashboardPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>


      <ItinerariesSection />
      <SavedActivitiesSection />
      <InvitationsSection />
      <CommentsFeedSection />
      <ScrollToTopButton />
    </div>
  );
};

export default AdminDashboardPage;
