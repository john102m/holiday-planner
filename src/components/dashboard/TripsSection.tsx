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

      {/* Trips Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {trips.map((trip) => {
          const destination = destinations.find((d) => d.id === trip.destinationId);
          return destination && (
            <TripCard key={trip.id} trip={trip} destination={destination} />
          );
        })}
      </div>
    </>
  );
};

export default TripsSection;
