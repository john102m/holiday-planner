// AdminDashboardPage.tsx
import React, { useState } from "react";
import ScrollToTopButton from "../components/ScrollToTop";
import DestinationsGridSection from "../components/admindashboard/DestinationsGridSection";
import ActivitiesGridSection from "../components/admindashboard/ActivitiesGridSection";
import PackagesGridSection from "../components/admindashboard/PackagesGridSection";
import UsersGridSection from "../components/admindashboard/UsersGridSection";

type AdminTab = "Destinations" | "Activities" | "Packages" | "Users";

function resetAllStores() {
  const storeKeys = [
    "holiday-planner-store",
    "activities-store",
    "packages-store",
    "itineraries-store",
    "diary-entries-store",
    "destinations-store"
  ];

  storeKeys.forEach((key) => localStorage.removeItem(key));
  console.log("🧹 Zustand stores cleared — reloading app");
  window.location.reload();
}


const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>("Destinations");
  const tabs: AdminTab[] = ["Destinations", "Activities", "Packages", "Users"];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <button
        onClick={() => {
          if (window.confirm("⚠️ This will reset all app data and reload the page. Are you sure?")) {
            resetAllStores();
          }
        }}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        🔄 Master Reset (Dev Only)
      </button>

      {/* Tabs */}
      <div className="tabs flex overflow-x-auto border-b mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 font-semibold min-w-[100px] whitespace-nowrap ${activeTab === tab
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
