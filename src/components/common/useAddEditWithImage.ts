import { useState } from "react";
import imageCompression from "browser-image-compression";
import { addOptimisticAndQueue } from "../../services/store";
import type { CollectionType, QueueType, ImageEntity } from "../../services/types";

export function useAddEditWithImage<T extends ImageEntity>(collection: CollectionType) {
  const [imageFile, setImageFile] = useState<File | undefined>();
  const [previewUrl, setPreviewUrl] = useState<string | undefined>();

// 1️⃣ The flow intended
// User selects an image in the modal → useAddEditWithImage.handleImageSelection creates a blob URL (URL.createObjectURL)
//  → stored in previewUrl.
// User submits the form while offline → handleSubmit creates a queued optimistic entry
//  → should contain the blob URL so DiaryEntryCard can display it immediately.

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
    //const queuePayload: T = { ...formValues, imageFile, hasImage: !!imageFile };
    //const baseImageUrl = formValues.imageUrl?.split('?')[0];
    //const imageUrlWithCacheBuster = `${baseImageUrl}?${crypto.randomUUID()}`;
    console.log("Thank you for submitting image: ", previewUrl);
    const queuePayload: T = {
      ...formValues,
      imageFile,
      hasImage: !!imageFile,
      imageUrl: formValues.imageUrl ?? undefined, //previewUrl,//imageUrlWithCacheBuster, // leave this to be updated by backend
      previewBlobUrl: previewUrl,
      isPendingUpload: true
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
    //const tempId = await addOptimisticAndQueue(collection, queuePayload, queueType, nestedId);

    return queuePayload;
  };

  return { imageFile, previewUrl, handleImageSelection, handleSubmit, setPreviewUrl };
}
