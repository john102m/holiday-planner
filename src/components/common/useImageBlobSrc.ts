import { useEffect, useMemo } from "react";
import placeholder from "/placeholder.png";

export function isSpinnerVisible(entity: {
    isPendingUpload?: boolean;
    imageFile?: File;
}): boolean {
    return !!entity.isPendingUpload && !!entity.imageFile && navigator.onLine;
}

export function useImageBlobSrc(entity: {
  imageFile?: File;
  previewBlobUrl?: string;
  imageUrl?: string;
  isPendingUpload?: boolean;
}): string {
  const { imageFile, previewBlobUrl, imageUrl, isPendingUpload } = entity;

  const imgSrc = useMemo(() => {
    if (isPendingUpload && imageFile instanceof File) {
      return URL.createObjectURL(imageFile);
    }
    if (previewBlobUrl) return previewBlobUrl;
    if (imageUrl && imageUrl.trim() !== "" && !imageUrl.includes("undefined")) {
      return imageUrl;
    }

    // ✅ Offline-safe fallback
    return navigator.onLine ? placeholder : "";
  }, [imageFile, previewBlobUrl, imageUrl, isPendingUpload]);

  useEffect(() => {
    if (isPendingUpload && imageFile instanceof File) {
      return () => {
        console.log("🗑 [useImageBlobSrc] Revoking blobUrl:", imgSrc);
        URL.revokeObjectURL(imgSrc);
      };
    }
  }, [imgSrc, isPendingUpload, imageFile]);

  return imgSrc;
}



