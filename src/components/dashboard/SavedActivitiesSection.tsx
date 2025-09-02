import React, { useEffect, useState } from "react";
import { getComments } from "../../services/api";
import type { Activity, ActivityComment } from "../../services/types";
import ActivityCard from "../ActivityCard";
import { useStore } from "../../services/store";

interface ActivityWithComments extends Activity {
  comments: ActivityComment[];
}

const SavedActivitiesSection: React.FC = () => {
  const [savedActivities, setSavedActivities] = useState<ActivityWithComments[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter saved activities
  const activitiesObj = useStore(state => state.activities);
  const saved = Object.values(activitiesObj) // gives Activity[][]
    .flat() // flatten to Activity[]
    .filter(a => a.votes && a.votes > 0); // now you can filter on votes or whatever


  useEffect(() => {
    const fetchComments = async () => {
      try {
        const comments = await getComments();

        // Group comments by activityId
        const commentsByActivity = comments.reduce((acc, comment) => {
          if (!comment.activityId) return acc;
          if (!acc[comment.activityId]) acc[comment.activityId] = [];
          acc[comment.activityId].push(comment);
          return acc;
        }, {} as Record<string, ActivityComment[]>);

        // Merge comments into each activity
        const merged: ActivityWithComments[] = saved.map(a => ({
          ...a,
          comments: commentsByActivity[a.id] ?? [],
        }));

        setSavedActivities(merged);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, []);

  const handleAddComment = (activityId: string, comment: string) => {
    console.log(`💬 New comment for activity ${activityId}:`, comment);

    setSavedActivities(prev =>
      prev.map(a =>
        a.id === activityId
          ? {
            ...a,
            comments: [
              { activityId, content: comment },
              ...a.comments,
            ],
          }
          : a
      )
    );
  };

  if (loading) return <p className="text-gray-500">Loading saved activities...</p>;
  if (savedActivities.length === 0) return <p className="text-gray-500">No saved activities yet.</p>;

  return (

    <div>
      <h2 className="section-heading">
        <span className="section-heading-accent">Saved Activities</span>
      </h2>


      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
        {savedActivities.map(activity => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            activityComments={activity.comments}
            onAddComment={handleAddComment}
          />
        ))}
      </div>
    </div>
  );
};

export default SavedActivitiesSection;
