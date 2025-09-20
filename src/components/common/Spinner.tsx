import React from "react";

interface SpinnerProps {
  size?: number; // in pixels
  color?: string; // Tailwind color class or CSS color
  className?: string; // additional classes
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 24,
  color = "border-blue-500",
  className = "",
}) => {
  return (
    <div
      className={`border-2 border-t-transparent rounded-full animate-spin ${color} ${className}`}
      style={{ width: size, height: size }}
    />
  );
};

export default Spinner;
