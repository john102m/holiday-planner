import React from "react";
import type { Itinerary } from "../../services/types";

interface Props {
  itinerary: Itinerary;
}

const ItineraryDetails: React.FC<Props> = ({ itinerary }) => {
  return (
    <section className="mt-6 max-w-4xl mx-auto px-2 sm:px-4">
      {/* Title */}
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
        {itinerary.name}
      </h2>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
        {itinerary.description}
      </p>

      {/* Tags */}
      {itinerary.tags && (
        <div className="flex flex-wrap gap-2 mb-6">
          {itinerary.tags.split(",").map(tag => (
            <span
              key={tag.trim()}
              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full whitespace-nowrap"
            >
              {tag.trim()}
            </span>
          ))}
        </div>
      )}
    </section>
  );
};

export default ItineraryDetails;
