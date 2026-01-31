import React, { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Clock,
} from "lucide-react";
import { Event } from "@/pages/Events";

/* ================= PROPS ================= */

interface CarousalProps {
  events: Event[];
  currentIndex: number;
  setIndex: (i: number) => void;
  onSelect: (event: Event) => void;
  activeSection?: "current" | "upcoming" | "past";
}

/* ================= GLOBAL CONTROLS ================= */

/* Timing */
const AUTOPLAY_DELAY = 4500;
const ROTATION_DURATION = "0.4s";
const ROTATION_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

/* Card - Responsive sizes */
const CARD_WIDTH_MOBILE = 260;
const CARD_WIDTH_DESKTOP = 300;
const CARD_HEIGHT_MOBILE = 420;
const CARD_HEIGHT_DESKTOP = 500;

/* Ring */
const RADIUS_DESKTOP = 820;
const RADIUS_MOBILE = 500;
const VISIBLE_ARC = 100;

/* Camera */
const PERSPECTIVE_DESKTOP = 3600;
const PERSPECTIVE_MOBILE = 1800;

/* Depth & dominance */
const FRONT_SCALE_DESKTOP = 1.4;
const FRONT_SCALE_MOBILE = 1.3;
const SIDE_SCALE_DESKTOP = 0.3;
const SIDE_SCALE_MOBILE = 0.2;
const DEPTH_Y_OFFSET = 90;

/* Lighting */
const BRIGHTNESS_FRONT = 1.5;
const BRIGHTNESS_BACK = 0.5;
const BLUR_MAX = 7;
const SATURATION_MIN = 0.6;

/* Curvature settings */
const SLICE_COUNT = 1;
const MAX_CURVE_ANGLE = 35;

/* ================= UTILS ================= */

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

/* ================= CAROUSAL ================= */

const Carousal: React.FC<CarousalProps> = ({
  events,
  currentIndex,
  setIndex,
  onSelect,
  activeSection = "current",
}) => {
  const total = events.length;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [paused, setPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  /* ================= RESPONSIVE DETECTION ================= */

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  /* ================= RESPONSIVE VALUES ================= */

  const CARD_WIDTH = isMobile ? CARD_WIDTH_MOBILE : CARD_WIDTH_DESKTOP;
  const CARD_HEIGHT = isMobile ? CARD_HEIGHT_MOBILE : CARD_HEIGHT_DESKTOP;
  const RADIUS = isMobile ? RADIUS_MOBILE : RADIUS_DESKTOP;
  const PERSPECTIVE = isMobile ? PERSPECTIVE_MOBILE : PERSPECTIVE_DESKTOP;
  const FRONT_SCALE = isMobile ? FRONT_SCALE_MOBILE : FRONT_SCALE_DESKTOP;
  const SIDE_SCALE = isMobile ? SIDE_SCALE_MOBILE : SIDE_SCALE_DESKTOP;

  /* ================= AUTOPLAY ================= */

  useEffect(() => {
    if (paused || total <= 1) return;

    timerRef.current = setInterval(() => {
      setIndex((currentIndex + 1) % total);
    }, AUTOPLAY_DELAY);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, currentIndex, total, setIndex]);

  /* ================= COLORS ================= */

  const COLORS = {
    current: {
      glow: "#ec4899",
      gradient: "from-pink-500 to-purple-500",
      soft: "from-pink-500/20 to-purple-500/20",
      light: "rgba(236, 72, 153, 0.15)",
    },
    upcoming: {
      glow: "#3b82f6",
      gradient: "from-blue-500 to-cyan-500",
      soft: "from-blue-500/20 to-cyan-500/20",
      light: "rgba(59, 130, 246, 0.15)",
    },
    past: {
      glow: "#6b7280",
      gradient: "from-gray-500 to-gray-600",
      soft: "from-gray-500/20 to-gray-600/20",
      light: "rgba(107, 114, 128, 0.15)",
    },
  }[activeSection];

  if (total === 0) {
    return (
      <div className="py-32 text-center text-gray-400 text-xl">
        No events available
      </div>
    );
  }

  const angleStep = 360 / total;
  const wrap = (i: number) => (i + total) % total;

  /* ================= RENDER ================= */

  return (
    <section
      className="relative h-[600px] md:h-[900px] flex items-center justify-center overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* AMBIENT LIGHTING */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${COLORS.light} 0%, transparent 60%)`,
          filter: 'blur(60px)',
          opacity: 0.4
        }}
      />

      {/* CAMERA */}
      <div
        className="absolute inset-0"
        style={{
          perspective: `${PERSPECTIVE}px`,
          perspectiveOrigin: "50% 50%",
        }}
      />

      {/* CONTROLS PANEL - ALWAYS AT TOP */}
      <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-30">
      <div className="relative">
          {/* Glass panel background */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl -z-10" />
          
          {/* Inner glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          
          {/* Control buttons */}
          <div className="relative flex items-center gap-4 md:gap-8 px-6 md:px-10 py-4 md:py-6">
            {/* Left arrow */}
            <button
              onClick={() => setIndex(wrap(currentIndex - 1))}
              className="group p-3 md:p-4 rounded-full bg-gradient-to-r from-white/5 to-white/10 border border-white/20 text-white hover:scale-110 transition-all duration-300 hover:border-white/40 hover:shadow-lg hover:shadow-black/30"
            >
              <ChevronLeft 
                size={isMobile ? 20 : 24} 
                className="group-hover:-translate-x-1 transition-transform"
              />
            </button>

            {/* Dots indicator */}
            <div className="flex items-center gap-4 md:gap-6 px-4 md:px-6 py-2 md:py-3 rounded-full bg-black/40 border border-white/10 backdrop-blur-sm">
              {events.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentIndex
                      ? `w-6 md:w-10 bg-gradient-to-r ${COLORS.gradient} shadow-md shadow-black/30`
                      : "w-2 bg-gray-500 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>

            {/* Right arrow */}
            <button
              onClick={() => setIndex(wrap(currentIndex + 1))}
              className="group p-3 md:p-4 rounded-full bg-gradient-to-r from-white/5 to-white/10 border border-white/20 text-white hover:scale-110 transition-all duration-300 hover:border-white/40 hover:shadow-lg hover:shadow-black/30"
            >
              <ChevronRight 
                size={isMobile ? 20 : 24} 
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>

          {/* Floating info badge */}
          <div className="absolute -bottom-8 md:-bottom-10 left-1/2 -translate-x-1/2">
            <div className="px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-xs md:text-sm text-gray-300">
              Event <span className="font-bold text-white">{currentIndex + 1}</span> of {total}
            </div>
          </div>

          {/* Decorative glow behind panel */}
          <div 
            className="absolute -bottom-2 md:-bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-2 md:h-4 blur-xl rounded-full -z-20"
            style={{
              background: COLORS.glow,
              opacity: 0.3
            }}
          />
        </div>
      </div>

      {/* EARTH EQUATOR RING */}
      <div
        className="relative w-full h-full flex items-center justify-center"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateY(${-currentIndex * angleStep}deg)`,
          transition: `transform ${ROTATION_DURATION} ${ROTATION_EASING}`,
        }}
      >
        {events.map((event, i) => {
          const angle = i * angleStep;

          const relative =
            ((angle - currentIndex * angleStep + 540) % 360) - 180;

          const abs = Math.abs(relative);
          if (abs > VISIBLE_ARC) return null;

          /* Earth-like depth */
          const depth = Math.cos((abs * Math.PI) / 180);
          const z = RADIUS * depth;
          const y = depth * DEPTH_Y_OFFSET;

          /* Visual dominance */
          const t = clamp((VISIBLE_ARC - abs) / VISIBLE_ARC, 0, 1);
          const scale = SIDE_SCALE + t * (FRONT_SCALE - SIDE_SCALE);
          const brightness =
            BRIGHTNESS_BACK + t * (BRIGHTNESS_FRONT - BRIGHTNESS_BACK);
          const blur = (1 - t) * BLUR_MAX;
          const saturation = SATURATION_MIN + t * (1 - SATURATION_MIN);

          /* Curvature based on position */
          const curveIntensity = (1 - t) * MAX_CURVE_ANGLE;
          const curveDirection = relative > 0 ? 1 : -1;

          const isActive = i === currentIndex;

          return (
            <div
              key={event.id}
              className="absolute"
              style={{
                transform: `
                  rotateY(${angle}deg)
                  translateZ(${z}px)
                  translateY(${-y}px)
                `,
                transformStyle: "preserve-3d",
              }}
              onClick={() =>
                isActive ? onSelect(event) : setIndex(i)
              }
            >
              {/* CARD (tangent to Earth surface) */}
              <div
                className="relative rounded-2xl md:rounded-3xl overflow-hidden border border-white/10"
                style={{
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT,
                  transform: `scale(${scale})`,
                  filter: `
                    brightness(${brightness})
                    blur(${blur}px)
                    saturate(${saturation})
                  `,
                  boxShadow: isActive
                    ? `0 0 ${isMobile ? '100px' : '180px'} ${COLORS.glow}AA`
                    : `0 15px 40px rgba(0,0,0,0.55)`,
                  transition: `all ${ROTATION_DURATION} ${ROTATION_EASING}`,
                }}
              >
                {/* CURVED IMAGE SLICES */}
                <div className="absolute inset-0 flex">
                  {Array.from({ length: SLICE_COUNT }).map((_, sliceIndex) => {
                    const position = (sliceIndex / (SLICE_COUNT - 1)) * 2 - 1;
                    const sliceCurve = curveIntensity * Math.abs(position) * curveDirection;
                    
                    return (
                      <div
                        key={sliceIndex}
                        className="h-full"
                        style={{
                          width: `${100 / SLICE_COUNT}%`,
                          backgroundImage: `url(${event.poster})`,
                          backgroundSize: `${CARD_WIDTH * SLICE_COUNT}px 100%`,
                          backgroundPositionX: `-${sliceIndex * (CARD_WIDTH / SLICE_COUNT)}px`,
                          backgroundPositionY: 'center',
                          backgroundRepeat: 'no-repeat',
                          transform: `rotateY(${sliceCurve}deg)`,
                          transformOrigin: position > 0 ? 'left center' : 'right center',
                          transition: `transform ${ROTATION_DURATION} ${ROTATION_EASING}`,
                        }}
                      />
                    );
                  })}
                </div>

                {/* EDGE SHADING */}
                <div className="absolute inset-0 bg-gradient-to-l from-black/65 via-transparent to-black/65" />

                {/* OVERLAY */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${
                    isActive
                      ? "from-black/95 via-black/40 to-transparent"
                      : "from-black/95 via-black/80 to-black/60"
                  }`}
                />

                {/* BADGE */}
                {isActive && event.badge && (
                  <div className="absolute top-4 md:top-5 right-4 md:right-5 z-10">
                    <span
                      className={`px-3 md:px-4 py-1.5 md:py-2 text-xs font-bold text-white rounded-full bg-gradient-to-r ${COLORS.gradient}`}
                    >
                      {event.badge}
                    </span>
                  </div>
                )}

                {/* CONTENT */}
                <div className="absolute bottom-0 p-5 md:p-7 text-white">
                  <h3 className="text-lg md:text-2xl font-bold mb-2 md:mb-3">
                    {event.title}
                  </h3>

                  <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-gray-300">
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <Calendar size={isMobile ? 12 : 14} /> 
                      <span className="truncate">{event.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <MapPin size={isMobile ? 12 : 14} /> 
                      <span className="truncate">{event.location}</span>
                    </div>
                    {event.duration && (
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <Clock size={isMobile ? 12 : 14} /> 
                        <span className="truncate">{event.duration}</span>
                      </div>
                    )}
                  </div>

                  {isActive && (
                    <div
                      className={`mt-4 md:mt-5 py-2.5 md:py-3 text-center text-sm md:text-base font-bold rounded-xl bg-gradient-to-r ${COLORS.gradient}`}
                    >
                      View Full Details
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MOBILE SWIPE HINT (Only on mobile) */}
      {isMobile && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-xs text-gray-300">
            ← Swipe or tap to navigate →
          </div>
        </div>
      )}
    </section>
  );
};

export default Carousal;