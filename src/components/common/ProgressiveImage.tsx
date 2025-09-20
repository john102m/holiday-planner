import React, { useState, useEffect } from "react";

interface ProgressiveImageProps {
  previewUrl?: string;
  finalUrl?: string;
  alt?: string;
  className?: string;
}

const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  previewUrl,
  finalUrl,
  alt,
  className,
}) => {
  const [src, setSrc] = useState(previewUrl || finalUrl);

  useEffect(() => {
    // If finalUrl changes, start loading it
    if (!finalUrl) return;

    const img = new Image();
    img.src = finalUrl;
    img.onload = () => {
      setSrc(finalUrl);

      // Cleanup blob after switching to finalUrl
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [finalUrl, previewUrl]);

  return <img src={src} alt={alt} className={className} />;
};

export default ProgressiveImage;
