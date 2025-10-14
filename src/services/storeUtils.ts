import { BlockBlobClient } from "@azure/storage-blob";

export const uploadToAzureBlob = async (file: File, sasUrl: string): Promise<void> => {
  try {
    console.log("Uploading to Azure Blob:", sasUrl);
    const blobClient = new BlockBlobClient(sasUrl);
    await blobClient.uploadData(file, {
      blobHTTPHeaders: {
        blobContentType: "image/webp",
        blobCacheControl: "no-cache, no-store, must-revalidate"
      }, // 👈 this is key
      onProgress: (ev) => console.log(`Upload progress: ${ev.loadedBytes} bytes`)
    });
    console.log("✅ Upload complete");
  } catch (error) {
    console.error("❌ Upload failed:", error);
  }
};


export async function requestPersistence(): Promise<void> {
  if (navigator.storage && navigator.storage.persist) {
    try {
      const granted = await navigator.storage.persist();
      console.log(granted ? "✅ Persistent storage granted" : "❌ Persistent storage denied");
    } catch (error) {
      console.error("Error requesting persistent storage:", error);
    }
  } else {
    console.log("⚠️ StorageManager API not available");
  }
}

