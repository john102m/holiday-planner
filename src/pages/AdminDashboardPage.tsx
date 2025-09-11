// AdminDashboardPage.tsx
import React, { useState } from "react";
import ScrollToTopButton from "../components/ScrollToTop";
import DestinationsGridSection from "../components/admindashboard/DestinationsGridSection";
import ActivitiesGridSection from "../components/admindashboard/ActivitiesGridSection";
import PackagesGridSection from "../components/admindashboard/PackagesGridSection";
import UsersGridSection from "../components/admindashboard/UsersGridSection";

type AdminTab = "Destinations" | "Activities" | "Packages" | "Users";

const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>("Destinations");

  const tabs: AdminTab[] = ["Destinations", "Activities", "Packages", "Users"];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="tabs flex overflow-x-auto border-b mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 font-semibold min-w-[100px] whitespace-nowrap ${
              activeTab === tab
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
        {activeTab === "Destinations" && <DestinationsGridSection />}
        {activeTab === "Activities" && <ActivitiesGridSection />}
        {activeTab === "Packages" && <PackagesGridSection />}
        {activeTab === "Users" && <UsersGridSection />}
      </div>

      <ScrollToTopButton />
    </div>
  );
};

export default AdminDashboardPage;
