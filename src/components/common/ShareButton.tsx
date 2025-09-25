import React, { useState } from "react";

const ShareButton: React.FC<{ url: string }> = ({ url }) => {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    console.log("📤 Share button clicked");

    const shareData = {
      title: "Your Trip on Itinera",
      text: "Check out this amazing journey I planned!",
      url,
    };

    if (!navigator.share) {
      console.warn("🚫 Web Share API not supported");
      alert("Web Share API not supported on this device.");
      return;
    }

    if (isSharing) {
      console.warn("⏳ Share already in progress");
      return;
    }

    setIsSharing(true);
    console.log("🔄 Starting share...");

    try {
      await navigator.share(shareData);
      console.log("✅ Shared successfully");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        console.warn("🚫 Share aborted by user or system");
      } else if (err instanceof Error) {
        console.error("❌ Share failed:", err.name, err.message);
      } else {
        console.error("❌ Unknown share error:", err);
      }
    }


  };

  return (
<button
  onClick={handleShare}
  disabled={isSharing}
  style={{
    padding: "6px 10px",
    fontSize: "14px",
    lineHeight: "1",
    height: "auto",
  }}
>
  Share
</button>

  );
};

export default ShareButton;


//usage

import { useLocation } from "react-router-dom";

export const TripPage = () => {
  const location = useLocation();
  const currentUrl = `https://holiday-planner-six.vercel.app/${location.pathname}`;

  return <ShareButton url={currentUrl} />;
};
