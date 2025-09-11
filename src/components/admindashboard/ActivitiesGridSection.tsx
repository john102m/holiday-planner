import React from "react";
import { useActivitiesStore } from "../../services/slices/activitiesSlice";
import ActivitySummaryCard from "../../components/admincards/ActivitySummaryCard"
import { useNavigate } from "react-router-dom";
import type { Activity } from "../../services/types";

const ActivitiesGridSection: React.FC = () => {
  const activitiesObj = useActivitiesStore((state) => state.activities);
  const activities = React.useMemo(
    () => Object.values(activitiesObj).flat(),
    [activitiesObj]
  );
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => navigate("/admin/activities/add")}
        >
          + Add Activity
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities.map((act: Activity) => (
          <ActivitySummaryCard key={act.id} activity={act} />
        ))}
      </div>
    </div>
  );
};

export default ActivitiesGridSection;
