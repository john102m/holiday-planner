import React, { useState } from "react";
import type { Activity } from "../../services/types";
import ImageUploadWidget from "../common/ImageUploadWidget";
import { Tooltip } from "../Tooltip";
import FocalPointSelector from "../common/FocalPointSelector";
import { toFocalPoint, fromFocalPoint } from "../common/focalPointUtils"; // adjust path as needed

interface Props {
  initialValues?: Activity;
  destinationId: string;
  onSubmit: (act: Activity) => void;
  onCancel: () => void;
  onImageSelect: (file: File) => Promise<string>; // <-- new prop for image upload
}

const ActivityForm: React.FC<Props> = ({
  initialValues,
  destinationId,
  onSubmit,
  onCancel,
  onImageSelect,
}) => {
  const [name, setName] = useState(initialValues?.name || "");
  const [details, setDetails] = useState(initialValues?.details || "");
  const [isPrivate, setIsPrivate] = useState(initialValues?.isPrivate || false);
  const [votes, setVotes] = useState(initialValues?.votes || 0);
  const [imageUrl, setImageUrl] = useState(initialValues?.imageUrl || "");
  const [linkUrl, setLinkUrl] = useState(initialValues?.linkUrl || "");

  const [focalPoint, setFocalPoint] = useState<{ x: number; y: number } | undefined>(
    toFocalPoint(initialValues?.focalPointX, initialValues?.focalPointY)
  );


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: Activity = {
      ...initialValues,
      name,
      details,
      imageUrl,
      votes,
      destinationId,
      isPrivate,
      linkUrl,
      ...fromFocalPoint(focalPoint)
    };

    onSubmit(payload);
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
        <label className="block font-semibold">Link URL</label>
        <input
          type="url"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          className="w-full border rounded p-2"
          placeholder="https://example.com"
        />
      </div>

      <div>
        <label className="block font-semibold">Image</label>

        <ImageUploadWidget
          initialUrl={imageUrl}
          onSelect={async (file: File) => {
            const previewUrl = await onImageSelect(file);
            setImageUrl(previewUrl);
            return previewUrl;
          }}
        />
        {imageUrl && (
          <FocalPointSelector
            imageUrl={imageUrl}
            focalPoint={focalPoint}
            onChange={setFocalPoint}
          />
        )}

        {/* {imageUrl && (
          <div className="mt-2">
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full max-w-xs rounded shadow"
              onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
            />
          </div>
        )} */}
      </div>

      <div className="flex items-center gap-6">
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

        <div className="flex items-center mt-6">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="mr-2"
            />
            Private
          </label>
          <Tooltip maxWidth="200px" content="Private activities belong only to this trip. Uncheck to move to another trip.">
            <span className="text-gray-400 ml-2 cursor-help">ℹ️</span>
          </Tooltip>
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

export default ActivityForm;
