// PackageCard.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import type { Package } from "../../services/types";
import { CollectionTypes, QueueTypes } from "../../services/types";
import { addOptimisticAndQueue } from "../../services/store";
import placeholder from "/placeholder.png";
interface Props {
  pkg: Package;
  destinationId: string;
  showActions?: boolean;
}

const PackageCard: React.FC<Props> = ({ pkg, destinationId, showActions }) => {
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${pkg.name}"?`)) {
      await addOptimisticAndQueue(
        CollectionTypes.Packages,
        pkg,
        QueueTypes.DELETE_PACKAGE,
        destinationId
      );
      console.log(`Queued deletion for package ${pkg.name}`);
    }
  };

  return (
    <div className="card">
      {pkg.imageUrl && <img
        src={pkg.imageUrl}
        alt={pkg.name}
        className="card-img"
        onError={(e) => {
          e.currentTarget.src = placeholder;
        }}
      />}
      <div className="card-body">
        <h3 className="card-title">{pkg.name}</h3>
        <p className="card-text">{pkg.description}</p>
        <div className="card-footer flex justify-between items-center">
          <span>{pkg.nights ?? ""} nights</span>
          <span>{pkg.price ? `$${pkg.price}` : ""}</span>
        </div>
        {showActions && (
          <div className="mt-2 flex gap-2">
            <button
              onClick={() =>
                navigate(`/destinations/${destinationId}/packages/edit/${pkg.id}`)
              }
              className="px-3 py-1 bg-gray-200 rounded text-sm"
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
        )}
      </div>
    </div>
  );
};

export default PackageCard;
