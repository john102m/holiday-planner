import type { ImageEntity } from "../services/types";

export function formatDate(value: unknown): string {
  if (typeof value === "string") return value.slice(0, 10);
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return "";
}
export function formatFriendlyDate(value: unknown): string {
  try {
    const date =
      typeof value === "string" ? new Date(value) :
      value instanceof Date ? value :
      null;

    if (!date || isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export const finalizeImageUpload = (
  entity: ImageEntity,
  sasUrl: string
): ImageEntity => {
  const { previewBlobUrl } = entity;
  setTimeout(() => {
    if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
  }, 5000); // delay cleanup by 5s
  return {
    ...entity,
    imageUrl: sasUrl,
    previewBlobUrl: previewBlobUrl, // keep temporarily
    isPendingUpload: false,
    imageFile: undefined
  };
};


