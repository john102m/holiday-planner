import type { ImageEntity } from "../services/types";

export function formatDate(value: unknown): string {
  if (typeof value === "string") return value.slice(0, 10);
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return "";
}
// export function formatFriendlyDate(value: unknown, long: boolean = true): string {
//   try {
//     const date =
//       typeof value === "string" ? new Date(value) :
//         value instanceof Date ? value :
//           null;

//     if (!date || isNaN(date.getTime())) return "";

//     return date.toLocaleDateString("en-GB", {
//       day: "numeric",
//       month: long ? "long" : "short",
//       year: "numeric",
//     });
//   } catch {
//     return "";
//   }
// }
export function formatFriendlyDate(value: unknown, long: boolean = true): string {
  try {
    const date =
      typeof value === "string" ? new Date(value) :
      value instanceof Date ? value :
      null;

    if (!date || isNaN(date.getTime())) return "";

    const day = date.getDate();
    const month = date.toLocaleString("en-GB", {
      month: long ? "long" : "short",
    });
    const year = String(date.getFullYear()).slice(2); // '25' from 2025

    return `${day} ${month} '${year}`;
  } catch {
    return "";
  }
}

// export function formatFriendlyDate(date: Date, long = false) {
//   const day = date.getDate();
//   const month = date.toLocaleString("en-GB", {
//     month: long ? "long" : "short",
//   });
//   const year = String(date.getFullYear()).slice(2); // gets '25' from 2025

//   return `${day} ${month} '${year}`;
// }


export const finalizeImageUpload = (entity: ImageEntity, finalImageUrl: string): ImageEntity => {
  return {
    ...entity,
    imageUrl: finalImageUrl,       // point <img> directly at final URL
    isPendingUpload: false,
    hasImage: true,
    imageFile: undefined,
    previewBlobUrl: entity.previewBlobUrl, // keep blob until image loads
  };
};

export const stripSasToken = (url: string) => {
  const [baseUrl] = url.split('?');
  return baseUrl;
};
export function formatDateRange(start?: string, end?: string): string {
  if (!start && !end) return "";
  const opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" };

  const startStr = start ? new Date(start).toLocaleDateString("en-GB", opts) : "";
  const endStr = end ? new Date(end).toLocaleDateString("en-GB", opts) : "";

  return startStr && endStr ? `${startStr} → ${endStr}` : startStr || endStr;
}




