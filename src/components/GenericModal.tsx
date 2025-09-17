import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

interface GenericModalProps {
    onClose: () => void;
    children: ReactNode;
    title?: string;
}

export const GenericModal: React.FC<GenericModalProps> = ({ onClose, children, title }) => {
    const modalRef = useRef<HTMLDivElement>(null);

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
            <div
                ref={modalRef}
                className="relative bg-white rounded-lg p-4 sm:p-6 w-full max-w-[92vw] sm:max-w-lg max-h-[85vh] overflow-y-auto shadow-lg text-sm"
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl font-bold"
                >
                    ×
                </button>
                {title && <h2 className="text-lg font-bold mb-4">{title}</h2>}
                <div>{children}</div>
            </div>
        </div>
    );
};
