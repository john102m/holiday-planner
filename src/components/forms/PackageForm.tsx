import React, { useState } from "react";
import type { Package } from "../../services/types";

interface Props {
  initialValues?: Package;      // for edit
  destinationId: string;        // pre-fill for context
  onSubmit: (pkg: Package) => void;
  onCancel: () => void;
}

const PackageForm: React.FC<Props> = ({ initialValues, destinationId, onSubmit, onCancel }) => {
  const [name, setName] = useState(initialValues?.name || "");
  const [region, setRegion] = useState(initialValues?.region || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [nights, setNights] = useState(initialValues?.nights || 1);
  const [price, setPrice] = useState(initialValues?.price || 0);
  const [imageUrl, setImageUrl] = useState(initialValues?.imageUrl || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...initialValues,
      name,
      region,
      description,
      nights,
      price,
      imageUrl,
      destinationId, // link package to current destination
    } as Package);
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
        <label className="block font-semibold">Region</label>
        <input
          type="text"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
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

      <div className="flex gap-4">
        <div>
          <label className="block font-semibold">Nights</label>
          <input
            type="number"
            value={nights}
            min={1}
            onChange={(e) => setNights(Number(e.target.value))}
            className="border rounded p-2 w-24"
          />
        </div>

        <div>
          <label className="block font-semibold">Price</label>
          <input
            type="number"
            value={price}
            min={0}
            step={0.01}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="border rounded p-2 w-32"
          />
        </div>
      </div>

      <div>
        <label className="block font-semibold">Image URL</label>
        <input
          type="text"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full border rounded p-2"
        />
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

export default PackageForm;
