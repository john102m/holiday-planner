import React from "react";
import { useNavigate } from "react-router-dom";
import type { Activity } from "../../services/types";
import { CollectionTypes, QueueTypes } from "../../services/types";
import { addOptimisticAndQueue } from "../../services/store";

interface Props {
  activity: Activity;
  showActions?: boolean;
}

const ActivitySummaryCard: React.FC<Props> = ({ activity, showActions = true }) => {
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (window.confirm(`Delete "${activity.name}"?`)) {
      await addOptimisticAndQueue(
        CollectionTypes.Activities,
        activity,
        QueueTypes.DELETE_ACTIVITY,
        activity.destinationId
      );
    }
  };
  const navigateToAddEdit = () => {
    const params = new URLSearchParams();
    if (activity.id) params.set("activityId", activity.id);
    console.log("Sending activity id: ", activity.id);
    navigate(`/destinations/${activity.destinationId}/activities/edit?${params.toString()}`);
  }

return (
  <div
    className="border rounded-lg shadow-sm hover:shadow-md transition cursor-pointer flex flex-col sm:flex-row gap-3 p-2 min-w-[300px]"
    onClick={navigateToAddEdit}
  >
    {/* Left: Image */}
    <div className="sm:w-1/3 w-full flex-shrink-0">
      <img
        src={activity.imageUrl || "/placeholder.png"}
        alt={activity.name}
        className="w-full h-28 sm:h-full object-cover rounded"
        onError={(e) => {
          e.currentTarget.src = "/placeholder.png";
        }}
      />
    </div>

    {/* Right: Text */}
    <div className="sm:w-2/3 w-full flex flex-col justify-between">
      <div>
        <h3 className="font-semibold text-md">{activity.name}</h3>
        {activity.details && (
          <p className="text-sm text-gray-600 line-clamp-3 mt-1">{activity.details}</p>
        )}
        <div className="text-xs text-gray-500 mt-1">
          Votes: {activity.votes ?? 0}
        </div>
      </div>

      {/* Bottom row: actions */}
      {showActions && (
        <div className="mt-2 flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); navigateToAddEdit(); }}
            className="px-2 py-1 bg-gray-100 text-sm rounded hover:bg-gray-200"
          >
            Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(); }}
            className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  </div>
);

};

export default ActivitySummaryCard;
