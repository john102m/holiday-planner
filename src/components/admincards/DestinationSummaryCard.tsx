import React from "react";
import { useNavigate } from "react-router-dom";
import type { Destination } from "../../services/types";
import { CollectionTypes, QueueTypes } from "../../services/types";
import { addOptimisticAndQueue } from "../../services/store";

interface Props {
  destination: Destination;
  showActions?: boolean;
}

const DestinationSummaryCard: React.FC<Props> = ({ destination, showActions = true }) => {
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (window.confirm(`Delete "${destination.name}"?`)) {
      await addOptimisticAndQueue(
        CollectionTypes.Destinations,
        destination,
        QueueTypes.DELETE_DESTINATION,
        destination.id
      );
    }
  };

  const navigateToAddEdit = () => {
    navigate(`/destinations/edit/${destination.id}`);
  };

  return (
    <div
      className="border rounded-lg shadow-sm hover:shadow-md transition cursor-pointer flex flex-col sm:flex-row gap-3 p-2 min-w-[300px]"
      onClick={navigateToAddEdit}
    >
      {/* Left: Image */}
      <div className="sm:w-1/3 w-full flex-shrink-0">
        <img
          src={destination.imageUrl || "/placeholder.png"}
          alt={destination.name}
          className="w-full h-28 sm:h-full object-cover rounded"
          onError={(e) => { e.currentTarget.src = "/placeholder.png"; }}
        />
      </div>

      {/* Right: Text */}
      <div className="sm:w-2/3 w-full flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-md">{destination.name}</h3>
          {destination.area && (
            <p className="text-xs text-gray-500">{destination.area}</p>
          )}
          {destination.description && (
            <p className="text-sm text-gray-600 line-clamp-3 mt-1">{destination.description}</p>
          )}
        </div>

        {/* Bottom row: actions */}
        {showActions && (
          <div className="mt-2 flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); navigateToAddEdit(); }}
              className="px-2 py-1 bg-gray-100 text-sm rounded hover:bg-gray-200"
            >
              Edit
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(); }}
              className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DestinationSummaryCard;
