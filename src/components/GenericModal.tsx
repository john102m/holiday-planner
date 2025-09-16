// components/GenericModal.tsx
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";


interface GenericModalProps {
    onClose: () => void;
    children: ReactNode;
    title?: string;
}

export const GenericModal: React.FC<GenericModalProps> = ({ onClose, children, title }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    console.log("GENERIC MODAL")
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


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center
                bg-black/20 backdrop-blur-sm">
<div
  ref={modalRef}
  className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-[92vw] sm:max-w-lg max-h-[85vh] overflow-y-auto shadow-lg text-sm"
>



                {title && <h2 className="text-lg font-bold mb-4">{title}</h2>}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl font-bold"
                >
                    ×
                </button>
                <div>{children}</div>
            </div>
        </div>

    );
};
