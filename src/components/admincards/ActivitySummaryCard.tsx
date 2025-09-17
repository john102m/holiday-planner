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

  return (
    <div className="border rounded p-4 shadow-sm hover:shadow-md transition flex gap-4 items-start">
      {activity.imageUrl && (
        <img
          src={activity.imageUrl}
          alt={activity.name}
          className="w-16 h-16 object-cover rounded"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.png";
          }}
          />
      )}

      <div className="flex-1">
        <h3 className="font-semibold text-md">{activity.name}</h3>
        {activity.details && (
          <p className="text-sm text-gray-600 line-clamp-2">{activity.details}</p>
        )}
        <div className="text-xs text-gray-500 mt-1">
          Votes: {activity.votes ?? 0}
        </div>

        {showActions && (
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => navigate(`/destinations/${activity.destinationId}/activities/edit/${activity.id}`)}
              className="px-2 py-1 bg-gray-100 text-sm rounded hover:bg-gray-200"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
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
