import React from "react";
import type { UserTrip } from "../../services/types";
import TripCard from "../cards/TripCard";
import { useDestinationsStore } from "../../services/slices/destinationsSlice";
import { useStore } from "../../services/store";
import { useNavigate } from "react-router-dom";

const emptyTrips: UserTrip[] = [];

const TripsSection: React.FC = () => {
  const trips = useStore((state) => state.userTrips ?? emptyTrips);
  const destinations = useDestinationsStore((state) => state.destinations);
  const navigate = useNavigate();
  const fabBase =
    "fixed bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center z-40 transition-colors";

  type TripStatus = "active" | "upcomingSoon" | "upcomingLater" | "past" | "unknown";
  const statusOrder: Record<TripStatus, number> = {
    active: 0,
    upcomingSoon: 1,
    upcomingLater: 2,
    past: 3,
    unknown: 4,
  };

  const now = new Date();
  const soonThreshold = new Date();
  soonThreshold.setDate(now.getDate() + 30);
  soonThreshold.setDate(now.getDate() + 30);

  //Safely converts a string to a Date object, or returns null if undefined.
  function parseDate(dateStr?: string): Date | null {
    return dateStr ? new Date(dateStr) : null;
  }

  // Determines the status of a trip based on its start and end dates:
  function getTripStatus(start: Date | null, end: Date | null): TripStatus {
    if (!start || !end) return "unknown";
    if (start <= now && end >= now) return "active";
    if (start > now && start <= soonThreshold) return "upcomingSoon";
    if (start > soonThreshold) return "upcomingLater";
    return "past";
  }

  // Parse dates for each trip.
  // Determine status using getTripStatus.
  // Compare status priority using statusOrder.
  // If statuses are equal, sort by start date ascending.

  const sortedTrips = [...trips].sort((a, b) => {
    const aStart = parseDate(a.startDate);
    const aEnd = parseDate(a.endDate);
    const bStart = parseDate(b.startDate);
    const bEnd = parseDate(b.endDate);

    const aStatus = getTripStatus(aStart, aEnd);
    const bStatus = getTripStatus(bStart, bEnd);


    if (statusOrder[aStatus] !== statusOrder[bStatus]) {
      return statusOrder[aStatus] - statusOrder[bStatus];
    }

    // Fallback to start date sorting
    return (aStart?.getTime() ?? 0) - (bStart?.getTime() ?? 0);
  });


  return (
    <>
      {/* Top Add Trip button (desktop/tablet) */}
      <button
        onClick={() => navigate(`/trips/edit`)}
        className="px-4 py-2 mb-2 bg-blue-500 text-white rounded hidden md:inline-block"
      >
        ➕ Add Trip
      </button>

      {/* Add Trip FAB (mobile only) */}
      <button
        onClick={() => navigate(`/trips/edit`)}
        className={`${fabBase} w-12 h-12 bottom-4 right-4 md:hidden`}
        aria-label="Add Trip"
      >
        <span className="text-white text-2xl">＋</span>
      </button>

      <div className="columns-1 sm:columns-2 md:columns-3 gap-4 px-1">
        {sortedTrips.map((trip) => {
          const destination = destinations.find((d) => d.id === trip.destinationId);
          return destination && (
            <div key={trip.id} className="mb-4 break-inside-avoid">
              <TripCard trip={trip} destination={destination} />
            </div>
          );
        })}
      </div>
    </>
  );
};

export default TripsSection;
