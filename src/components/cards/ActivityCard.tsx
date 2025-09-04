import React from "react";
//import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import type { Activity } from "../../services/types";
import { QueueTypes, CollectionTypes } from "../../services/store"; 
import { addOptimisticAndQueue } from "../../services/store"; 
interface Props {
  activity: Activity;
  destinationId: string;
}

const ActivityCard: React.FC<Props> = ({ activity, destinationId }) => {
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${activity.name}"?`)) {
      await addOptimisticAndQueue(
        CollectionTypes.Activities,
        activity, 
        QueueTypes.DELETE_ACTIVITY,
        destinationId
      );

      console.log(`Queued deletion for activity ${activity.name}`);
      //toast.success(`Queued deletion for activity ${activity.name}`);
    }
  };


  return (
    <div className="card">
      {activity.imageUrl && <img src={activity.imageUrl} alt={activity.name} className="card-img" />}

      <div className="card-body">
        <h3 className="card-title">{activity.name}</h3>
        <p className="card-text">{activity.details}</p>
        <div className="card-footer flex justify-between items-center">
          <span>{activity.votes ?? 0} votes</span>
          {/* Optional: display date/time or other info here */}
        </div>

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
      </div>
    </div>
  );
};

export default ActivityCard;
