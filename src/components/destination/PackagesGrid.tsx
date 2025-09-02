// components/destination/PackagesGrid.tsx
import React from "react";
import type { Package } from "../../services/types";
import PackageCard from "../cards/PackageCard";

interface Props {
  packages: Package[];
  destinationId: string;
}

const PackagesGrid: React.FC<Props> = ({ packages, destinationId }) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {packages.map((pkg) => (
        <PackageCard key={pkg.id} pkg={pkg} destinationId={destinationId} />
      ))}
    </div>
  );
};


export default PackagesGrid;

// Notes:
// Mobile-first grid: 1 → 2 → 3 columns
// Uses PackageCard for consistency with other tabs