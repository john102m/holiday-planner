import React from "react";
import type { DashboardItinerary, Itinerary } from "../services/types";

interface Props {
  itinerary: Partial<Itinerary> | DashboardItinerary;
  showRoleBadge?: boolean;

}

console.log("This is an itinerary mini card - as displayed on user dashboard");

const ItineraryCard: React.FC<Props> = ({ itinerary }) => {

  const name = itinerary.name || "Untitled Itinerary";
  const createdAt = itinerary.createdAt
    ? new Date(itinerary.createdAt).toLocaleDateString()
    : "-";
  console.log("Rendering....");
  return (
    <div className="border rounded-lg shadow hover:shadow-md transition overflow-hidden bg-white">
      {itinerary.imageUrl && (
        <img
          src={itinerary.imageUrl}
          alt={name}
          className="w-full h-32 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="font-semibold text-base line-clamp-1">{name}</h3>
        <p className="text-gray-500 text-sm">{createdAt}</p>
        {itinerary.tags && (
          <div className="flex flex-wrap gap-1 mt-2">
            {itinerary.tags.split(",").map((tag, i) => (
              <span
                key={i}
                className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full"
              >
                {tag.trim()}
              </span>
            ))}
          </div>
        )}
        {itinerary.description && (
          <p className="text-gray-600 text-sm line-clamp-2 mt-2">
            {itinerary.description}
          </p>
        )}
      </div>
    </div>


  );
};

export default ItineraryCard;
