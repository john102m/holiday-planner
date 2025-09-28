import React from "react";
import { useNavigate } from "react-router-dom";
import type { UserTrip, Destination } from "../../services/types";
import { useImageBlobSrc, isSpinnerVisible } from "../../components/common/useImageBlobSrc";
import Spinner from "../common/Spinner";
interface Props {
  trip: UserTrip;
  destination: Destination;
}

const TripCard: React.FC<Props> = ({ trip, destination }) => {
  const navigate = useNavigate();
  const start = trip.startDate ? new Date(trip.startDate) : null;
  const daysToGo = start ? Math.ceil((start.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
  const imgSrc = useImageBlobSrc(trip);
  const showSpinner = isSpinnerVisible(trip);
  return (
    <div className="w-full border rounded-lg overflow-hidden shadow hover:shadow-lg transition flex flex-col cursor-pointer">
      {/* Card Image */}
      <div className="relative w-full h-48">
        <img
          src={imgSrc}
          alt={trip.name || destination.name}
          className={`w-full h-full object-cover ${showSpinner ? "opacity-50" : "opacity-100"}`}
          onError={(e) => { e.currentTarget.src = "/placeholder.png"; }}
        />
        {showSpinner && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-10">
            <Spinner />
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h2 className="font-semibold text-lg">{trip.name || `Trip to ${destination.name}`}</h2>

        {trip.startDate && trip.endDate && (
          <p className="text-sm text-gray-500">
            {new Date(trip.startDate).toLocaleDateString()} – {new Date(trip.endDate).toLocaleDateString()}
          </p>
        )}

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

        <div className="flex-1" /> {/* Spacer */}

        {/* Footer Buttons: stacked on mobile, horizontal on tablet+ */}
        <div className="flex flex-col sm:flex-row gap-2 border-t border-gray-200 pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/trips/${trip.id}`);
            }}
            className="flex-1 px-3 py-2 bg-green-500 text-white rounded text-sm"
          >
            View Trip
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/trips/edit/${trip.id}`);
            }}
            className="flex-1 px-3 py-2 bg-orange-500 text-white rounded text-sm"
          >
            Edit Trip
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripCard;
