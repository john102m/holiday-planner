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
    <div className="quick-actions-bar flex space-x-4 mt-4 p-3 border rounded-lg shadow-sm bg-white justify-center sm:justify-start">
      <button
        onClick={() => handleAction("pin")}
        className="flex items-center space-x-1 text-gray-600 hover:text-blue-500 transition"
      >
        <FaThumbtack /> <span className="hidden sm:inline">Pin</span>
      </button>
      <button
        onClick={() => handleAction("favorite")}
        className="flex items-center space-x-1 text-gray-600 hover:text-yellow-500 transition"
      >
        <FaStar /> <span className="hidden sm:inline">Favorite</span>
      </button>
      <button
        onClick={() => handleAction("share")}
        className="flex items-center space-x-1 text-gray-600 hover:text-green-500 transition"
      >
        <FaShareAlt /> <span className="hidden sm:inline">Share</span>
      </button>
      <button
        onClick={() => handleAction("edit")}
        className="flex items-center space-x-1 text-gray-600 hover:text-purple-500 transition"
      >
        <FaEdit /> <span className="hidden sm:inline">Edit</span>
      </button>
    </div>
  );
};

export default QuickActionsBar;
