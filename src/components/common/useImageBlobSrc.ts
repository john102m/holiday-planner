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


    // 🧠 What Is a Side Effect?
    // Side effects include:
    // Fetching data from an API
    // Subscribing to a WebSocket or event listener
    // Updating the document title
    // Setting timers (setTimeout, setInterval)
    // Manually manipulating the DOM

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

    // The first argument is a callback that runs after render
    // The second argument is a dependency array:
    // [] → runs only once (on mount)
    // [someValue] → runs when someValue changes
    // No array → runs after every render

    useEffect(() => {
        // This code runs after the component renders
        console.log("Component mounted or updated");

        return () => {
            // Optional cleanup logic
            console.log("Component will unmount or re-run effect");
        };
    }, []);


    // Render	React builds the virtual DOM from JSX
    // Commit	React updates the real DOM
    // useEffect runs	After the DOM is updated and visible

    return imgSrc;
}



