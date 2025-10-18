import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePackageStore } from "../services/slices/packagesSlice";
import { useDestinationsStore } from "../services/slices/destinationsSlice";
import { CollectionTypes, QueueTypes } from "../services/types";
import type { Package } from "../services/types";
import HeroSection from "../components/destination/HeroSection";
import PackageForm from "../components/forms/PackageForm";
import { useAddEditWithImage } from "../components/common/useAddEditWithImage";

const AddEditPackagePage: React.FC = () => {
  const { destinationId, packageId } = useParams<{ destinationId: string; packageId?: string }>();
  const navigate = useNavigate();
  const destinations = useDestinationsStore((state) => state.destinations);
  const packages = usePackageStore((state) => state.packages);

  console.log("🏷️ AddEditPackagePage mount");
  console.log("URL params:", { destinationId, packageId });
  console.log("Current packages state:", packages);

  const currentDestination = destinations.find((d) => d.id === destinationId);
  const currentPackage: Package | undefined = packageId
    ? packages[destinationId ?? ""]?.find((p) => p.id === packageId)
    : undefined;

  const { handleImageSelection, handleSubmit } = useAddEditWithImage<Package>(CollectionTypes.Packages);

  // Local state for preview URL
  const [previewUrl, setPreviewUrl] = useState(currentPackage?.imageUrl);

  // Wrap the hook's handler to add preview + cleanup
  const handleSelectImage = async (file: File): Promise<string> => {
    const newPreview = await handleImageSelection(file);

    // Cleanup old blob if any
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(newPreview);

    return newPreview; // ✅ needed for the widget
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const onSubmit = async (formValues: Package) => {
    console.log("📝 Form submitted:", formValues);

    if (!destinationId) {
      console.error("❌ No destinationId in URL");
      return;
    }

    try {
      const queueType = packageId
        ? QueueTypes.UPDATE_PACKAGE
        : QueueTypes.CREATE_PACKAGE;

      console.log("⏳ Queueing package with queueType:", queueType);
      const tempId = await handleSubmit(formValues, queueType, destinationId);
      console.log("✅ Package queued with temp ID:", tempId);

      console.log("🔍 Packages after submission:", packages[destinationId ?? ""]);

      navigate(`/destinations/${destinationId}`);
    } catch (error) {
      console.error("❌ Submit failed:", error);
    }
  };

  if (!destinationId || !currentDestination) {
    console.log("⌛ Loading destination...");
    return <div>Loading destination...</div>;
  }

  const packagesForDestination = packages[destinationId] ?? [];
  console.log("📌 Rendering packages for this destination:", packagesForDestination);

  return (
    <div className="container mx-auto p-4">
      <HeroSection
        imageUrl={currentDestination?.imageUrl ?? ""}
        description={currentDestination?.description ?? ""}
        name={currentDestination?.name ?? ""}

      />
      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-4">
          {currentPackage ? "Edit Package" : "Add Package"}
        </h2>
        <PackageForm
          initialValues={currentPackage}
          destinationId={destinationId}
          onSubmit={onSubmit}
          onCancel={() => navigate(`/destinations/${destinationId}`)}
          onImageSelect={handleSelectImage}
        />
      </div>
    </div>
  );
};

export default AddEditPackagePage;
