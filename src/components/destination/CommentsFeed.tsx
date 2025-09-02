// components/destination/CommentsFeed.tsx
import React from "react";
import type { ActivityComment } from "../../services/types";
import CommentCard from "../cards/CommentCard";

interface Props {
  comments: ActivityComment[];
}

const CommentsFeed: React.FC<Props> = ({ comments }) => {
  if (comments.length === 0) return <div>No comments yet.</div>;

  return (
    <div className="comments-feed flex flex-col mt-2">
      {comments.map((c) => (
        <CommentCard key={c.id} comment={c} />
      ))}
    </div>
  );
};

export default CommentsFeed;
