import React from "react";
import type { Destination } from "../../services/types";
import type { UserTrip } from "../../services/types";
import { TripPage } from "../../components/common/ShareButton";
import {formatDateRange} from "../../components/utilities";

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

  // Reusable block for status + share
  const StatusAndShare = () => (
    <div className="flex items-center justify-between w-full">
      {/* Status badge (non-clickable) */}
      <span className="bg-gray-200 text-gray-800 text-xs font-medium px-3 py-1 rounded-full">
        {trip.status}
      </span>

      {/* Share emoji button */}
      <button
        type="button"
        onClick={TripPage}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-300 hover:bg-blue-600 text-white transition-colors"
        aria-label="Share trip"
      >
        🔗
      </button>
    </div>
  );

  return (
    <div className="hero relative rounded-lg overflow-hidden shadow-md">
      <img
        src={trip.imageUrl ?? "/placeholder.png"}
        alt={trip.name}
        className="w-full h-40 sm:h-64 md:h-96 object-cover"
      />

      {/* Desktop/tablet overlay */}
      <div className="hidden sm:block absolute inset-x-0 bottom-0 p-4 bg-black/30 backdrop-blur-sm">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl text-violet-50 font-bold flex flex-wrap items-baseline gap-2">
            <span>{trip.name}</span>
            <span className="text-base text-gray-300">{destination.name}</span>
          </h2>
          <StatusAndShare />
        </div>
        <p className="text-gray-200 mt-1">
          {formatDateRange(trip.startDate, trip.endDate)}
        </p>
        {daysToGo > 0 && (
          <p className="text-gray-300 text-sm mt-1">🗓 {daysToGo} days to go</p>
        )}
      </div>

      {/* Mobile stacked card */}
      <div className="sm:hidden p-3 bg-white rounded-b-lg shadow-md">
        <h2 className="text-lg font-bold text-gray-800">
          {trip.name || `Your Trip to ${destination.name}`}
        </h2>
        <p className="text-gray-600 text-sm">
          {formatDateRange(trip.startDate, trip.endDate)}
        </p>
        {daysToGo > 0 && (
          <p className="text-gray-500 text-xs mt-1">🗓 {daysToGo} days to go</p>
        )}
        <div className="mt-2">
          <StatusAndShare />
        </div>
      </div>
    </div>
  );
};

export default TripHeroSection;
