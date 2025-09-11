import React from "react";
import type { Activity } from "../../services/types";
import ActivityCard from "../cards/ActivityCard";

interface Props {
  activity: Activity;
}

const ActivityPreview: React.FC<Props> = ({ activity }) => {
  return (
    <div>
      <h4 className="text-sm font-semibold mb-2 text-gray-600">Preview</h4>
      <ActivityCard
        activity={activity}
        destinationId={activity.destinationId}
        showActions={false} // no buttons, just image and details
      />
    </div>
  );
};

export default ActivityPreview;
