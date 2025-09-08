import React from "react";
import type { UserTrip } from "../../services/types";
import TripCard from "../cards/TripCard";
import { useStore } from "../../services/store";

const emptyTrips: UserTrip[] = [];

const TripsGridSection: React.FC = () => {
  const trips = useStore((state) => state.userTrips ?? emptyTrips);
  const destinations = useStore((state) => state.destinations);

  if (trips.length === 0) return <div>No trips created yet.</div>;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {trips.map((trip) => {
        const destination = destinations.find((d) => d.id === trip.destinationId);
        return destination && (
          <TripCard key={trip.id} trip={trip} destination={destination} />
        );
      })}
    </div>
  );
};

export default TripsGridSection;
