// ActivityCard.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import type { Activity } from "../../services/types";
import { CollectionTypes, QueueTypes } from "../../services/types";
import { addOptimisticAndQueue } from "../../services/store";

interface Props {
  activity: Activity;
  destinationId: string;
  showActions?: boolean; // optional, defaults to true
}

const ActivityCard: React.FC<Props> = ({ activity, destinationId, showActions = true }) => {

  const navigate = useNavigate();

  const truncatedDetails =
    showActions || !activity.details
      ? activity.details
      : activity.details.length > 60
        ? activity.details.slice(0, 60) + "..."
        : activity.details;


  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${activity.name}"?`)) {
      await addOptimisticAndQueue(
        CollectionTypes.Activities,
        activity,
        QueueTypes.DELETE_ACTIVITY,
        destinationId
      );
      console.log(`Queued deletion for activity ${activity.name}`);
    }
  };

  return (
    <div className="card">
      {activity.imageUrl && <img src={activity.imageUrl} alt={activity.name} className="card-img" />}
      <div className="card-body">
        <h3 className="card-title">{activity.name}</h3>
        <p className="card-text">{truncatedDetails}</p>
        <div className="card-footer flex justify-between items-center">
          <span>{activity.votes ?? 0} votes</span>
        </div>
        {showActions && (
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => navigate(`/destinations/${destinationId}/activities/edit/${activity.id}`)}
              className="px-3 py-1 bg-gray-200 rounded text-sm"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm"
            >
              Delete
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ActivityCard;
