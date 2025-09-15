import React from "react";
import { addOptimisticAndQueue } from "../../services/store";
import { useDestinationsStore } from "../../services/slices/destinationsSlice"
import { CollectionTypes, QueueTypes } from "../../services/types";
import { useNavigate } from "react-router-dom";
import type { Destination } from "../../services/types";


const DestinationsGridSection: React.FC = () => {
  const destinationsState = useDestinationsStore((state) => state.destinations); // stable ref
  const destinations = React.useMemo(() => destinationsState, [destinationsState]);
  const navigate = useNavigate();

  const handleDelete = async (dest: Destination) => {
    if (window.confirm(`Are you sure you want to delete "${dest.name}"?`)) {
      await addOptimisticAndQueue(
        CollectionTypes.Activities,
        dest,
        QueueTypes.DELETE_DESTINATION,
        ""
      );
      console.log(`Queued deletion for activity ${dest.name}`);
    }
  };
  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => navigate("/destinations/edit")}
        >
          + Add Destination
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {destinations.map((dest: Destination) => (
          <div key={dest.id} className="border rounded p-4 shadow hover:shadow-lg transition">
            <img
              src={dest.imageUrl || "/placeholder.png"}
              alt={dest.name || "Untitled"}
              className="w-full h-40 object-cover rounded mb-2"
            />
            <h3 className="font-semibold text-lg">{dest.name}</h3>
            <p className="text-gray-600 text-sm mb-2">{dest.country || dest.area}</p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => navigate(`/destinations/edit/${dest.id}`)}
                className="px-2 py-1 bg-yellow-500 text-white rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(dest)}
                
                className="px-2 py-1 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DestinationsGridSection;
