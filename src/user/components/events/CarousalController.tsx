// CarousalController.tsx

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { EventItem } from "../../types/event";

interface CarousalControllerProps {
  /** All events — used to render one dot per event */
  events: EventItem[];
  /** Currently active index */
  currentIndex: number;
  /** Tailwind gradient string e.g. "from-pink-500 to-purple-500" */
  gradient: string;
  /** Glow colour used for the dot indicator underlight */
  glow: string;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (index: number) => void;
  /** When true, prev/next/dot buttons are disabled (used by 3D during transition) */
  disabled?: boolean;
  /** Extra classes on the outermost wrapper */
  className?: string;
  /** Inline styles on the outermost wrapper — use for position (bottom, transform…) */
  style?: React.CSSProperties;
}

const CarousalController: React.FC<CarousalControllerProps> = ({
  events,
  currentIndex,
  gradient,
  glow,
  onPrev,
  onNext,
  onGoTo,
  disabled = false,
  className = "",
  style,
}) => {
  const total = events.length;

  return (
    <div className={`${className}`} style={style}>
      <div className="relative">
        {/* Glass backdrop */}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl -z-10" />
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

        {/* Buttons + dots row */}
        <div className="relative flex items-center justify-center gap-6 px-8 py-5">
          {/* Prev */}
          <button
            onClick={onPrev}
            disabled={disabled}
            className="group p-3 rounded-full bg-gradient-to-r from-white/5 to-white/10 border border-white/20 text-white hover:scale-110 active:scale-95 transition-all duration-300 hover:border-white/40 hover:shadow-lg hover:shadow-black/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft
              size={22}
              className="group-hover:-translate-x-1 transition-transform"
            />
          </button>

          {/* Dot indicators */}
          <div className="flex items-center gap-4 px-5 py-2.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-sm">
            {events.map((_, i) => (
              <button
                key={i}
                onClick={() => onGoTo(i)}
                disabled={disabled}
                className={`h-2 rounded-full transition-all duration-300 disabled:cursor-not-allowed ${
                  i === currentIndex
                    ? `w-9 bg-gradient-to-r ${gradient} shadow-md shadow-black/30`
                    : "w-2 bg-gray-500 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>

          {/* Next */}
          <button
            onClick={onNext}
            disabled={disabled}
            className="group p-3 rounded-full bg-gradient-to-r from-white/5 to-white/10 border border-white/20 text-white hover:scale-110 active:scale-95 transition-all duration-300 hover:border-white/40 hover:shadow-lg hover:shadow-black/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight
              size={22}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </div>

        {/* "Event X of Y" counter badge */}
        <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <div className="px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-sm text-gray-300">
            Event{" "}
            <span className="font-bold text-white">{currentIndex + 1}</span>
            {" "}of {total}
          </div>
        </div>

        {/* Glow underlight */}
        <div
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-3/4 h-3 blur-xl rounded-full -z-20"
          style={{ background: glow, opacity: 0.3 }}
        />
      </div>
    </div>
  );
};

export default CarousalController;