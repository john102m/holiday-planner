// DestinationPage.tsx
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useStore } from "../services/store";
import { useActivitiesStore } from "../services/slices/activitiesSlice";
import type { Destination, ActivityComment } from "../services/types";
import { useNavigate } from "react-router-dom";
import ScrollToTopButton from "../components/ScrollToTop";
import HeroSection from "../components/destination/HeroSection";
import PackagesGrid from "../components/destination/PackagesGrid";
import ActivitiesGrid from "../components/destination/ActivitiesGrid";
import CommentsFeed from "../components/destination/CommentsFeed";
import InviteFriendsSection from "../components/destination/InviteFriendsSection";
import QuickActionsBar from "../components/destination/QuickActionsBar";

type TabType = "Packages" | "Activities" | "Comments";

const DestinationPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const destinations = useStore((state) => state.destinations);
  const comments = useActivitiesStore((state) => state.comments);
  const [activeTab, setActiveTab] = useState<TabType>("Packages");

  const currentDC: Destination | undefined = destinations.find((d) => d.id === id);
  if (!currentDC) return <div>Loading destination...</div>;


  const dcComments: ActivityComment[] = Object.values(comments)
    .flat()
    .filter((c: ActivityComment) => c.activityId === id);

  const tabs: TabType[] = ["Packages", "Activities", "Comments"];

  return (
    <div className="destination-page container mx-auto p-4 sm:p-6 lg:p-8">
      {/* Hero Section */}
      <HeroSection destination={currentDC} />

      {/* Invite & Quick Actions (stacked on mobile, inline on tablet+) */}
      <div className="flex flex-col sm:flex-row justify-between items-start mt-4 mb-4 gap-2">
        <QuickActionsBar destinationId={currentDC.id} />
        <InviteFriendsSection destinationId={currentDC.id} />
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
                onClick={() => navigate(`/destinations/${currentDC.id}/packages/add`)}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                + Add Package
              </button>
            </div>
            <PackagesGrid destinationId={currentDC.id} />
          </div>
        )}

        {activeTab === "Activities" && ( /*   path="/destinations/:destinationId/activities/edit/:activityId?" */
          <div>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => navigate(`/destinations/${currentDC.id}/activities/edit`)}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                + Add Activity
              </button>
            </div>

            <ActivitiesGrid destinationId={currentDC.id} />
          </div>
        )}

        {activeTab === "Comments" && <CommentsFeed comments={dcComments} />}
      </div>
        <ScrollToTopButton />
    </div>
  );
};

export default DestinationPage;
