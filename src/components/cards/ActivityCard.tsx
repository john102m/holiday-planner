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
  showActions = true,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // --- Spinner/Image logic from safer POC ---
  const imgSrc = useImageBlobSrc(activity);
  const showSpinner = isSpinnerVisible(activity);

  // --- Keep truncated details logic ---
  const truncatedDetails = (() => {
    if (!activity.details) return "";
    if (activity.details.length <= 120) return activity.details;
    const slice = activity.details.slice(0, 120);
    const lastSpace = slice.lastIndexOf(" ");
    return slice.slice(0, lastSpace) + "...";
  })();

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
      {/* Card */}
      <div
        className="card w-full max-w-[300px] mx-auto bg-white rounded shadow-md flex flex-col cursor-pointer relative"
        onClick={() => setIsModalOpen(true)}
      >
        {showSpinner && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <Spinner />
          </div>
        )}

        <img
          src={imgSrc}
          alt={activity.name}
          className={`card-img w-full h-48 object-cover ${showSpinner ? "opacity-50" : "opacity-100"
            }`}
        />

        <div className="card-body p-2 flex flex-col justify-between gap-1">
          <h3 className="card-title font-semibold">{activity.name}</h3>
          <p className="card-text line-clamp-1">{truncatedDetails}</p>

          {showActions && (
            <div className="mt-2 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const params = new URLSearchParams();
                  params.set("activityId", activity.id ?? "");
                  if (tripId) params.set("tripId", tripId);
                  navigate(
                    `/destinations/${destinationId}/activities/edit?${params.toString()}`
                  );
                }}
                className="px-3 py-1 bg-gray-200 rounded text-sm"
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <GenericModal onClose={() => setIsModalOpen(false)} title={activity.name}>
          <div className="space-y-4 text-sm">
            {imgSrc && (
              <img
                src={imgSrc}
                alt={activity.name}
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.png";
                }}
                className="w-full object-cover"
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
