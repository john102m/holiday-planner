import { useEffect, useMemo } from "react";

export function useImageBlobSrc(
  entity: {
    imageFile?: File;
    previewBlobUrl?: string;
    imageUrl?: string;
    isPendingUpload?: boolean;
  }
): string {
  const imgSrc = useMemo(() => {
    console.log("💡 [useImageBlobSrc] Computing imgSrc for entity:", entity);

    // ✅ Online upload in progress: generate a fresh blob from File
    if (entity.isPendingUpload && entity.imageFile) {
      const blobUrl = URL.createObjectURL(entity.imageFile);
      console.log("📤 [useImageBlobSrc] Using fresh blob from imageFile:", blobUrl);
      return blobUrl;
    }

    // ✅ Offline optimistic blob preview
    if (entity.previewBlobUrl) {
      console.log("🟡 [useImageBlobSrc] Using previewBlobUrl:", entity.previewBlobUrl);
      return entity.previewBlobUrl;
    }

    // ✅ Uploaded / final image URL
    if (entity.imageUrl && !entity.imageUrl.includes("undefined") && entity.imageUrl.trim() !== "") {
      console.log("🟢 [useImageBlobSrc] Using final imageUrl:", entity.imageUrl);
      return entity.imageUrl;
    }

    // ✅ Fallback placeholder
    console.log("⚪ [useImageBlobSrc] No image found, using placeholder");
    return "/placeholder.png";
  }, [entity]);
   // }, [entity.imageFile, entity.previewBlobUrl, entity.imageUrl, entity.isPendingUpload]);

  // Cleanup ephemeral blobs generated from File
  useEffect(() => {
    if (entity.isPendingUpload && entity.imageFile) {
      const blobUrl = imgSrc;
      return () => {
        console.log("🗑 [useImageBlobSrc] Revoking blobUrl:", blobUrl);
        URL.revokeObjectURL(blobUrl);
      };
    }
    return;
  }, [imgSrc, entity.isPendingUpload, entity.imageFile]);

  return imgSrc;
}


// export function useImageBlobSrc(entity: ImageAttachable & { imageUrl?: string, previewBlobUrl?: string, isPendingUpload?: boolean }): string {
//   // Prioritize preview blob if upload pending or imageFile present
//   if (entity.isPendingUpload && entity.previewBlobUrl) {
//     return entity.previewBlobUrl;
//   }
//   if (entity.imageFile) {
//     return URL.createObjectURL(entity.imageFile);
//   }
//   if (entity.imageUrl && !entity.imageUrl.includes("undefined") && entity.imageUrl.trim() !== "") {
//     return entity.imageUrl;
//   }
//   return "/placeholder.png";
// }



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
