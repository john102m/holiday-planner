import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDestinationsStore } from "../services/slices/destinationsSlice";
import { CollectionTypes, QueueTypes } from "../services/types";
import type { Destination } from "../services/types";
import DestinationForm from "../components/forms/DestinationForm";
import { useAddEditWithImage } from "../components/common/useAddEditWithImage";

const AddEditDestinationPage: React.FC = () => {
  const { destinationId } = useParams<{ destinationId?: string }>();
  const navigate = useNavigate();
  const destinations = useDestinationsStore((state) => state.destinations);

  const currentDestination: Destination | undefined = destinationId
    ? destinations.find((d) => d.id === destinationId)
    : undefined;

  const { handleImageSelection, handleSubmit } = useAddEditWithImage<Destination>(
    CollectionTypes.Destinations
  );

  // --- Local preview state ---
  const [previewUrl, setPreviewUrl] = useState(currentDestination?.imageUrl);

  // --- Wrap the hook to manage preview + revoke previous blob ---
  const handleSelectImage = async (file: File) => {
    const newPreview = await handleImageSelection(file);

    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(newPreview);
    return newPreview;
  };

  // --- Cleanup on unmount ---
  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const onSubmit = async (formValues: Destination) => {
    try {
      const queueType = destinationId
        ? QueueTypes.UPDATE_DESTINATION
        : QueueTypes.CREATE_DESTINATION;

      const tempId = await handleSubmit(formValues, queueType);
      console.log("Destination queued with temp ID:", tempId);

      navigate("/admindashboard");
    } catch (error) {
      console.error("Submit failed:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-4">
          {currentDestination ? "Edit Destination" : "Add Destination"}
        </h2>
        <DestinationForm
          initialValues={currentDestination}
          onSubmit={onSubmit}
          onCancel={() => navigate("/admin")}
          onImageSelect={handleSelectImage}
        />
      </div>
    </div>
  );
};

export default AddEditDestinationPage;
