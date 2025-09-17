import React from "react";
import type { Package } from "../services/types";

interface Props {
  package: Package;
}

const PackageCard: React.FC<Props> = ({ package: pkg }) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition">
      {pkg.imageUrl && (
        <img
          src={pkg.imageUrl}
          alt={pkg.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.png";
          }}
        />
      )}
      <div className="p-4">
        <h3 className="font-semibold text-lg">{pkg.name}</h3>
        <p className="text-gray-500 text-sm">{pkg.region}</p>
        {pkg.description && (
          <p className="mt-2 text-gray-700 text-sm">{pkg.description}</p>
        )}
        {pkg.price !== undefined && (
          <p className="mt-2 font-bold">${pkg.price.toFixed(2)}</p>
        )}
      </div>
    </div>
  );
};

export default PackageCard;
