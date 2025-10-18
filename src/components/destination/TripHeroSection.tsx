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

  // Status + Share block
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
    <div className="hero relative rounded-lg overflow-hidden shadow-md">
      <img
        src={trip.imageUrl ?? "/placeholder.png"}
        alt={trip.name}
        className="w-full object-cover"
      />

      {/* Desktop / Tablet overlay */}
      <div className="hidden md:block absolute inset-x-0 bottom-0 p-4 bg-black/30 backdrop-blur-sm">
        <div className="flex justify-between items-start gap-4">
          <div className="flex flex-wrap items-baseline gap-2">
            <h2 className="text-2xl text-violet-50 font-bold">{trip.name}</h2>
            <span className="text-base text-gray-300">{destination.name}</span>
          </div>
         
            <StatusAndShare />
         
        </div>

        <p className="text-sm text-gray-200 mt-1">
          {formatDateRange(trip.startDate, trip.endDate)}
          {daysToGo > 0 && (
            <span className="text-gray-300 text-xs ml-2">🗓 {daysToGo} days to go</span>
          )}
        </p>
      </div>


      {/* Mobile stacked card */}
      <div className="md:hidden p-3 bg-white rounded-b-lg shadow-md space-y-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-gray-800">
            {trip.name || `Your Trip to ${destination.name}`}
          </h2>
          <StatusAndShare />
        </div>

        <p className="text-sm text-gray-600">
          {formatDateRange(trip.startDate, trip.endDate)}
          {daysToGo > 0 && (
            <span className="text-gray-400 text-xs ml-2">🗓 {daysToGo} days to go</span>
          )}
        </p>
      </div>

    </div>
  );
};

export default TripHeroSection;
