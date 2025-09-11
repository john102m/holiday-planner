import React from "react";
import ItinerariesGridSection from "../components/admindashboard/ItinerariesGridSection";
import ActivitiesSection from "../components/dashboard/ActivitiesSection";
import InvitationsSection from "../components/dashboard/InvitationsSection";
import CommentsFeedSection from "../components/dashboard/CommentsFeedSection";

import ScrollToTopButton from "../components/ScrollToTop";

const AdminDashboardPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <ItinerariesGridSection />
      <ActivitiesSection />
      <InvitationsSection />
      <CommentsFeedSection />
      <ScrollToTopButton />
    </div>
  );
};

export default AdminDashboardPage;
