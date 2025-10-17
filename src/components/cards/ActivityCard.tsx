import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Activity } from "../../services/types";
import { CollectionTypes, QueueTypes } from "../../services/types";
import { addOptimisticAndQueue } from "../../services/store";
import Spinner from "../common/Spinner";
import { useImageBlobSrc, isSpinnerVisible } from "../../components/common/useImageBlobSrc";
import { GenericModal } from "../GenericModal";

interface Props {
  activity: Activity;
  destinationId: string;
  tripId?: string;
  showActions?: boolean; // optional, defaults to true
}

const ActivityCard: React.FC<Props> = ({
  activity,
  destinationId,
  tripId,
  showActions = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // --- Spinner/Image logic from safer POC ---
  const imgSrc = useImageBlobSrc(activity);
  const showSpinner = isSpinnerVisible(activity);

  // --- Keep truncated details logic ---
  const truncateText = (text: string, maxLength = 120) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    const slice = text.slice(0, maxLength);
    const lastSpace = slice.lastIndexOf(" ");
    return slice.slice(0, lastSpace) + "...";
  };

  const truncatedDetails = truncateText(activity.details ?? "");

  const handleDelete = async () => {
    if (
      window.confirm(`Are you sure you want to delete "${activity.name}"?`)
    ) {
      await addOptimisticAndQueue(
        CollectionTypes.Activities,
        activity,
        QueueTypes.DELETE_ACTIVITY,
        destinationId
      );
      console.log(`Queued deletion for activity ${activity.name}`);
    }
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return url;
    }
  };

  return (
    <>
      <div
        className="bg-white rounded-lg shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden w-full"
        onClick={() => setIsModalOpen(true)}
      >
        {/* Image Section */}
        <div className="aspect-[3/4] w-full relative">
          <img
            src={imgSrc}
            alt={activity.name}
            className={`w-full h-full object-cover ${showSpinner ? "opacity-50" : "opacity-100"}`}
            style={{
              objectPosition: `${(activity.focalPointX ?? 0.5) * 100}% ${(activity.focalPointY ?? 0.5) * 100}%`
            }}
            onError={(e) => {
              e.currentTarget.src = "/placeholder.png";
            }}
          />
          {showSpinner && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-10">
              <Spinner />
            </div>
          )}
        </div>

        {/* Text Section */}
        <div className="p-3 space-y-2">
          <h3 className="font-semibold text-md">{activity.name}</h3>
          <p className="text-sm text-gray-600">{truncatedDetails}</p>
          {activity.votes !== undefined && (
            <div className="text-xs text-gray-500">Votes: {activity.votes}</div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <GenericModal
          onClose={() => setIsModalOpen(false)}
          title={activity.name}
          footer={
            <>
              {showActions && (
                <>
                  <button
                    onClick={() => {
                      const params = new URLSearchParams();
                      params.set("activityId", activity.id ?? "");
                      if (tripId) params.set("tripId", tripId);
                      navigate(`/destinations/${destinationId}/activities/edit?${params.toString()}`);
                    }}
                    className="underline hover:text-gray-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="underline text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </>
              )}
            </>
          }
        >
          <div className="space-y-4 text-sm">
            {imgSrc && (
              <img
                src={imgSrc}
                alt={activity.name}
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.png";
                }}
                className="w-full object-cover rounded"
              />
            )}
            <p className="text-gray-700 whitespace-pre-line">{activity.details}</p>
            <div>
              <h4 className="font-semibold mb-1">Related Link</h4>
              {activity.linkUrl ? (
                <a
                  href={activity.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline break-words"
                  title={activity.linkUrl}
                >
                  {getDomain(activity.linkUrl)}
                </a>
              ) : (
                <p className="text-gray-500 italic">No link provided for this activity.</p>
              )}
            </div>
          </div>
        </GenericModal>
      )}
    </>


  );
};

export default ActivityCard;
