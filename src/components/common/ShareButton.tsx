import React, { useState } from "react";
import type { ReactNode } from "react";

interface ShareButtonProps {
  url: string;
  children?: ReactNode; // allow custom button content
}

export const ShareButton: React.FC<ShareButtonProps> = ({ url, children }) => {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (!navigator.share) {
      alert("Web Share API not supported on this device.");
      return;
    }
    if (isSharing) return;

    setIsSharing(true);

    try {
      await navigator.share({
        title: "Your Trip on Itinera",
        text: "Check out this amazing journey I planned!",
        url,
      });
    } catch (err) {
      console.error("Share failed", err);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={isSharing}
      className="w-4 h-6 flex items-center justify-center rounded-full bg-gray-300 hover:bg-blue-600 text-white transition-colors"
    >
      {children ?? "Share"}
    </button>
  );
};

export default ShareButton;
