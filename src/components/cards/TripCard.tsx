import React from "react";
import { useNavigate } from "react-router-dom";
import type { UserTrip, Destination } from "../../services/types";

interface Props {
  trip: UserTrip;
  destination: Destination;
}

const TripCard: React.FC<Props> = ({ trip, destination }) => {
  const navigate = useNavigate();
  const start = trip.startDate ? new Date(trip.startDate) : null;
  const daysToGo = start ? Math.ceil((start.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  return (

    <div className="max-w-xs  border rounded-lg overflow-hidden shadow hover:shadow-lg transition mb-8 cursor-pointer flex flex-col">
      {/* Card Image */}
      <img
        src={trip.imageUrl || destination.imageUrl}
        alt={trip.name || destination.name}
        className="w-full h-48 object-cover"
      />

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h2 className="font-semibold text-lg">{trip.name || `Trip to ${destination.name}`}</h2>

        {trip.startDate && trip.endDate && (
          <p className="text-sm text-gray-500">
            {new Date(trip.startDate).toLocaleDateString()} –{" "}
            {new Date(trip.endDate).toLocaleDateString()}
          </p>
        )}

        {/* Trip Note */}
        {trip.notes && (
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {trip.notes}
          </p>
        )}

        {trip.status && (
          <div className="self-start mt-2">
            <span className="inline-flex items-center justify-center text-xs bg-blue-100 text-blue-800 px-6 py-1 rounded-full whitespace-nowrap">
              {trip.status}
            </span>
          </div>
        )}

        {daysToGo && daysToGo > 0 && (
          <p className="text-xs text-gray-500 mt-1">🗓 {daysToGo} days to go</p>
        )}

        {/* Spacer to push buttons to bottom */}
        <div className="flex-1" />

        {/* Footer Buttons */}
        <div className="flex justify-around border-t border-gray-200 pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/trips/${trip.id}`);
            }}
            className="w-32 px-3 py-1 bg-green-500 text-white rounded text-sm"
          >
            View Trip
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/trips/edit/${trip.id}`);
            }}
            className="w-32 px-3 py-1 bg-orange-500 text-white rounded text-sm"
          >
            Trip Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripCard;
