import React from "react";
import type { Package } from "../../services/types";
import { usePackageStore } from "../../services/slices/packagesSlice";
import PackageCard from "../cards/PackageCard";

interface Props {
  destinationId: string;
}

// ✅ Define a single, stable empty array reference.
// This avoids creating a new [] on every render,
// which was causing Zustand + React to think state changed → infinite re-renders.
const empty: Package[] = [];

const PackagesGrid: React.FC<Props> = ({ destinationId }) => {
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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* ✅ Safe to map now — if no packages exist,
          `packages` is just the stable `empty` array (length 0). */}
      {packages.map((pkg) => (
        <PackageCard key={pkg.id} pkg={pkg} destinationId={destinationId} />
      ))}
    </div>
  );
};

export default PackagesGrid;
