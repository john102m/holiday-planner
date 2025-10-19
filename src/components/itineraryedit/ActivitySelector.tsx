import React from "react";
import type { Activity } from "../../services/types";
import { Tooltip } from "../Tooltip";
import ActivityPreview from "../dashboard/ActivityPreview";

interface Props {
  filteredActivities: Activity[];
  selectedActivityId: string;
  setSelectedActivityId: (id: string) => void;
  onAdd: () => void;
  selectedActivity: Activity | null;
}

const ActivitySelector: React.FC<Props> = ({
  filteredActivities,
  selectedActivityId,
  setSelectedActivityId,
  onAdd,
  selectedActivity
}) => {
  return (
    <div className="w-full max-w-xl px-2 sm:px-0">


      {/* Dropdown + Add Button */}
      {/* <div className="mb-4 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center"> */}
        <div className="mb-4 flex flex-row flex-wrap gap-2 items-center">

        <select
          value={selectedActivityId}
          onChange={(e) => setSelectedActivityId(e.target.value)}
          className="text-sm px-2 py-2 border rounded flex-1 min-w-[190px]"

        >
          <option value="">Select an activity</option>
          {filteredActivities.map((act) => (
            <option key={act.id} value={act.id}>
              {act.name}
            </option>
          ))}
          {filteredActivities.length === 0 && (
            <option disabled>No available activities</option>
          )}
        </select>

        <Tooltip content={!selectedActivityId ? "Select an activity first" : ""}>
          <button
            disabled={!selectedActivityId}
            className="text-sm px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 whitespace-nowrap"

            onClick={onAdd}
          >
            ➕ Add
          </button>
        </Tooltip>
      </div>

      {/* Preview */}
      {selectedActivity && (
        <div className="mt-2">
          <ActivityPreview activity={selectedActivity} />
        </div>
      )}
    </div>
  );
};

export default ActivitySelector;
