import { useEffect, useState } from "react";
import type { ImageEntity } from "../../services/types";

export function useSmoothImageSwap(entity: ImageEntity) {
  const [imageSrc, setImageSrc] = useState<string | undefined>(
    entity.isPendingUpload ? entity.previewBlobUrl : entity.imageUrl
  );

  useEffect(() => {
    if (entity.imageUrl && entity.isPendingUpload) {
      const img = new Image();
      img.src = entity.imageUrl;
      img.onload = () => {
        setImageSrc(entity.imageUrl);
        if (entity.previewBlobUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(entity.previewBlobUrl);
        }
      };
    }
  }, [entity.imageUrl, entity.previewBlobUrl, entity.isPendingUpload]);

  return imageSrc;
}
