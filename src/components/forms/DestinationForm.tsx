import React, { useState } from "react";
import type { Destination } from "../../services/types";
import ImageUploadWidget from "../common/ImageUploadWidget";

interface Props {
  initialValues?: Destination;
  onSubmit: (dest: Destination) => void;
  onCancel: () => void;
  onImageSelect: (file: File) => Promise<string>;
}

// ✅ Key points to note / pattern:
// Page keeps a previewUrl state.
// Page wraps handleImageSelection from the hook to revoke the old blob.
// Cleanup URL.revokeObjectURL on unmount.
// Form just calls onImageSelect and sets its own imageUrl.

const DestinationForm: React.FC<Props> = ({ initialValues, onSubmit, onCancel, onImageSelect }) => {
  const [name, setName] = useState(initialValues?.name || "");
  const [area, setArea] = useState(initialValues?.area || "");
  const [country, setCountry] = useState(initialValues?.country || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [imageUrl, setImageUrl] = useState(initialValues?.imageUrl || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...initialValues,
      name,
      area,
      country,
      description,
      imageUrl,
    } as Destination);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-semibold">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
      </div>

      <div>
        <label className="block font-semibold">Area</label>
        <input
          type="text"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block font-semibold">Country</label>
        <input
          type="text"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block font-semibold">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          className="w-full border rounded p-2"
        />
      </div>
      <div className="text-sm text-gray-500 text-right">
        {description.length} / 500 characters
      </div>
      <div>
        <div>
          <label className="block font-semibold">Image</label>
          <ImageUploadWidget
            initialUrl={imageUrl}
            onSelect={async (file: File): Promise<string> => {
              const previewUrl = await onImageSelect(file); // calls parent
              setImageUrl(previewUrl);                      // updates local state
              return previewUrl;                            // returns to ImageUpload
            }}
          />
        </div>

        {imageUrl && (
          <div className="mt-2">
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full max-w-xs rounded shadow"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
      </div>

      <div className="flex gap-4 mt-4">
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
          Save
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default DestinationForm;
