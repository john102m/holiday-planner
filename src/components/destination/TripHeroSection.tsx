import React from "react";
import type { Destination, UserTrip } from "../../services/types";
import { ShareButton } from "../../components/common/ShareButton";
import { formatDateRange } from "../../components/utilities";

interface Props {
  trip: UserTrip;
  destination: Destination;
}

const TripHeroSection: React.FC<Props> = ({ trip, destination }) => {
  const startDate = new Date(trip.startDate ?? "");
  const today = new Date();
  const daysToGo = Math.ceil(
    (startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const StatusAndShare = () => (
    <div className="flex items-center justify-between w-full">
      <span className="bg-gray-200 text-gray-800 text-xs font-medium px-3 py-1 rounded-full">
        {trip.status}
      </span>
      <ShareButton url={`https://holiday-planner-six.vercel.app/trips/${trip.id}`}>
        🔗
      </ShareButton>
    </div>
  );

  return (
    <div className="relative rounded-lg overflow-hidden shadow-md">
      {/* Background image */}
      <img
        src={trip.imageUrl ?? "/placeholder.png"}
        alt={trip.name}
        className="w-full h-64 sm:h-80 md:h-96 object-cover"
      />

      {/* Unified overlay with blur */}
      <div className="absolute inset-x-0 bottom-0 p-2 pt-0 bg-black/30 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div>
            <div className="flex flex-wrap items-baseline gap-2">
              <h2 className="text-lg sm:text-xl md:text-2xl text-violet-50 font-bold">
                {trip.name}
              </h2>
              <span className="text-sm sm:text-base text-gray-300">
                {destination.name}
              </span>
            </div>
            <p className="text-sm text-gray-200 mt-1">
              {formatDateRange(trip.startDate, trip.endDate)}
              {daysToGo > 0 && (
                <span className="text-gray-300 text-xs ml-2">
                  🗓 {daysToGo} days to go
                </span>
              )}
            </p>
          </div>

          <StatusAndShare />
        </div>
      </div>
    </div>
  );
};

export default TripHeroSection;
