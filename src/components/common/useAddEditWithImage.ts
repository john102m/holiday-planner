import { useState } from "react";
import imageCompression from "browser-image-compression";
import { addOptimisticAndQueue } from "../../services/store";
import type { CollectionType, QueueType, ImageEntity } from "../../services/types";

export function useAddEditWithImage<T extends ImageEntity>(collection: CollectionType) {
  const [imageFile, setImageFile] = useState<File | undefined>();
  const [previewUrl, setPreviewUrl] = useState<string | undefined>();

  const handleImageSelection = async (file: File): Promise<string> => {
    const compressedBlob = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
      fileType: "image/webp",
    });

    const compressedFile = new File([compressedBlob], file.name, {
      type: "image/webp",
      lastModified: Date.now(),
    });

    setImageFile(compressedFile);

    // Show immediate blob preview
    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    const blobUrl = URL.createObjectURL(compressedFile);
    setPreviewUrl(blobUrl);
    return blobUrl;
  };

  const handleSubmit = async (formValues: T, queueType: QueueType, nestedId: string = "") => {
    // Include the image file in the queued payload
    const queuePayload: T = { ...formValues, imageFile, hasImage: !!imageFile };

    // Queue it optimistically
    const tempId = await addOptimisticAndQueue(collection, queuePayload, queueType, nestedId);

    return tempId;
  };

  return { imageFile, previewUrl, handleImageSelection, handleSubmit, setPreviewUrl };
}
