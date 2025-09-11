import React from "react";
import { useStore } from "../../services/store";
import { useNavigate } from "react-router-dom";
import type { Package } from "../../services/types";
import PackageSummaryCard from "../../components/admincards/PackageSummaryCard"

const PackagesGridSection: React.FC = () => {
  const packagesObj = useStore((state) => state.packages); // stable reference
  const packages = React.useMemo(
    () => Object.values(packagesObj).flat(),
    [packagesObj]
  );
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => navigate("/admin/packages/add")}
        >
          + Add Package
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map((pkg: Package) => (
          <PackageSummaryCard key={pkg.id} pkg={pkg} />
        ))}
      </div>
    </div>
  );
};

export default PackagesGridSection;
