// ItineraryCard.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import type { Itinerary } from "../../services/types";
//import { useStore } from "../../services/store";

interface Props {
  itinerary: Itinerary;
  destinationId: string;
}

const ItineraryCard: React.FC<Props> = ({ itinerary, destinationId }) => {
  const navigate = useNavigate();
  //const removeItinerary = useStore((state) => state.removeItinerary);



  return (
    <div className="card">
      {itinerary.imageUrl && (
        <img src={itinerary.imageUrl} alt={itinerary.name} className="card-img" />
      )}

      <div className="card-body">
        <h3 className="card-title">{itinerary.name}</h3>
        <p className="card-text">{itinerary.description}</p>
        <div className="card-footer flex justify-between items-center">
          <span>{itinerary.createdAt ? `${itinerary.createdAt}` : ""}</span>
          <span>{itinerary.createdAt ? `${itinerary.createdAt}` : ""}</span>
        </div>

        <div className="mt-2 flex gap-2">
          <button
            onClick={() => navigate(`/destinations/${destinationId}/itineraries/edit/${itinerary.id}`)}
            className="px-3 py-1 bg-gray-200 rounded text-sm"
          >
            Edit
          </button>
          <button

            className="px-3 py-1 bg-red-500 text-white rounded text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItineraryCard;
