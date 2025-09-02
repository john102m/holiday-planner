import React, { useMemo } from "react";
import type { ReactNode } from "react";
import { useParams } from "react-router-dom";
import { useStore } from "../services/store";
import DestinationHero from "../components/DestinationHero";
import PackageCard from "../components/PackageCard";
import ItineraryCard from "../components/ItineraryCard";
import ActivityCard from "../components/ActivityCard";
import ScrollToTopButton from "../components/ScrollToTop";
import type { Destination, Package, Itinerary, Activity } from "../services/types";

interface BoardColumnProps {
  title: string;
  children: ReactNode;
}

const BoardColumn: React.FC<BoardColumnProps> = ({ title, children }) => (
  <div className="flex-1 min-w-[300px] bg-white rounded-lg shadow p-4">
    <h2 className="text-lg font-bold mb-4">{title}</h2>
    <div className="space-y-4">{children}</div>
  </div>
);


const DestinationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const destinations = useStore((state) => state.destinations);
  const allPackages = useStore((state) => state.packages);
  const allItineraries = useStore((state) => state.itineraries);
  const allActivities = useStore((state) => state.activities);

  const destination: Destination | undefined = useMemo(
    () => destinations.find((d) => d.id === id),
    [destinations, id]
  );

  const packages: Package[] = useMemo(
    () => (id ? allPackages[id] || [] : []),
    [allPackages, id]
  );

  const itineraries: Itinerary[] = useMemo(
    () => (id ? allItineraries[id] || [] : []),
    [allItineraries, id]
  );

  const activities: Activity[] = useMemo(
    () => (id ? allActivities[id] || [] : []),
    [allActivities, id]
  );

  if (!destination) return <div>Destination not found</div>;

  return (
    <div>
      <DestinationHero destination={destination} />

      <div className="flex gap-6 overflow-x-auto mt-6 pb-6">
        <BoardColumn title="Packages">
          {packages.length > 0 ? (
            packages.map((pkg) => <PackageCard key={pkg.id} package={pkg} />)
          ) : (
            <p>No packages yet.</p>
          )}
          <button className="mt-4 text-blue-500">+ Add Package</button>
        </BoardColumn>

        <BoardColumn title="Itineraries">
          {itineraries.length > 0 ? (
            itineraries.map((it) => <ItineraryCard key={it.id} itinerary={it} />)
          ) : (
            <p>No itineraries yet.</p>
          )}
          <button className="mt-4 text-blue-500">+ Add Itinerary</button>
        </BoardColumn>

        <BoardColumn title="Activities">
          {activities.length > 0 ? (
            activities.map((act) => <ActivityCard key={act.id} activity={act} />)
          ) : (
            <p>No activities yet.</p>
          )}
          <button className="mt-4 text-blue-500">+ Add Activity</button>
        </BoardColumn>
      </div>
      <ScrollToTopButton />
    </div>
  );
};

export default DestinationPage;
