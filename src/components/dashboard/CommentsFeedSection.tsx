import React, { useEffect, useState } from "react";
import { getComments } from "../../services/apis/api";
import type { ActivityComment } from "../../services/types";

const CommentsFeedSection: React.FC = () => {
  const [comments, setComments] = useState<ActivityComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const apiComments = await getComments();

        // Sort comments by createdAt descending, guard against undefined
        const sorted = apiComments.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });

        setComments(sorted);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, []);

  if (loading) return <p className="text-gray-500">Loading comments...</p>;
  if (comments.length === 0) return <p className="text-gray-500">No recent comments or notes.</p>;

  return (
    <div>
      <h2 className="section-heading">
        <span className="section-heading-accent">Recent Comments & Notes</span>
      </h2>

      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c.id} className="border rounded p-3 shadow hover:shadow-md transition">
            <p className="text-sm text-gray-600">{c.content}</p>
            <p className="text-xs text-gray-400">
              {c.createdAt ? new Date(c.createdAt).toLocaleString() : "Unknown date"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentsFeedSection;
