// components/destination/QuickActionsBar.tsx
import React from "react";
import { FaStar, FaShareAlt, FaThumbtack, FaEdit } from "react-icons/fa";

interface Props {
  destinationId: string;
}

const QuickActionsBar: React.FC<Props> = ({ destinationId }) => {
  const handleAction = (action: string) => {
    // TODO: implement API / store updates
    console.log(`${action} clicked for destination ${destinationId}`);
  };

  return (
    <div className="w-full px-2 sm:px-0">
      <div className="flex flex-wrap items-center justify-start gap-x-3 gap-y-2 p-2 border rounded-md shadow-sm bg-white">
        {[
          { icon: <FaThumbtack />, label: "Pin", color: "hover:text-blue-500", action: "pin" },
          { icon: <FaStar />, label: "Favorite", color: "hover:text-yellow-500", action: "favorite" },
          { icon: <FaShareAlt />, label: "Share", color: "hover:text-green-500", action: "share" },
          { icon: <FaEdit />, label: "Edit", color: "hover:text-purple-500", action: "edit" },
        ].map(({ icon, label, color, action }) => (
          <button
            key={action}
            onClick={() => handleAction(action)}
            className={`flex items-center gap-1 text-xs sm:text-sm text-gray-600 ${color} transition`}
          >
            {icon}
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
    </div>


  );
};

export default QuickActionsBar;
