import React, { useState } from "react";
import type { Itinerary } from "../../services/types";

interface Props {
  initialValues?: Itinerary;
  destinationId: string;
  tripId?: string
  onSubmit: (it: Itinerary) => void;
  onCancel: () => void;
}
console.log("Itinerary Form");
const DEFAULT_IMAGE = "https://myjohnblogimages.blob.core.windows.net/images/morocco.webp";

const ItineraryForm: React.FC<Props> = ({ initialValues, destinationId, tripId, onSubmit, onCancel }) => {
  const [name, setName] = useState(initialValues?.name || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  console.log("you are here");
  const [tags, setTags] = useState(initialValues?.tags || "");
  const [slug, setSlug] = useState(initialValues?.slug || "");
  const [imageUrl, setImageUrl] = useState(initialValues?.imageUrl || "");


 console.log(initialValues);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const sanitizedTags = tags.replace(/'/g, "").trim(); // remove stray single quotes

    onSubmit({
      ...initialValues,
      name,
      description,
      tripId,
      tags: sanitizedTags,
      slug,
      imageUrl: imageUrl || DEFAULT_IMAGE,
      destinationId,
    } as Itinerary);
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
        <label className="block font-semibold">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block font-semibold">Tags (comma separated)</label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full border rounded p-2"
          placeholder="e.g. beach, hiking, food"
        />
      </div>

      <div>
        <label className="block font-semibold">Slug</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full border rounded p-2"
          placeholder="e.g. fuerteventura-beach-escape"
        />
      </div>

      <div>
        <label className="block font-semibold">Image URL</label>
        <input
          type="text"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full border rounded p-2"
          placeholder="Paste blob URL or leave blank for default"
        />
        <div className="mt-2">
          <img
            src={imageUrl || DEFAULT_IMAGE}
            alt="Itinerary preview"
            className="w-full h-40 object-cover rounded"
          />
        </div>
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

export default ItineraryForm;
