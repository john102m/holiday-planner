
//import ItinerariesSection from "../components/dashboard/ItinerariesSection";
//import ActivitiesSection from "../components/dashboard/ActivitiesSection";
//import InvitationsSection from "../components/dashboard/InvitationsSection";
//import ProfileSection from "../components/dashboard/ProfileSection";
//import TravelMoodToggle from "../components/dashboard/TravelMoodleSection";
import TripsSection from "../components/dashboard/TripsSection";
import ScrollToTopButton from "../components/ScrollToTop";

const DashboardPage: React.FC = () => {

// p-4 → 1rem (16px) padding on small screens / mobile. This reduces the side margins so stacked cards occupy more of the screen width.
// sm:p-6 → 1.5rem (24px) padding on tablet and larger screens, keeping the original spacing for desktop.
// sm:p-6 overrides p-4 starting at the sm breakpoint (≥640px).
  return (
    // <div className="max-w-5xl mx-auto p-6 mt-2 mb-6">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 mt-2 mb-6">

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
