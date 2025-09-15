import { BlockBlobClient } from "@azure/storage-blob";

export const uploadToAzureBlob = async (file: File, sasUrl: string): Promise<void> => {
  try {
    console.log("Uploading to Azure Blob:", sasUrl);
    const blobClient = new BlockBlobClient(sasUrl);
    await blobClient.uploadData(file, {
      blobHTTPHeaders: { blobContentType: "image/webp" },
      onProgress: (ev) => console.log(`Upload progress: ${ev.loadedBytes} bytes`)
    });
    console.log("✅ Upload complete");
  } catch (error) {
    console.error("❌ Upload failed:", error);
  }
};
