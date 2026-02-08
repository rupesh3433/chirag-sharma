import React from "react";

interface CardLayoutProps {
  width: string;
  aspectRatio: `${number}/${number}`;
  children: React.ReactNode;
}

/**
 * CardLayout
 * -----------
 * - Controls CARD-level layout only
 * - Establishes a card-scoped typography context
 * - ALL child components should size using `em`
 * - NO viewport units allowed here
 */
export const CardLayout: React.FC<CardLayoutProps> = ({
  width,
  aspectRatio,
  children,
}) => {
  return (
    <div
      className="flex-none snap-start"
      style={{ width }}
    >
      <div
        className="relative w-full"
        style={{ aspectRatio }}
      >
        <div
          className="absolute inset-0 overflow-hidden isolate"
          style={{
            /**
             * Prevents layout bleed between cards
             * Critical for sliders
             */
            contain: "layout paint size",

            containerType: "inline-size",

            /**
             * 🔑 SINGLE SOURCE OF TRUTH
             * All typography & spacing inside cards
             * must scale relative to THIS
             */
            fontSize: "clamp(14px, 1.05em, 16px)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

interface SliderContainerProps {
  children: React.ReactNode;
  gap: number;
  containerRef: React.RefObject<HTMLDivElement>;
}

/**
 * SliderContainer
 * ----------------
 * - Controls horizontal spacing between cards
 * - `gap` ONLY affects card-to-card spacing
 * - Does NOT affect internal card padding
 */
export const SliderContainer: React.FC<SliderContainerProps> = ({
  children,
  gap,
  containerRef,
}) => {
  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        overflowX: "auto",
        scrollSnapType: "x mandatory",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        gap: `${gap}px`,
      }}
    >
      {children}

      {/* Hide scrollbar (cross-browser) */}
      <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};
