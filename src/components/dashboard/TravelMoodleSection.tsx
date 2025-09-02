// components/dashboard/TravelMoodToggle.tsx
import React, { useState } from "react";

const TravelMoodToggle: React.FC = () => {
  const [mood, setMood] = useState<"relaxed" | "adventurous">("relaxed");

  return (
    <div className="flex items-center gap-2">
      <span className={mood === "relaxed" ? "font-bold" : "text-gray-400"}>
        🌴 Relaxed
      </span>
      <button
        className="px-3 py-1 border rounded"
        onClick={() =>
          setMood(mood === "relaxed" ? "adventurous" : "relaxed")
        }
      >
        Toggle
      </button>
      <span
        className={mood === "adventurous" ? "font-bold" : "text-gray-400"}
      >
        🗺️ Adventurous
      </span>
    </div>
  );
};

export default TravelMoodToggle;
