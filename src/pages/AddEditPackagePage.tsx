import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "../services/store";
import type { Package } from "../services/types";
import HeroSection from "../components/destination/HeroSection";
import PackageForm from "../components/forms/PackageForm";

const AddEditPackagePage: React.FC = () => {
  const { destinationId, packageId } = useParams<{ destinationId: string; packageId?: string }>();
  const navigate = useNavigate();
  const destinations = useStore((state) => state.destinations);
  const packages = useStore((state) => state.packages);

  const currentDestination = destinations.find((d) => d.id === destinationId);
  const currentPackage: Package | undefined = packageId ? packages[destinationId ?? ""]?.find(p => p.id === packageId) : undefined;

  if (!currentDestination) return <div>Loading destination...</div>;

  const handleSubmit = (pkg: Package) => {
    // Save logic here, e.g., call API + update store
    console.log("Package saved", pkg);
    navigate(`/destinations/${destinationId}`);
  };

  return (
    <div className="container mx-auto p-4">
      {/* Reuse hero */}
      <HeroSection destination={currentDestination} />

      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-4">{currentPackage ? "Edit Package" : "Add Package"}</h2>
        <PackageForm
          initialValues={currentPackage}
          destinationId={destinationId ?? ""}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/destinations/${destinationId}`)}
        />
      </div>
    </div>
  );
};

export default AddEditPackagePage;
