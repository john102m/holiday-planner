import React, { useRef } from "react";

interface Props {
  imageUrl: string;
  focalPoint?: { x: number; y: number };
  onChange: (point: { x: number; y: number }) => void;
}

const FocalPointSelector: React.FC<Props> = ({ imageUrl, focalPoint, onChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const clientX = "clientX" in e ? e.clientX : e.touches[0].clientX;
    const clientY = "clientY" in e ? e.clientY : e.touches[0].clientY;

    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;

    onChange({ x: Math.min(1, Math.max(0, x)), y: Math.min(1, Math.max(0, y)) });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-xs rounded overflow-hidden shadow cursor-crosshair"
      onClick={handleClick}
      onTouchStart={handleClick}
    >
      <img src={imageUrl} alt="Focal Point" className="w-full block" />
      {focalPoint && (
        <div
          className="absolute w-4 h-4 bg-red-500 rounded-full pointer-events-none"
          style={{
            left: `${focalPoint.x * 100}%`,
            top: `${focalPoint.y * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
      )}
    </div>
  );
};

export default FocalPointSelector;
