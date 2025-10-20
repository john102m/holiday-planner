import { useEffect, useRef } from "react";
import type { RefObject } from "react";

export function useSwipeNavigation(
  ref: RefObject<HTMLElement | null>,
  onNext?: () => void,
  onPrev?: () => void
) {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;

      const deltaX = (touchStartX.current ?? 0) - endX;
      const deltaY = (touchStartY?.current ?? 0) - endY;

      // Only trigger swipe if horizontal movement is dominant
      if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
        e.preventDefault(); // ✅ Only prevent default if it's a real horizontal swipe
        if (deltaX > 0) onNext?.();
        else onPrev?.();
      }
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchend", handleTouchEnd);

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [ref, onNext, onPrev]);
}
