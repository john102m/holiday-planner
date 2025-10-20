import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { useSwipeNavigation } from "./common/useSwipeNavigation";

interface GenericModalProps {
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  title?: string;
  onNext?: () => void;
  onPrev?: () => void;
}

export const GenericModal: React.FC<GenericModalProps> = ({
  onClose,
  children,
  footer,
  title,
  onNext,
  onPrev,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useSwipeNavigation(modalRef, onNext, onPrev);

  // Lock body scroll
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY); // restore scroll
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-lg sm:backdrop-blur-md p-4">
      {/* Modal content */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-lg p-4 sm:p-6 w-full max-w-[92vw] sm:max-w-lg max-h-[85vh] overflow-y-auto shadow-lg text-sm touch-pan-y"

      >
        {title && <h2 className="text-lg font-bold mb-4">{title}</h2>}

        <div>{children}</div>

        {/* Divider above footer */}
        <hr className="mt-6 border-t border-gray-200" />

        {/* Footer row */}
        <div className="mt-4 flex justify-between items-center">
          {/* Left-aligned action buttons */}
          <div className="flex gap-3">{footer}</div>

          {/* Right-aligned close button */}
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
