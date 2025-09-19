import React, { useEffect, useRef } from "react";
import type { DiaryEntry } from "../../services/types";

interface Props {
  entry: DiaryEntry;
  onClose: () => void;
}

function formatDate(value: unknown): string {
  if (typeof value === "string") return value.slice(0, 10);
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return "";
}

const DiaryEntryModal: React.FC<Props> = ({ entry, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Escape key close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Click outside close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Prevent background scrolling
  useEffect(() => {
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const imageSrc =
    entry.imageUrl?.trim() && entry.imageUrl !== ""
      ? entry.imageUrl
      : "/placeholder.png";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-lg sm:backdrop-blur-md p-4">
      <div
        ref={modalRef}
        className="bg-yellow-50 rounded-lg w-full max-w-lg max-h-[85vh] overflow-y-auto relative shadow-lg p-6"
      >

        <img
          src={imageSrc}
          alt="Diary Entry"
          className="w-full h-64 object-cover rounded mb-4"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.png";
          }}
        />

        <h2 className="text-xl font-serif font-bold mb-2">
          {entry.title ?? "Untitled Entry"}
        </h2>

        <p className="text-sm text-gray-700 whitespace-pre-line mb-4">
          {entry.entryContent ?? "No content available."}
        </p>

        <p className="text-xs text-gray-500">
          {entry.entryDate ? formatDate(entry.entryDate) : "No date"}
        </p>
        {/* close button at bottom right */}
        <div className="mt-auto flex justify-end">
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 active:bg-gray-400"
            aria-label="Close"
          >
            ×
          </button>
        </div>

      </div>
    </div>
  );
};

export default DiaryEntryModal;
