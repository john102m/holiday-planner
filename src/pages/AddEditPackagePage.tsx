import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore, addOptimisticAndQueue } from "../services/store";
import { usePackageStore } from "../services/slices/packagesSlice";
import { QueueTypes, CollectionTypes } from "../services/types";

import type { Package, QueueType } from "../services/types";
import HeroSection from "../components/destination/HeroSection";
import PackageForm from "../components/forms/PackageForm";

const AddEditPackagePage: React.FC = () => {
  const { destinationId, packageId } = useParams<{ destinationId: string; packageId?: string }>();
  const navigate = useNavigate();
  const destinations = useStore((state) => state.destinations);
  const packages = usePackageStore((state) => state.packages);

  const currentDestination = destinations.find((d) => d.id === destinationId);
  const currentPackage: Package | undefined = packageId
    ? packages[destinationId ?? ""]?.find(p => p.id === packageId)
    : undefined;

  if (!destinationId || !currentDestination) {
    return <div>Loading destination...</div>;
  }
  const handleSubmit = async (pkg: Package) => {
    const queueType: QueueType = packageId
      ? QueueTypes.UPDATE_PACKAGE
      : QueueTypes.CREATE_PACKAGE;

    // Use the generic helper to optimistically add + queue
    const tempId = await addOptimisticAndQueue(
      CollectionTypes.Packages, // collection
      pkg,                       // package object
      queueType,                 // queue type
      currentDestination.id      // destination ID for nested collection
    );

    console.log("Temporary ID assigned:", tempId);

    navigate(`/destinations/${destinationId}`);
  };

  return (
    <div className="container mx-auto p-4">
      <HeroSection destination={currentDestination} />

      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-4">{currentPackage ? "Edit Package" : "Add Package"}</h2>
        <PackageForm
          initialValues={currentPackage}
          destinationId={destinationId}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/destinations/${destinationId}`)}
        />
      </div>
    </div>
  );
};

export default AddEditPackagePage;
