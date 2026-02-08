import { useRef, useState, useCallback, useLayoutEffect } from "react";

export function useHorizontalSlider(cardsPerView: number, gap: number, itemCount: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const maxIndex = Math.max(0, itemCount - cardsPerView);

  const scrollToIndex = useCallback((targetIndex: number) => {
    const el = containerRef.current;
    if (!el) return;

    const children = el.children;
    if (targetIndex >= 0 && targetIndex < children.length) {
      const child = children[targetIndex] as HTMLElement;
      const left = child.offsetLeft - el.offsetLeft;
      el.scrollTo({ left, behavior: "smooth" });
    }
  }, []);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let rafId: number;
    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const children = el.children;
        let closest = 0;
        let min = Infinity;

        for (let i = 0; i < children.length; i++) {
          const child = children[i] as HTMLElement;
          const d = Math.abs(el.scrollLeft - child.offsetLeft);
          if (d < min) {
            min = d;
            closest = i;
          }
        }

        const clamped = Math.min(closest, maxIndex);
        setCurrentIndex(clamped);
      });
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [maxIndex]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      scrollToIndex(Math.max(0, currentIndex - cardsPerView));
    }
  }, [currentIndex, cardsPerView, scrollToIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < maxIndex) {
      scrollToIndex(Math.min(maxIndex, currentIndex + cardsPerView));
    }
  }, [currentIndex, maxIndex, cardsPerView, scrollToIndex]);

  return {
    containerRef,
    currentIndex,
    canGoPrev: currentIndex > 0,
    canGoNext: currentIndex < maxIndex,
    handlePrev,
    handleNext,
    scrollToIndex,
  };
}