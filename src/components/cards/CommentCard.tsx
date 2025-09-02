// components/destination/CommentCard.tsx
import React from "react";
import type { ActivityComment } from "../../services/types";

interface Props {
  comment: ActivityComment;
}

const CommentCard: React.FC<Props> = ({ comment }) => {
  return (
    <div className="border rounded-lg p-3 shadow-sm mb-2 hover:shadow-md transition bg-white">
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-gray-800">{comment.createdBy}</span>
        <span className="text-gray-400 text-xs">
          {comment.createdAt}
        </span>
      </div>
      <p className="text-gray-700 text-sm">{comment.content}</p>
    </div>
  );
};

export default CommentCard;
