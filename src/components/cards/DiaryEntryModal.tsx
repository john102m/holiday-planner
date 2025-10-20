import React, { useEffect, useRef, useState } from "react";
import type { DiaryEntry } from "../../services/types";
import placeholder from "/placeholder.png";
import { formatFriendlyDate } from "../utilities";
interface Props {
  entry: DiaryEntry;
  onClose: () => void;
}

const DiaryEntryModal: React.FC<Props> = ({ entry, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

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

  useEffect(() => {
    const el = modalRef.current;
    if (!el) return;

    const handleScroll = () => {
      setScrolled(el.scrollTop > 10); // adjust threshold as needed
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const imageSrc =
    entry.imageUrl?.trim() && entry.imageUrl !== ""
      ? entry.imageUrl
      : placeholder;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-lg sm:backdrop-blur-md p-2 sm:p-4">
      <div
        ref={modalRef}
        className="bg-yellow-50 rounded-xl w-full max-w-md max-h-[85vh] overflow-y-auto relative shadow-lg p-6"
      >

        <img
          src={imageSrc}
          alt="Diary Entry"
          className="w-full max-h-[70vh] object-cover rounded-lg mb-4"
          onError={(e) => {
            e.currentTarget.src = placeholder;
          }}
        />

        <h2 className="text-lg sm:text-xl font-serif font-bold mb-2">
          {entry.title ?? "Untitled Entry"}
        </h2>

        <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line mb-4">
          {entry.entryContent ?? "No content available."}
        </p>

        <p className="text-xs text-gray-500">
          {entry.entryDate ? formatFriendlyDate(entry.entryDate) : "No date"}
        </p>
        {!scrolled && (
          <div className="absolute -bottom-2 left-0 w-full h-12 bg-gradient-to-t from-yellow-50 to-transparent pointer-events-none transition-opacity duration-300" />
        )}

        {/* close button at bottom right */}
        <div className="mt-auto flex justify-end">
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

export default DiaryEntryModal;
