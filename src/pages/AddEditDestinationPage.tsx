import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore, addOptimisticAndQueue } from "../services/store";
import { QueueTypes, CollectionTypes } from "../services/types";
import type { Destination, QueueType } from "../services/types";
import DestinationForm from "../components/forms/DestinationForm";
import imageCompression from "browser-image-compression";
import { postNameForSasToken } from "../services/apis/api"
import { BlockBlobClient } from "@azure/storage-blob";

const AddEditDestinationPage: React.FC = () => {

  const { destinationId } = useParams<{ destinationId?: string }>();
  const navigate = useNavigate();
  const destinations = useStore((state) => state.destinations);
  console.log("Destination ID: ", destinationId);
  const currentDestination: Destination | undefined = destinationId
    ? destinations.find((d) => d.id === destinationId)
    : undefined;

  const handleSubmit = async (dest: Destination) => {
    const queueType: QueueType = destinationId
      ? QueueTypes.UPDATE_DESTINATION
      : QueueTypes.CREATE_DESTINATION;

    const tempId = await addOptimisticAndQueue(
      CollectionTypes.Destinations,
      dest,
      queueType,
      "" // no nested collection needed
    );

    console.log("Destination saved with temp ID:", tempId);
    navigate("/admindashboard"); // or wherever your dashboard routes
  };

  const handleUpload = async (file: File): Promise<string> => {
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
        fileType: "image/webp",
      };

      const compressedFile = await imageCompression(file, options);
      console.log("Compressed file:", compressedFile);

      //const blobName = `${currentDestination?.name}-blob.webp`;
      const blobName = `${currentDestination?.name.toLowerCase().replace(/\s+/g, "-")}-blob.webp`;

      const { sasUrl } = await postNameForSasToken(blobName);
      console.log(blobName);
      const blobClient = new BlockBlobClient(sasUrl);

      await blobClient.uploadData(compressedFile, {
        blobHTTPHeaders: {
          blobContentType: "image/webp",
        },
      });
      //Updated Line for Cache Busting
      const publicUrl = `${sasUrl.split("?")[0]}?v=${Date.now()}`;

      return publicUrl;
    } catch (error) {
      console.error("Upload failed:", error);
      return "";
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
          onSubmit={handleSubmit}
          onCancel={() => navigate("/admin")}
          onImageUpload={handleUpload}
        />
      </div>
    </div>
  );
};

export default AddEditDestinationPage;
