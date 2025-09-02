import React from "react";
import type { Itinerary } from "../services/types"; // adjust path as needed

interface Invitation {
  itinerary: Itinerary;
  role: string;
  status: "pending" | "accepted" | "declined";
}

interface Props {
  invitation: Invitation;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}

const InvitationCard: React.FC<Props> = ({ invitation, onAccept, onDecline }) => {
  const { itinerary, role, status } = invitation;

  return (
    <div className="bg-white rounded shadow p-2 text-sm flex flex-col h-full">
      <span className="font-medium truncate">{itinerary.name}</span>
      <span className="text-gray-500">{role}</span>
      <div className="mt-auto flex gap-1">
        {status === "pending" ? (
          <>
            <button
              className="px-2 py-0.5 text-xs bg-green-500 text-white rounded"
              onClick={() => onAccept(itinerary.id)}
            >
              ✓
            </button>
            <button
              className="px-2 py-0.5 text-xs bg-red-500 text-white rounded"
              onClick={() => onDecline(itinerary.id)}
            >
              ✗
            </button>
          </>
        ) : (
          <span
            className={`px-2 py-0.5 text-xs rounded text-white ${
              status === "accepted" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {status.toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
};

export default InvitationCard;
