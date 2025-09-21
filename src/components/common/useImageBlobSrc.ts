//import { useMemo, useEffect } from "react";
import type { ImageAttachable } from "../../services/types"; // Adjust path as needed


export function useImageBlobSrc(entity: ImageAttachable & { imageUrl?: string, previewBlobUrl?: string, isPendingUpload?: boolean }): string {
  // Prioritize preview blob if upload pending or imageFile present
  if (entity.isPendingUpload && entity.previewBlobUrl) {
    return entity.previewBlobUrl;
  }
  if (entity.imageFile) {
    return URL.createObjectURL(entity.imageFile);
  }
  if (entity.imageUrl && !entity.imageUrl.includes("undefined") && entity.imageUrl.trim() !== "") {
    return entity.imageUrl;
  }
  return "/placeholder.png";
}



// export function useImageBlobSrc(entity: ImageAttachable & { imageUrl?: string, isPendingUpload?: boolean }): string {
//     const previewUrl = useMemo(() => {
//         return entity.imageFile ? URL.createObjectURL(entity.imageFile) : entity.previewBlobUrl;
//     }, [entity.imageFile, entity.previewBlobUrl]);

//     const imageUrl = String(entity.imageUrl);
//     const isDisplayable = imageUrl && !imageUrl.includes("undefined") && imageUrl.trim() !== "";

//     // 🧠 Prioritize blob if upload is pending
//       const imgSrc = entity.isPendingUpload && previewUrl
//         ? previewUrl
//         : isDisplayable
//           ? imageUrl
//           : "/placeholder.png";

//     // const imgSrc =
//     //     (entity.isPendingUpload && (entity.previewBlobUrl ?? entity.imageUrl)) ||
//     //     (isDisplayable ? imageUrl : "/placeholder.png");



//     useEffect(() => {
//         return () => {
//             if (previewUrl && previewUrl.startsWith("blob:")) {
//                 URL.revokeObjectURL(previewUrl);
//             }
//         };
//     }, [previewUrl]);

//     return imgSrc;
// }


// export function useImageBlobSrc(entity: ImageAttachable & { imageUrl?: string }): string {
//   const previewUrl = useMemo(() => {
//     return entity.imageFile ? URL.createObjectURL(entity.imageFile) : entity.previewBlobUrl;
//   }, [entity.imageFile, entity.previewBlobUrl]);

//   const imageUrl = String(entity.imageUrl);
//   const isDisplayable = imageUrl && !imageUrl.includes("undefined") && imageUrl.trim() !== "";

//   const imgSrc = isDisplayable ? imageUrl : (previewUrl || "/placeholder.png");

//   useEffect(() => {
//     return () => {
//       if (previewUrl && previewUrl.startsWith("blob:")) {
//         URL.revokeObjectURL(previewUrl);
//       }
//     };
//   }, [previewUrl]);

//   return imgSrc;
// }
