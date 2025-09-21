import React from "react";

import { useDestinationsStore } from "../../services/slices/destinationsSlice"
import { useNavigate } from "react-router-dom";
import type { Destination } from "../../services/types";
import DestinationSummaryCard from "../../components/admincards/DestinationSummaryCard";

const DestinationsGridSection: React.FC = () => {
  const destinationsState = useDestinationsStore((state) => state.destinations); // stable ref
  const destinations = React.useMemo(() => destinationsState, [destinationsState]);
  const navigate = useNavigate();

return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => navigate("/admin/destinations/add")}
        >
          + Add Destination
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {destinations.map((dest: Destination) => (
          <DestinationSummaryCard
            key={dest.id}
            destination={dest}
            showActions={true}
          />
        ))}
      </div>
    </div>
  );
};

export default DestinationsGridSection;
