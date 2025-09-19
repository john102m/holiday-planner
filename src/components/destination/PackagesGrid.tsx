import React from "react";
import type { Package } from "../../services/types";
import { usePackageStore } from "../../services/slices/packagesSlice";
import PackageCard from "../cards/PackageCard";

interface Props {
  destinationId: string;
  tripId?: string;
}

// ✅ Define a single, stable empty array reference.
// This avoids creating a new [] on every render,
// which was causing Zustand + React to think state changed → infinite re-renders.
const empty: Package[] = [];

const PackagesGrid: React.FC<Props> = ({ destinationId, tripId }) => {

   console.log("Hello  from the packages grid");
  // ✅ Selector now always returns either the actual packages array
  // or the stable `empty` array reference above.
  // Because `empty` never changes identity, React won’t trigger
  // unnecessary re-renders or fall into an infinite loop.
  const packages = usePackageStore(
    (state) => state.packages[destinationId] ?? empty
  );
  // ✅ If empty → show placeholder message.
  if (packages.length === 0) return <div>No packages added yet.</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl px-2 sm:px-4">

      {/* ✅ Safe to map now — if no packages exist,
          `packages` is just the stable `empty` array (length 0). */}
      {packages.map((pkg) => (
        // PackagesGrid.tsx
        <PackageCard
          key={pkg.id}
          pkg={pkg}
          destinationId={destinationId}
          showActions={!!tripId} // only show buttons if viewing within a trip
        />

      ))}
    </div>
  );
};

export default PackagesGrid;
