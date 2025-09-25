import React from "react";
import type { Destination } from "../../services/types";
import type { UserTrip } from "../../services/types";
import { TripPage } from "../../components/common/ShareButton";

interface Props {
  trip: UserTrip;
  destination: Destination;
}

const TripHeroSection: React.FC<Props> = ({ trip, destination }) => {
  const startDate = new Date(trip.startDate ?? "");
  const endDate = new Date(trip.endDate ?? "");
  const today = new Date();
  const daysToGo = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="hero relative rounded-lg overflow-hidden shadow-md">
      <img
        src={trip.imageUrl ?? "/placeholder.png"}
        alt={trip.name}
        className="w-full h-64 object-cover sm:h-80 md:h-96"
      />

      {/* Gradient fade */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>

      {/* Blurred overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/30 backdrop-blur-sm rounded-t-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl text-violet-50 font-bold flex flex-wrap items-baseline gap-2">
            {trip.name ? (
              <>
                <span>{trip.name}</span>
                <span className="text-base text-gray-400 transition-opacity duration-300 opacity-80">
                  {destination.name}
                </span>
              </>
            ) : (
              <>Your Trip to {destination.name}</>
            )}
          </h2>

          <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full">
            {trip.status}
          </span>
          <span className="bg-white/20 text-white text-sm rounded-2xl">
                 {TripPage()}
          </span>

        </div>
        <p className="text-gray-200 mt-1">
          {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
        </p>
        {daysToGo > 0 && (
          <p className="text-gray-300 text-sm mt-1">
            🗓 {daysToGo} days to go
          </p>
        )}
      </div>
    </div>
  );
};

export default TripHeroSection;
