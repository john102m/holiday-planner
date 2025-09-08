import React from "react";
import { useNavigate } from "react-router-dom";
import type { UserTrip } from "../../services/types";
import type { Destination } from "../../services/types";

interface Props {
  trip: UserTrip;
  destination: Destination;
}

const TripCard: React.FC<Props> = ({ trip, destination }) => {
  const navigate = useNavigate();
  const start = trip.startDate ? new Date(trip.startDate) : null;
  const end = trip.endDate ? new Date(trip.endDate) : null;
  const daysToGo = start ? Math.ceil((start.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div
      onClick={() => navigate(`/trips/${trip.id}`)}
      className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition mb-8 cursor-pointer"
    >
      <img
        src={trip.imageUrl || destination.imageUrl}
        alt={trip.name || destination.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h2 className="font-semibold text-lg">{trip.name || `Trip to ${destination.name}`}</h2>
        {start && end && (
          <p className="text-sm text-gray-500">
            {start.toLocaleDateString()} – {end.toLocaleDateString()}
          </p>
        )}
        {trip.status && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {trip.status}
          </span>
        )}
        {daysToGo && daysToGo > 0 && (
          <p className="text-xs text-gray-500 mt-1">🗓 {daysToGo} days to go</p>
        )}
      </div>
    </div>
  );
};

export default TripCard;
