import React from "react";
import { useNavigate } from "react-router-dom";
import type { Package } from "../../services/types";
import { CollectionTypes, QueueTypes } from "../../services/types";
import { addOptimisticAndQueue } from "../../services/store";

interface Props {
  pkg: Package;
  showActions?: boolean;
}

const PackageSummaryCard: React.FC<Props> = ({ pkg, showActions = true }) => {
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (window.confirm(`Delete "${pkg.name}"?`)) {
      await addOptimisticAndQueue(
        CollectionTypes.Packages,
        pkg,
        QueueTypes.DELETE_PACKAGE,
        pkg.destinationId
      );
    }
  };

  return (
    <div className="border rounded p-4 shadow-sm hover:shadow-md transition flex gap-4 items-start">
      {pkg.imageUrl && (
        <img
          src={pkg.imageUrl}
          alt={pkg.name}
          className="w-16 h-16 object-cover rounded"
        />
      )}

      <div className="flex-1">
        <h3 className="font-semibold text-md">{pkg.name}</h3>
        {pkg.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{pkg.description}</p>
        )}
        <div className="text-xs text-gray-500 mt-1 flex gap-4">
          {pkg.nights && <span>{pkg.nights} nights</span>}
          {pkg.price && <span>${pkg.price}</span>}
        </div>

        {showActions && (
          <div className="mt-2 flex gap-2">
            <button
              onClick={() =>
                navigate(`/destinations/${pkg.destinationId}/packages/edit/${pkg.id}`)
              }
              className="px-2 py-1 bg-gray-100 text-sm rounded hover:bg-gray-200"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
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

export default PackageSummaryCard;
