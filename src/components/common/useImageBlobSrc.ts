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
    const { imageFile, previewBlobUrl, imageUrl, isPendingUpload } = entity;
    const imgSrc = useMemo(() => {
        if (isPendingUpload && imageFile) {
            return URL.createObjectURL(imageFile);
        }
        if (previewBlobUrl) return previewBlobUrl;
        if (imageUrl && imageUrl.trim() !== "" && !imageUrl.includes("undefined")) {
            return imageUrl;
        }
        return "/placeholder.png";
    }, [imageFile, previewBlobUrl, imageUrl, isPendingUpload]);


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



