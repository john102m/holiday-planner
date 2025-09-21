import { useEffect, useMemo } from "react";



export function isSpinnerVisible(entity: {
    isPendingUpload?: boolean;
    imageFile?: File;
}): boolean {
    return !!entity.isPendingUpload && !!entity.imageFile && navigator.onLine;
}

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



