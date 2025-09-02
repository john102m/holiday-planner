import React from "react";
import { useNavigate } from "react-router-dom";
import type { Package } from "../../services/types";
import { useStore } from "../../services/store";

interface Props {
  pkg: Package;
  destinationId: string;
}

const PackageCard: React.FC<Props> = ({ pkg, destinationId }) => {
  const navigate = useNavigate();
  const removePackage = useStore((state) => state.removePackage);

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${pkg.name}"?`)) {
      removePackage(destinationId, pkg.id);
      // optionally: show a toast or feedback
      console.log(`Deleted package ${pkg.name}`);
    }
  };

  return (
    <div className="card">
      {pkg.imageUrl && <img src={pkg.imageUrl} alt={pkg.name} className="card-img" />}

      <div className="card-body">
        <h3 className="card-title">{pkg.name}</h3>
        <p className="card-text">{pkg.description}</p>
        <div className="card-footer flex justify-between items-center">
          <span>{pkg.nights ?? ""} nights</span>
          <span>{pkg.price ? `$${pkg.price}` : ""}</span>
        </div>

        <div className="mt-2 flex gap-2">
          <button
            onClick={() => navigate(`/destinations/${destinationId}/packages/edit/${pkg.id}`)}
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
      </div>
    </div>
  );
};

export default PackageCard;

