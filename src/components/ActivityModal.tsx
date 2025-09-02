import React, { useState } from "react";
import { useStore } from "../services/store";
import type { Activity, AppComment } from "../services/types";
import { createComment } from "../services/api";

interface Props {
  activityId: string;
  destinationId: string;
  onClose: () => void;
}

const ActivityModal: React.FC<Props> = ({ activityId, destinationId, onClose }) => {
  const activities = useStore((state) => state.activities[destinationId] || []);
  const comments = useStore((state) => state.comments[activityId] || []);
  const addQueuedAction = useStore((state) => state.addQueuedAction);

  const [commentText, setCommentText] = useState("");

  const activity: Activity | undefined = activities.find((a) => a.id === activityId);
  if (!activity) return null;

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    const newComment: AppComment = {
      id: crypto.randomUUID(),
      activityId,
      content: commentText,
      createdBy: "Me",
      createdAt: new Date().toISOString(),
    };

    // Optimistic update
    useStore.setState((state) => {
      const existingComments: AppComment[] = state.comments[activityId] || [];
      return {
        comments: {
          ...state.comments,
          [activityId]: [...existingComments, newComment],
        },
      };
    });

    try {
      await createComment({ activityId, content: commentText }); // make sure API expects 'content'
    } catch (err) {
      console.error("Comment failed, queued for later", err);

      addQueuedAction({
        type: "COMMENT",
        payload: { activityId, content: commentText },
      });
    } finally {
      setCommentText("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded shadow-lg w-11/12 max-w-2xl p-6 relative">
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
            {comments.map((c) => (
              <div key={c.id} className="bg-gray-100 rounded p-2">
                {c.content}
              </div>
            ))}
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
              onClick={handleAddComment}
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
