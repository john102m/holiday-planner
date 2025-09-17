import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Activity } from "../../services/types";
import { CollectionTypes, QueueTypes } from "../../services/types";
import { addOptimisticAndQueue } from "../../services/store";
import { GenericModal } from "../GenericModal";
import {useSmoothImageSwap} from "../../components/common/useSmoothImageSwap"

interface Props {
  activity: Activity;
  destinationId: string;
  showActions?: boolean; // optional, defaults to true
}

const ActivityCard: React.FC<Props> = ({ activity, destinationId, showActions = true }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  console.log("Activity card has the modal integrated")
  const truncatedDetails = (() => {
    if (!activity.details) return "";
    if (activity.details.length <= 120) return activity.details;
    const slice = activity.details.slice(0, 120);
    const lastSpace = slice.lastIndexOf(" ");
    return slice.slice(0, lastSpace) + "...";
  })();

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${activity.name}"?`)) {
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
  
  // const imageSrc = activity.isPendingUpload
  //   ? activity.previewBlobUrl
  //   : activity.imageUrl || "/placeholder.png";

  const imageSrc = useSmoothImageSwap(activity);

  return (
    <>
      {/* Card */}
      <div
        className="card w-full max-w-[300px] mx-auto bg-white rounded shadow-md flex flex-col cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >

        {activity.imageUrl && <img src={activity.imageUrl} alt={activity.name} className="card-img" />}
        <div className="card-body">
          <h3 className="card-title">{activity.name}</h3>
          <p className="card-text line-clamp-1">{truncatedDetails}</p>
          <div className="card-footer flex justify-between items-center">
            <span>{activity.votes ?? 0} votes</span>
          </div>
          {showActions && (
            <div className="mt-2 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation(); // prevent opening modal when clicking edit
                  navigate(`/destinations/${destinationId}/activities/edit/${activity.id}`);
                }}
                className="px-3 py-1 bg-gray-200 rounded text-sm"
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // prevent opening modal when clicking delete
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
            {imageSrc && (
              <img
                src={imageSrc}
                alt={activity.name}
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.png";
                }}
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
