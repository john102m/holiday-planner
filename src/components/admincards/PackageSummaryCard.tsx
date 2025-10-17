import React from "react";
import { useNavigate } from "react-router-dom";
import type { Package } from "../../services/types";
import { CollectionTypes, QueueTypes } from "../../services/types";
import { addOptimisticAndQueue } from "../../services/store";
import placeholder from "/placeholder.png";
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

  const navigateToAddEdit = () => {
    navigate(`/destinations/${pkg.destinationId}/packages/edit/${pkg.id}`);
  };

return (
  <div
    className="border rounded-lg shadow-sm hover:shadow-md transition cursor-pointer flex flex-row gap-3 p-2 min-w-[300px]"
    onClick={navigateToAddEdit}
  >
    {/* Left: Image */}
    <div className="w-1/3 flex-shrink-0">
      <img
        src={pkg.imageUrl || placeholder}
        alt={pkg.name}
        className="w-full h-28 sm:h-full object-cover rounded"
        onError={(e) => {
          e.currentTarget.src = placeholder;
        }}
      />
    </div>

    {/* Right: Text */}
    <div className="sm:w-2/3 w-full flex flex-col justify-between">
      <div>
        <h3 className="font-semibold text-md">{pkg.name}</h3>
        {pkg.region && <p className="text-xs text-gray-500">{pkg.region}</p>}
        {pkg.description && (
          <p className="text-sm text-gray-600 line-clamp-1 mt-1">{pkg.description}</p>
        )}
        <div className="text-xs text-gray-500 flex gap-4 mt-1">
          {pkg.nights && <span>{pkg.nights} nights</span>}
          {pkg.price != null && <span>${pkg.price.toFixed(2)}</span>}
        </div>
      </div>

      {/* Bottom row: actions */}
      {showActions && (
        <div className="mt-2 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateToAddEdit();
            }}
            className="px-2 py-1 bg-gray-100 text-sm rounded hover:bg-gray-200"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
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
