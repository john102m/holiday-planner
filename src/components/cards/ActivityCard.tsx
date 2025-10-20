import React, { useState } from "react";
import type { Activity } from "../../services/types";
import { CollectionTypes, QueueTypes } from "../../services/types";
import { addOptimisticAndQueue } from "../../services/store";
import Spinner from "../common/Spinner";
import { useImageBlobSrc, isSpinnerVisible } from "../../components/common/useImageBlobSrc";

import ConfirmActionModal from "../common/ConfirmActionModal"; // adjust path if needed

import placeholder from "/placeholder.png";

interface Props {
  activity: Activity;
  destinationId: string;
  tripId?: string;
  showActions?: boolean;
  onClick?: () => void;
}


const ActivityCard: React.FC<Props> = ({
  activity,
  destinationId,

  onClick
}) => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // --- Spinner/Image logic from safer POC ---
  const imgSrc = useImageBlobSrc(activity);
  const showSpinner = isSpinnerVisible(activity);

  // --- Keep truncated details logic ---
  const truncateText = (text: string, maxLength = 40) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    const slice = text.slice(0, maxLength);
    const lastSpace = slice.lastIndexOf(" ");
    return slice.slice(0, lastSpace) + "...";
  };

  const truncatedDetails = truncateText(activity.details ?? "");

  const confirmDelete = async () => {
    await addOptimisticAndQueue(
      CollectionTypes.Activities,
      activity,
      QueueTypes.DELETE_ACTIVITY,
      destinationId
    );
    console.log(`Queued deletion for activity ${activity.name}`);
    setIsConfirmModalOpen(false);

  };

  const cancelDelete = () => {
    setIsConfirmModalOpen(false);
  };


  return (
    <>
      <div
        className="bg-white rounded-lg shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden w-full"
        onClick={onClick}

      >
        {/* Image Section */}
        <div className="w-full max-h-[300px] overflow-hidden rounded relative">
          <img
            src={imgSrc}
            alt={activity.name}
            className={`w-full object-cover ${showSpinner ? "opacity-50" : "opacity-100"}`}
            style={{
              objectPosition: `${(activity.focalPointX ?? 0.5) * 100}% ${(activity.focalPointY ?? 0.5) * 100}%`,
              height: "100%", // ensures it fills the container
            }}
            onError={(e) => {
              e.currentTarget.src = placeholder;
            }}
            loading="lazy"
          />
          {showSpinner && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-10">
              <Spinner />
            </div>
          )}
        </div>


        {/* Text Section */}
        <div className="p-2 pb-0 space-y-2">
          <h3 className="font-semibold text-md">{activity.name}</h3>

          {/* Only show details and votes on md+ screens */}
          <div className="hidden md:block space-y-1">
            <p className={`text-sm text-gray-600 ${activity.votes === undefined ? 'pb-2' : ''}`}>{truncatedDetails}</p>
            {activity.votes !== undefined && (
              <div className="text-xs text-gray-500 pb-2">Votes: {activity.votes}</div>
            )}
          </div>
        </div>

      </div>

        

      <ConfirmActionModal
        isOpen={isConfirmModalOpen}
        title="Delete Activity"
        message={
          <>
            🗑️ Are you sure you want to delete <strong>{activity.name}</strong>?
          </>
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />


    </>


  );
};

export default ActivityCard;
