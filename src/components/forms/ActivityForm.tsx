import React, { useState } from "react";
import type { Activity } from "../../services/types";

interface Props {
  initialValues?: Activity;
  destinationId: string;
  onSubmit: (act: Activity) => void;
  onCancel: () => void;
}

const ActivityForm: React.FC<Props> = ({ initialValues, destinationId, onSubmit, onCancel }) => {
  const [name, setName] = useState(initialValues?.name || "");
  const [details, setDetails] = useState(initialValues?.details || "");
  const [imageUrl, setImageUrl] = useState(initialValues?.imageUrl || "");
  const [votes, setVotes] = useState(initialValues?.votes || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...initialValues,
      name,
      details,
      imageUrl,
      votes,
      destinationId,
    } as Activity);
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
        <label className="block font-semibold">Details</label>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          className="w-full border rounded p-2"
        />
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

      <div>
        <label className="block font-semibold">Votes</label>
        <input
          type="number"
          value={votes}
          min={0}
          onChange={(e) => setVotes(Number(e.target.value))}
          className="border rounded p-2 w-24"
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

export default ActivityForm;
