import React, { useState } from "react";
import type { Destination } from "../../services/types";
import ImageUpload from "../common/ImageUpload";

interface Props {
  initialValues?: Destination;
  onSubmit: (dest: Destination) => void;
  onCancel: () => void;
  onImageUpload: (file: File) => Promise<string>;
}

const DestinationForm: React.FC<Props> = ({ initialValues, onSubmit, onCancel, onImageUpload }) => {
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
          className="w-full border rounded p-2"
        />
      </div>

      <div>
        <div>
          <label className="block font-semibold">Image</label>
          <ImageUpload
            initialUrl={imageUrl}
            onUpload={async (file: File): Promise<string> => {
              const uploadedUrl = await onImageUpload(file); // calls parent
              setImageUrl(uploadedUrl);                      // updates local state
              return uploadedUrl;                            // returns to ImageUpload
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
