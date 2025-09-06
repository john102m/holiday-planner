import React from "react";
import { useNavigate } from "react-router-dom";
import type { ResolvedItinerary } from "../../services/types";
import { CollectionTypes, QueueTypes } from "../../services/types";
import { addOptimisticAndQueue } from "../../services/store";

interface Props {
  itinerary: ResolvedItinerary;
  destinationId: string;
}

const ItineraryCard: React.FC<Props> = ({ itinerary, destinationId }) => {
  console.log("Hello from the Itinerary Card ");
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${itinerary.name}"?`)) {
      await addOptimisticAndQueue(
        CollectionTypes.Itineraries,
        itinerary,
        QueueTypes.DELETE_ITINERARY,
        destinationId
      );
      console.log(`Queued deletion for activity ${itinerary.name}`);
    }
  };

  // Ensure unique activities by filtering duplicates
  const uniqueActivities = Array.from(
    new Map(itinerary.activities?.map(act => [act.id, act])).values()
  );

  return (
    <div className="card border rounded shadow-sm p-4">
      <img
        src={itinerary.imageUrl}
        alt={itinerary.name}
        className="w-full h-40 object-cover rounded mb-2"
      />
      <h3 className="text-lg font-semibold">{itinerary.name}</h3>
      <p className="text-sm text-gray-600 mb-2">{itinerary.description}</p>

      {itinerary.tags && (
        <div className="flex gap-2 mb-2">
          {itinerary.tags.split(",").map(tag => (
            <span key={tag.trim()} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
              {tag.trim()}
            </span>
          ))}
        </div>
      )}

      {uniqueActivities.length > 0 ? (
        <ul className="list-disc list-inside text-sm text-gray-500 mb-2">
          {uniqueActivities.slice(0, 3).map(act => (
            <li key={act.id}>{act.name}</li>
          ))}
          {uniqueActivities.length > 3 && (
            <li>+ {uniqueActivities.length - 3} more</li>
          )}
        </ul>
      ) : (
        <p className="text-sm italic text-gray-400">No activities yet</p>
      )}

      <div className="flex gap-2 mt-2">
        <button
          onClick={() => navigate(`/itineraries/view/${destinationId}/${itinerary.id}`)}
          className="btn btn-sm bg-gray-200"
        >
          View
        </button>
        <button
          onClick={() => navigate(`/itineraries/edit/${itinerary.destinationId}/${itinerary.id}`)}
          className="btn btn-sm bg-blue-500 text-white"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="px-3 py-1 bg-red-500 text-white rounded text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ItineraryCard;
