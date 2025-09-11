import React, { useState } from "react";

interface Props {
  onUpload: (file: File) => Promise<string>; // now returns the uploaded URL
  initialUrl?: string;
}

const ImageUpload: React.FC<Props> = ({ onUpload, initialUrl }) => {
  const [preview, setPreview] = useState(initialUrl || "");
  const [dragging, setDragging] = useState(false);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const uploadedUrl = await onUpload(file);
      setPreview(uploadedUrl);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const uploadedUrl = await onUpload(file);
      setPreview(uploadedUrl);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed p-4 rounded ${dragging ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
    >
      {preview && <img src={preview} alt="Preview" className="h-32 object-cover mb-2 rounded" />}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="block"
      />
      <p className="text-sm text-gray-500 mt-2">Drag & drop or tap to upload</p>
    </div>
  );
};

export default ImageUpload;



{/* 
 how to use...

    <ImageUpload
        initialUrl={imageUrl}
        onUpload={(url) => setImageUrl(url)}
    /> 

    🧠 Bonus Ideas

    Add a loading spinner or progress bar during upload
    Support drag-and-drop or paste-from-clipboard
    Store metadata (e.g., alt text, source attribution)
    Hook into your queue system if uploads are async and need syncing

    🚀 What’s Missing (but easy to add)

    Actual upload logic: Replace const uploadedUrl = "" with a real upload function
    Loading spinner: Show feedback while uploading
    Error handling: Gracefully handle failed uploads
    Multiple image support: Extend to handle galleries or image arrays
    Clipboard paste support: Add onPaste to accept pasted images

import imageCompression from 'browser-image-compression';

const processFile = async (file: File) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1024,
    fileType: 'image/webp',
  };
  const compressedFile = await imageCompression(file, options);
  const uploadedUrl = await uploadToAzureBlob(compressedFile);
  setPreview(uploadedUrl);
  onUpload(uploadedUrl);
};
import imageCompression from 'browser-image-compression';

const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const imageFile = event.target.files?.[0];
  if (!imageFile) return;

  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1024,
    useWebWorker: true,
    fileType: 'image/webp', // Optional: convert to WebP
  };

  try {
    const compressedFile = await imageCompression(imageFile, options);
    // Upload compressedFile to Azure Blob or wherever you store images
  } catch (error) {
    console.error("Compression failed:", error);
  }
};



*/}
