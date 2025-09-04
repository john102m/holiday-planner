
// App.tsx
import React, { useEffect, useState } from "react";
//import { ToastContainer } from 'react-toastify';
//import 'react-toastify/dist/ReactToastify.css'
import { Routes, Route } from "react-router-dom";
import { useStore } from "./services/store";
import Home from "./pages/Home";
import DashboardPage from "./pages/DashboardPage";
import DestinationPage from "./pages/DestinationPage";
import DashboardPageLower from "./pages/DashboardPageLower";
import Navbar from "./components/Navbar";
import AddEditPackagePage from "./pages/AddEditPackagePage";
import AddEditItineraryPage from "./pages/AddEditItineraryPage";
import AddEditActivityPage from "./pages/AddEditActivityPage";
import { logMemory } from "./services/logMemory";

// The main App component that sets up routing and ensures the store is hydrated before rendering pages.
// ✅ Key points:
// We wait for hydrate() to complete before rendering routes, so useStore already has data from IndexedDB/localForage.
// The hydrated state ensures the UI doesn’t try to render components that rely on store data before it’s loaded.
// Once hydrated, all pages, including the dashboard, will have the itineraries, packages, activities, and queued actions available—whether online or offline.


const App: React.FC = () => {
  const [hydrated, setHydrated] = useState(false);
  const hydrateStore = useStore((state) => state.hydrate);

  useEffect(() => {
    const init = async () => {
      await hydrateStore();
      logMemory();
      setHydrated(true);
    };
    init();
  }, [hydrateStore]);

  if (!hydrated) return <div className="text-center mt-10">Loading app...</div>;

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/destinations/:id" element={<DestinationPage />} />
        <Route path="/dashboard/:id?" element={<DashboardPage />} />
        {/* Packages */}
        <Route
          path="/destinations/:destinationId/packages/add"
          element={<AddEditPackagePage />}
        />
        <Route
          path="/destinations/:destinationId/packages/edit/:packageId"
          element={<AddEditPackagePage />}
        />
        <Route
          path="/destinations/:destinationId/activities/edit/:activityId?"
          element={<AddEditActivityPage />}
        />
        <Route
          path="/destinations/:destinationId/itineraries/edit/:itineraryId?"
          element={<AddEditItineraryPage />}
        />

        <Route path="/dashboardlower" element={<DashboardPageLower />} />
      </Routes>
 
    </>

  );
};

export default App;

