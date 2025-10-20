import React, { useState, useEffect, useRef } from "react";
import { useImageBlobSrc } from "../../components/common/useImageBlobSrc";
import type { Activity } from "../../services/types";
import placeholder from "/placeholder.png";
import { useNavigate } from "react-router-dom";
import { useSwipeNavigation } from "../../components/common/useSwipeNavigation";

interface Props {
    activity: Activity;
    tripId?: string;
    destinationId: string;
    onClose: () => void;
    onNext?: () => void;
    onPrev?: () => void;
    swipeDirection?: "left" | "right" | null;
}

const getDomain = (url: string) => {
    try {
        return new URL(url).hostname.replace(/^www\./, "");
    } catch {
        return url;
    }
};

const ActivitySwipeModal: React.FC<Props> = ({
    activity,
    tripId,
    destinationId,
    onClose,
    onNext,
    onPrev,
    swipeDirection = null,
}) => {
    const navigate = useNavigate();
    const imgSrc = useImageBlobSrc(activity);
    const modalRef = useRef<HTMLDivElement>(null);
    const [scrolled, setScrolled] = useState(false);
    const swipeRef = useRef<HTMLDivElement>(null);
    useSwipeNavigation(swipeRef, onNext, onPrev);

    useEffect(() => {
        const el = modalRef.current;
        if (!el) return;
        const handleScroll = () => {
            setScrolled(el.scrollTop > 0);
        };
        el.addEventListener("scroll", handleScroll);
        return () => el.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div
            ref={swipeRef}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-lg sm:backdrop-blur-md p-2 sm:p-4"
        >

            <div
                ref={modalRef}
                className={`bg-white rounded-xl w-full max-w-md max-h-[85vh] overflow-y-auto relative shadow-lg p-6 transition-all duration-150 ease-out ${swipeDirection === "left"
                    ? "-translate-x-10 opacity-0"
                    : swipeDirection === "right"
                        ? "translate-x-10 opacity-0"
                        : "translate-x-0 opacity-100"
                    }`}
            >

                <div className="relative mb-4">
                    <img
                        src={imgSrc}
                        alt={activity.name}
                        className="w-full max-h-[70vh] object-cover rounded-lg"
                        onError={(e) => {
                            e.currentTarget.src = placeholder;
                        }}
                    />

                    {/* Navigation arrows */}
                    <div className="absolute bottom-2 left-0 w-full flex justify-between px-4">
                        <button
                            onClick={() => onPrev?.()}
                            className="text-white text-xl sm:text-2xl bg-black/30 hover:bg-black/50 rounded-full w-10 h-10 flex items-center justify-center transition"
                            aria-label="Previous activity"
                        >
                            ◀
                        </button>
                        <button
                            onClick={() => onNext?.()}
                            className="text-white text-xl sm:text-2xl bg-black/30 hover:bg-black/50 rounded-full w-10 h-10 flex items-center justify-center transition"
                            aria-label="Next activity"
                        >
                            ▶
                        </button>
                    </div>
                </div>

                <h2 className="text-lg sm:text-xl font-bold mb-2">{activity.name}</h2>

                <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line mb-4">
                    {activity.details ?? "No details available."}
                </p>

                <div className="mb-4">
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

                {!scrolled && (
                    <div className="absolute -bottom-2 left-0 w-full h-12 bg-gradient-to-t from-white to-transparent pointer-events-none transition-opacity duration-300" />
                )}

                {/* Action buttons */}
                <div className="mt-4 flex justify-end gap-2">
                    {tripId && (
                        <button
                            onClick={() => {
                                const params = new URLSearchParams();
                                params.set("activityId", activity.id ?? "");
                                if (tripId) params.set("tripId", tripId);
                                navigate(`/destinations/${destinationId}/activities/edit?${params.toString()}`);
                            }}
                            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-amber-300 text-blue-600 hover:bg-amber-400 active:bg-amber-500 transition"
                            aria-label="Edit activity"
                        >
                            ✎
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 active:bg-gray-400 transition"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>
            </div>
        </div>

    );
};

export default ActivitySwipeModal;
