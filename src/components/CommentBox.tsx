import React, { useState } from "react";

interface CommentBoxProps {
  activityId: string;
  onSubmit: (activityId: string, comment: string) => void;
}

const CommentBox: React.FC<CommentBoxProps> = ({ activityId, onSubmit }) => {
  const [comment, setComment] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = () => {
    if (comment.trim()) {
      onSubmit(activityId, comment);
      setComment("");
      setIsOpen(false); // collapse after submit (optional)
    }
  };

  return (
    <div className="mt-3 border-t pt-3">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="text-blue-500 text-sm font-medium hover:underline"
        >
          💬 Leave a comment
        </button>
      ) : (
        <div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your comment..."
            className="w-full bg-gray-200 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm resize-none"
            rows={3}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition"
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentBox;
