import React, { useState } from "react";
import type { Activity, ActivityComment } from "../services/types";
import CommentBox from "./CommentBox";

interface Props {
  activity: Activity;
  activityComments?: ActivityComment[] | [];
  onAddComment?: (activityId: string, comment: string) => void;
}

const ActivityCard: React.FC<Props> = ({ activity, activityComments = [], onAddComment }) => {
  const [comments, setComments] = useState<ActivityComment[]>(activityComments);

  const handleAddComment = (activityId: string, comment: string) => {
    const newComment: ActivityComment = {
      activityId: activityId,
      content: comment,
      createdAt: new Date().toISOString(),
      createdBy: "current-user-id" // Placeholder; replace with actual user ID if available
    };

    setComments((prev) => [newComment, ...prev]);

    // bubble up to parent (if provided)
    if (onAddComment) {
      onAddComment(activityId, comment);
    }
  };


//   2️⃣ Key points
// flex flex-col on the card → makes it a vertical flex container.
// flex-1 on the middle content → pushes the last element (CommentBox) to the bottom.
// mt-3 on the CommentBox → small spacing from the content above.
// h-full on the card → ensures it stretches to fill its row (so all cards align).
// ✅ Optional refinements
// If you want the CommentBox always visible at the bottom even with very short cards, keep the card flex-1 inside the grid.
// line-clamp-3 on the comment preview keeps it from expanding the card too much.
// flex flex-col flex-1 on the content div → lets content grow vertically, pushing CommentBox down.
// mt-auto on CommentBox wrapper → pins it to the bottom.
// max-w-[420px] w-full mx-auto → clamps width and keeps it centered.
// line-clamp-2 → limits comment preview to 2 lines (requires @tailwindcss/line-clamp plugin).
  return (
<div className="flex flex-col h-full max-w-[420px] w-full mx-auto border rounded-lg overflow-hidden shadow hover:shadow-lg transition">
      {activity.imageUrl && (
        <img
          src={activity.imageUrl}
          alt={activity.name}
          className="w-full h-48 object-cover"
        />
      )}

      {/* Card content grows to push CommentBox to the bottom */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-lg">{activity.name}</h3>
        {activity.details && (
          <p className="mt-2 text-gray-700 text-sm">{activity.details}</p>
        )}

        {/* Comment preview */}
        {comments.length > 0 && (
          <div className="mt-2 text-sm text-gray-600 line-clamp-2">
            <span>
              {comments.length} comment{comments.length !== 1 && "s"}
            </span>
            <p className="italic truncate">“{comments[0].content}”</p>
          </div>
        )}

        {/* Spacer pushes CommentBox to bottom */}
        <div className="mt-auto">
          <CommentBox activityId={activity.id || ""} onSubmit={handleAddComment} />
        </div>
      </div>
    </div>

  );
};

export default ActivityCard;
