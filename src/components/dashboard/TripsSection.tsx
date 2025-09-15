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

  return (
    <>
      <button
        onClick={() => navigate(`/trips/edit`)}
        className="px-4 py-2 mb-2 bg-blue-500 text-white rounded"
      >
        ➕ Add Trip
      </button>

      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

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
