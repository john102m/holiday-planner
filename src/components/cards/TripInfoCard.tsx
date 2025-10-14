import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { TripInfo } from "../../services/types";
import { addOptimisticAndQueue } from "../../services/store";
import { CollectionTypes, QueueTypes } from "../../services/types";
import Spinner from "../common/Spinner";
import { useImageBlobSrc, isSpinnerVisible } from "../common/useImageBlobSrc";
import { GenericModal } from "../GenericModal";

interface Props {
  info: TripInfo;
  tripId: string;
  showActions?: boolean;
}

const TripInfoCard: React.FC<Props> = ({ info, tripId, showActions = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const imgSrc = useImageBlobSrc(info);
  const showSpinner = isSpinnerVisible(info);

  const truncateText = (text: string, maxLength = 120) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    const slice = text.slice(0, maxLength);
    const lastSpace = slice.lastIndexOf(" ");
    return slice.slice(0, lastSpace) + "...";
  };

  const truncatedDescription = truncateText(info.description);

  const handleDelete = async () => {
    if (window.confirm(`Delete "${info.title}"?`)) {
      await addOptimisticAndQueue(
        CollectionTypes.TripInfo,
        info,
        QueueTypes.DELETE_TRIP_INFO,
        tripId
      );
      console.log(`Queued deletion for TripInfo ${info.title}`);
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
        className={`flex flex-row items-stretch w-full h-[130px] border-l-4 ${info.type === "Accommodation" ? "border-blue-400" : "border-yellow-400"
          } bg-lime-50 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer max-w-[400px] mx-auto sm:min-h-[160px] sm:max-w-[400px]`}
        onClick={() => setIsModalOpen(true)}
      >
        {/* Image Section */}
        <div className="w-5/12 h-full relative flex-shrink-0">
          <div className="aspect-[4/3] w-full h-full overflow-hidden rounded-l">
            <img
              src={imgSrc || "/placeholder.png"}
              alt={info.title}
              className={`w-full rounded-lg h-full object-cover ${showSpinner ? "opacity-50" : "opacity-100"}`}
              onError={(e) => {
                e.currentTarget.src = "/placeholder.png";
              }}
            />
            {/* Icon Badge */}
            <div className="absolute top-2 left-2 bg-lime-50 rounded-full p-1 shadow">
              <span className="text-xs">{info.type === "Accommodation" ? "🏨" : "🚐"}</span>
            </div>
            {showSpinner && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-10">
                <Spinner />
              </div>
            )}
          </div>
        </div>

        {/* Text Section */}
        <div className="w-7/12 p-2 flex flex-col justify-between h-full">
          <div className="flex flex-col gap-1 overflow-hidden">
            <h3 className="font-bold text-md truncate">{info.title}</h3>
            <p className="text-xs text-gray-500 italic">
              {info.startDate?.slice(0, 10)} → {info.endDate?.slice(0, 10)}
            </p>
            <p className="text-sm text-gray-600 line-clamp-2">{truncatedDescription}</p>
            <div className="text-xs text-gray-500 italic">
              {info.type} • {info.location}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <GenericModal
          onClose={() => setIsModalOpen(false)}
          title={info.title}
          footer={
            showActions && (
              <>
                <button
                  onClick={() => {
                    const params = new URLSearchParams();
                    params.set("tripInfoId", info.id ?? "");
                    params.set("tripId", tripId);
                    navigate(`/tripinfo/edit?${params.toString()}`);
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
            )
          }
        >
          <div className="space-y-4 text-sm">
            {imgSrc && (
              <img
                src={imgSrc}
                alt={info.title}
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.png";
                }}
                className="w-full object-cover rounded"
              />
            )}
            <p className="text-gray-700 whitespace-pre-line">{info.description}</p>
            <div className="text-xs text-gray-500">
              {info.location} • {info.type} <br />
              {info.startDate?.slice(0, 10)} → {info.endDate?.slice(0, 10)}
            </div>
            <div>
              <h4 className="font-semibold mb-1">Related Link</h4>
              {info.linkUrl ? (
                <a
                  href={info.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline break-words"
                  title={info.linkUrl}
                >
                  {getDomain(info.linkUrl)}
                </a>
              ) : (
                <p className="text-gray-500 italic">No link provided for this trip info.</p>
              )}
            </div>            
          </div>
        </GenericModal>
      )}
    </>

  );
};

export default TripInfoCard;
