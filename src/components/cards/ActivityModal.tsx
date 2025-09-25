import React, { useState } from "react";
import { useActivitiesStore } from "../../services/slices/activitiesSlice";

import type { Activity, } from "../../services/types";


interface Props {
  activityId: string;
  destinationId: string;
  onClose: () => void;
}

const ActivityModal: React.FC<Props> = ({ activityId, destinationId, onClose }) => {
  const activities = useActivitiesStore((state) => state.activities[destinationId] || []);
  const [commentText, setCommentText] = useState("");
  console.log("ACTIVITY MODAL")
  const activity: Activity | undefined = activities.find((a) => a.id === activityId);
  if (!activity) return null;

  return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-lg sm:backdrop-blur-md p-4">
    {/* <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"> */}
      <div className="bg-white/90 rounded shadow-lg w-11/12 max-w-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 font-bold"
        >
          ×
        </button>

        <h2 className="text-xl font-bold mb-2">{activity.name}</h2>
        {activity.imageUrl && (
          <img src={activity.imageUrl} alt={activity.name} className="mb-4 rounded" />
        )}
        <p className="mb-4">{activity.details}</p>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Comments</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">

          </div>
          <div className="flex mt-2 gap-2">
            <input
              type="text"
              className="flex-1 border rounded px-2 py-1"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
            />
            <button

              className="bg-blue-500 text-white px-3 py-1 rounded"
              disabled={!commentText.trim()}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityModal;
