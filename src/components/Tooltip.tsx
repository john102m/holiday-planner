import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";

interface TooltipProps {
  content: string;
  children: ReactNode;
  maxWidth?: string;
  minWidth?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  maxWidth = "220px",
  minWidth = "300px"
}) => {
  const [visible, setVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onClick={() => setVisible((v) => !v)}
        className="inline-flex items-center cursor-help"
      >
        {children}
      </div>

      <div
        ref={tooltipRef}
        className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 transition-all duration-300 ease-out
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"}`}
        style={{ maxWidth, minWidth}}

      >
        <div className="bg-gray-700 text-white text-xs rounded px-3 py-2 whitespace-normal break-words shadow-lg relative">
          {content}
          <div className="absolute top-full left-1/2 w-2 h-2 bg-gray-700 rotate-45 -translate-x-1/2"></div>
        </div>
      </div>
    </div>
  );
};
