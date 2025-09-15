🧭 Destination Creation & Image Upload Flow
📦 Overview
This system enables users to create or edit a Destination entity with an optional image. The image is compressed, previewed, and uploaded deferred via a queue, supporting offline-first behavior and optimistic UI updates.

🧩 Key Features
Drag-and-drop, file input, and clipboard paste for image selection

Image compression using browser-image-compression

Preview before upload using URL.createObjectURL

Deferred image upload via Azure Blob Storage

Queue-based optimistic updates using Zustand

Modular architecture for reuse across other entities

🗂️ Code Files Involved
File	Purpose
AddEditDestinationPage.tsx	Main page for creating/editing destinations
DestinationForm.tsx	Form component for destination fields and image upload
ImageUpload.tsx	UI component for drag/drop, file input, and preview
store.ts	Zustand store with queue logic and handlers
types.ts	Type definitions for Destination, QueuedAction, etc.
api.ts	API functions including createDestinationWithSas()
uploadToAzureBlob.ts (optional)	Utility for uploading to Azure Blob
External: browser-image-compression	Image compression library
External: @azure/storage-blob	Azure SDK for blob upload
🧠 Models & Types
Destination (extended)
ts
export interface ImageAttachable {
  imageFile?: File;
  hasImage?: boolean;
}

export interface Destination extends ImageAttachable {
  id?: string;
  name: string;
  area?: string;
  country?: string;
  description: string;
  imageUrl?: string;
  createdBy?: string;
  createdAt?: string;
}
QueuedAction
ts
export interface QueuedAction {
  id: string;
  type: QueueType;
  payload: Entity;
  tempId?: string;
}
🔄 Flow Breakdown
1. Image Selection & Preview
Component: ImageUpload.tsx

User drops/selects/pastes an image

Calls onSelect(file) → compresses image

Returns preview URL via URL.createObjectURL

Stores compressed image in imageFile state

2. Form Submission
Component: AddEditDestinationPage.tsx

handleSubmit() bundles form values + imageFile

Calls addOptimisticAndQueue() with full payload

3. Queue Processing
File: store.ts

Function: handleCreateDestination(action)

Calls createDestinationWithSas() to create the destination and get a sasUrl

Replaces optimistic entry in store

Uploads image via BlockBlobClient if imageFile exists

🐞 Bug Encountered & Fix
❌ Issue
Image preview worked

Destination was created

SAS URL returned

Image upload skipped → Blob 404

🔍 Cause
imageFile was stored in memory (setImageFile)

But it wasn’t passed correctly into the queued payload

formValues overwrote imageFile with undefined

✅ Fix
ts
const queuePayload: Destination = {
  ...formValues,
  imageFile, // explicitly override
  hasImage: imageFile instanceof File,
};
✅ Logging Added
ts
console.log("📦 [Queue] Processing CREATE_DESTINATION for:", dest.name);
console.log("✅ [API] Destination created:", saved);
console.log("🔗 [API] Received SAS URL:", sasUrl);
console.log("📤 [Upload] Uploading image to Azure Blob...");
console.log("✅ [Upload] Image upload complete");
🧠 Design Wins
Deferred upload supports offline/patchy networks

Preview-first UX keeps users confident

Queue-based architecture is modular and extensible

Bug was caught early and resolved cleanly

🔮 Future Extensions
Support image updates in UPDATE_DESTINATION flow

Add retry logic for failed uploads

Extend to other entities like Activity, Package

Add UI indicators for “image queued” or “upload pending”

Add post-upload patch to update imageUrl if needed