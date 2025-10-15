import React, { useState } from "react";
import type { Destination, UserTrip } from "../../services/types";
import ImageUploadWidget from "../common/ImageUploadWidget";
import { formatDate } from "../utilities";
interface Props {
  initialValues?: UserTrip;
  destinationId: string;
  destinations: Destination[];
  userId: string;
  onSubmit: (trip: UserTrip) => void;
  onCancel: () => void;
  onDestinationChange?: (id: string) => void; // <-- new
  onImageSelect?: (file: File) => Promise<string>;
}

const TripForm: React.FC<Props> = ({
  initialValues,
  destinationId,
  destinations,
  userId,
  onSubmit,
  onCancel,
  onDestinationChange,
  onImageSelect
}) => {
  const [name, setName] = useState(initialValues?.name || "");
  const [status, setStatus] = useState(initialValues?.status || "Upcoming");
  const [startDate, setStartDate] = useState(formatDate(initialValues?.startDate));
  const [endDate, setEndDate] = useState(formatDate(initialValues?.endDate));
  const [imageUrl, setImageUrl] = useState(initialValues?.imageUrl || "");
  const [notes, setNotes] = useState(initialValues?.notes || "");
  const [collaborators, setCollaborators] = useState(initialValues?.collaborators || "");
  const [hideGeneralActivities, setHideGeneralActivities] = useState(
    initialValues?.hideGeneralActivities ?? false
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trip: UserTrip = {
      id: initialValues?.id,
      userId,
      destinationId,
      name,
      status,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      imageUrl,
      notes,
      collaborators: collaborators || undefined,
      hideGeneralActivities
    };

    onSubmit(trip);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Conditionally render destination selector only in Add mode */}
      {onDestinationChange && (
        <div>
          <label className="block font-semibold">Destination</label>
          <select
            value={destinationId}
            onChange={e => onDestinationChange(e.target.value)}
            className="border rounded p-2 w-full"
          >
            {destinations.map(d => (
              <option key={d.id} value={d.id}>
                {d.name ?? "Unnamed Destination"}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block font-semibold">Trip Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
      </div>

      <div className="flex gap-4">
        <div>
          <label className="block font-semibold">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="border rounded p-2"
          />
        </div>
        <div>
          <label className="block font-semibold">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="border rounded p-2"
          />
        </div>
      </div>

      <div>
        <label className="block font-semibold">Status</label>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="border rounded p-2"
        >
          <option>Upcoming</option>
          <option>Current</option>
          <option>Past</option>
        </select>
      </div>

      {onImageSelect && (
        <div>
          <label className="block font-semibold">Trip Image</label>
          <ImageUploadWidget
            initialUrl={imageUrl}
            onSelect={async (file: File) => {
              const previewUrl = await onImageSelect(file);
              setImageUrl(previewUrl);
              return previewUrl;
            }}
          />

        </div>
      )}


      <div>
        <label className="block font-semibold">Notes</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block font-semibold">Collaborators (comma separated)</label>
        <input
          type="text"
          value={collaborators}
          onChange={e => setCollaborators(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="hideGeneralActivities"
          type="checkbox"
          checked={hideGeneralActivities}
          onChange={e => setHideGeneralActivities(e.target.checked)}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
        />
        <label htmlFor="hideGeneralActivities" className="text-sm font-medium text-gray-700">
          Hide general destination activities for this trip
        </label>
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

export default TripForm;
