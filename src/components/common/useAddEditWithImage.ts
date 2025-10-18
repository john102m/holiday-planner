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

    // Safely revoke old blob URL
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    // ✅ Guard before creating new blob URL
    const blobUrl = compressedFile instanceof File
      ? URL.createObjectURL(compressedFile)
      : undefined;

    setPreviewUrl(blobUrl);
    return blobUrl ?? "";
  };

  const handleSubmit = async (formValues: T, queueType: QueueType, nestedId: string = "") => {

    console.log("Thank you for submitting image: ", previewUrl);
    const queuePayload: T = {
      ...formValues,
      imageFile,
      hasImage: !!imageFile,
      imageUrl: formValues.imageUrl ?? undefined, //previewUrl,//imageUrlWithCacheBuster, // leave this to be updated by backend
      previewBlobUrl: previewUrl,
      isPendingUpload: true
    };

    if (queuePayload.isOptimistic && queuePayload.hasError) {
      // Strip ID and requeue as CREATE
      console.log("Stripping ID and requeing as CREATE");
      queuePayload.id = undefined;
      queuePayload.isOptimistic = false;
      queuePayload.hasError = false;

    };


    console.log("addOptimisticAndQueue for payload: ", queuePayload);
    // Fire async queue but don’t await it — modal can close immediately
    (async () => {
      try {
        await addOptimisticAndQueue(collection, queuePayload, queueType, nestedId);
      } catch (err) {
        console.error("Queue error:", err);
      }
    })();

    // Queue it optimistically

    return queuePayload;
  };

  return { imageFile, previewUrl, handleImageSelection, handleSubmit, setPreviewUrl };
}
