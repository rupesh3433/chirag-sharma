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
const CARD_WIDTH_MOBILE = 280;
const CARD_WIDTH_DESKTOP = 300;
const CARD_HEIGHT_MOBILE = 400;
const CARD_HEIGHT_DESKTOP = 500;

/* Ring - Desktop 3D */
const RADIUS_DESKTOP = 820;
const VISIBLE_ARC = 100;

/* Camera - Desktop 3D */
const PERSPECTIVE_DESKTOP = 3600;

/* Depth & dominance - Desktop 3D */
const FRONT_SCALE_DESKTOP = 1.4;
const SIDE_SCALE_DESKTOP = 0.3;
const DEPTH_Y_OFFSET = 90;

/* Lighting - Desktop 3D */
const BRIGHTNESS_FRONT = 1.5;
const BRIGHTNESS_BACK = 0.5;
const BLUR_MAX = 7;
const SATURATION_MIN = 0.6;

/* Curvature settings - Desktop 3D */
const MAX_CURVE_ANGLE = 35;

/* Mobile 2D Swipe */
const SWIPE_THRESHOLD = 50;
const MOBILE_CARD_GAP = 20;

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
  
  // Touch/Swipe state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

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

  /* ================= AUTOPLAY ================= */

  useEffect(() => {
    if (paused || total <= 1 || isDragging) return;

    timerRef.current = setInterval(() => {
      setIndex((currentIndex + 1) % total);
    }, AUTOPLAY_DELAY);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, currentIndex, total, setIndex, isDragging]);

  /* ================= TOUCH/SWIPE HANDLERS ================= */

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
    setPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    const offset = currentTouch - touchStart;
    setDragOffset(offset);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsDragging(false);
      setDragOffset(0);
      setPaused(false);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > SWIPE_THRESHOLD;
    const isRightSwipe = distance < -SWIPE_THRESHOLD;

    if (isLeftSwipe) {
      setIndex((currentIndex + 1) % total);
    } else if (isRightSwipe) {
      setIndex((currentIndex - 1 + total) % total);
    }

    setTouchStart(null);
    setTouchEnd(null);
    setIsDragging(false);
    setDragOffset(0);
    setPaused(false);
  };

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

  /* ================= RENDER MOBILE 2D ================= */

  if (isMobile) {
    return (
      <section className="relative h-[550px] flex flex-col items-center justify-center overflow-hidden px-4 py-5">
        {/* AMBIENT LIGHTING */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 40%, ${COLORS.light} 0%, transparent 70%)`,
            filter: 'blur(60px)',
            opacity: 0.5
          }}
        />

        {/* CARD CONTAINER WITH SWIPE */}
        <div 
          className="relative w-full flex-1 flex items-center justify-center overflow-visible"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="relative flex items-center justify-center"
            style={{
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
            }}
          >
            {events.map((event, i) => {
              const offset = i - currentIndex;
              const isActive = i === currentIndex;
              const isAdjacent = Math.abs(offset) === 1;
              const isVisible = Math.abs(offset) <= 1;

              if (!isVisible) return null;

              const baseTranslateX = offset * (CARD_WIDTH + MOBILE_CARD_GAP);
              const translateX = baseTranslateX + (isDragging ? dragOffset : 0);
              const scale = isActive ? 1 : 0.85;
              const opacity = isActive ? 1 : 0.4;
              const zIndex = isActive ? 20 : isAdjacent ? 10 : 0;

              return (
                <div
                  key={event.id}
                  className="absolute top-0 left-1/2"
                  style={{
                    transform: `
                      translateX(calc(-50% + ${translateX}px))
                      scale(${scale})
                    `,
                    opacity: opacity,
                    zIndex: zIndex,
                    transition: isDragging 
                      ? 'none' 
                      : `all ${ROTATION_DURATION} ${ROTATION_EASING}`,
                    pointerEvents: isActive ? 'auto' : 'none',
                  }}
                  onClick={() => isActive && onSelect(event)}
                >
                  {/* CARD */}
                  <div
                    className="relative rounded-2xl overflow-hidden border border-white/10"
                    style={{
                      width: CARD_WIDTH,
                      height: CARD_HEIGHT,
                      boxShadow: isActive
                        ? `0 0 80px ${COLORS.glow}AA, 0 20px 60px rgba(0,0,0,0.6)`
                        : `0 10px 30px rgba(0,0,0,0.5)`,
                    }}
                  >
                    {/* IMAGE */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${event.poster})`,
                      }}
                    />

                    {/* OVERLAY */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-t ${
                        isActive
                          ? "from-black/95 via-black/40 to-transparent"
                          : "from-black/95 via-black/70 to-black/50"
                      }`}
                    />

                    {/* BADGE */}
                    {isActive && event.badge && (
                      <div className="absolute top-4 right-4 z-10">
                        <span
                          className={`px-3 py-1.5 text-xs font-bold text-white rounded-full bg-gradient-to-r ${COLORS.gradient}`}
                        >
                          {event.badge}
                        </span>
                      </div>
                    )}

                    {/* CONTENT */}
                    <div className="absolute bottom-0 p-5 text-white w-full">
                      <h3 className="text-xl font-bold mb-2 line-clamp-2">
                        {event.title}
                      </h3>

                      <div className="space-y-1.5 text-xs text-gray-300">
                        <div className="flex items-center gap-2">
                          <Calendar size={12} /> 
                          <span className="truncate">{event.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={12} /> 
                          <span className="truncate">{event.location}</span>
                        </div>
                        {event.duration && (
                          <div className="flex items-center gap-2">
                            <Clock size={12} /> 
                            <span className="truncate">{event.duration}</span>
                          </div>
                        )}
                      </div>

                      {isActive && (
                        <button
                          className={`mt-4 w-full py-2.5 text-center text-sm font-bold rounded-xl bg-gradient-to-r ${COLORS.gradient} shadow-lg`}
                        >
                          View Full Details
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CONTROLS AT BOTTOM */}
        <div className="relative mt-6 mb-4 z-30 w-full max-w-sm">
          <div className="relative">
            {/* Glass panel background */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl -z-10" />
            
            {/* Inner glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            
            {/* Control buttons */}
            <div className="relative flex items-center justify-center gap-6 px-6 py-4">
              {/* Left arrow */}
              <button
                onClick={() => setIndex(wrap(currentIndex - 1))}
                className="group p-3 rounded-full bg-gradient-to-r from-white/5 to-white/10 border border-white/20 text-white hover:scale-110 active:scale-95 transition-all duration-300 hover:border-white/40"
              >
                <ChevronLeft 
                  size={20} 
                  className="group-hover:-translate-x-1 transition-transform"
                />
              </button>

              {/* Dots indicator */}
              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-black/40 border border-white/10 backdrop-blur-sm">
                {events.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === currentIndex
                        ? `w-8 bg-gradient-to-r ${COLORS.gradient} shadow-md`
                        : "w-2 bg-gray-500 active:bg-gray-400"
                    }`}
                  />
                ))}
              </div>

              {/* Right arrow */}
              <button
                onClick={() => setIndex(wrap(currentIndex + 1))}
                className="group p-3 rounded-full bg-gradient-to-r from-white/5 to-white/10 border border-white/20 text-white hover:scale-110 active:scale-95 transition-all duration-300 hover:border-white/40"
              >
                <ChevronRight 
                  size={20} 
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </div>

            {/* Event counter */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
              <div className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-xs text-gray-300">
                Event <span className="font-bold text-white">{currentIndex + 1}</span> of {total}
              </div>
            </div>

            {/* Decorative glow */}
            <div 
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-2 blur-xl rounded-full -z-20"
              style={{
                background: COLORS.glow,
                opacity: 0.3
              }}
            />
          </div>
        </div>

        {/* SWIPE HINT */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2">
          <div className="px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-xs text-gray-300 animate-pulse">
            ← Swipe to navigate →
          </div>
        </div>
      </section>
    );
  }

  /* ================= RENDER DESKTOP 3D ================= */

  return (
    <section
      className="relative h-[900px] flex items-center justify-center overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* AMBIENT LIGHTING */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${COLORS.light} 0%, transparent 60%)`,
          filter: 'blur(80px)',
          opacity: 0.4
        }}
      />

      {/* CAMERA */}
      <div
        className="absolute inset-0"
        style={{
          perspective: `${PERSPECTIVE_DESKTOP}px`,
          perspectiveOrigin: "50% 50%",
        }}
      />

      {/* 3D RING */}
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
          const relative = ((angle - currentIndex * angleStep + 540) % 360) - 180;
          const abs = Math.abs(relative);
          
          if (abs > VISIBLE_ARC) return null;

          /* Earth-like depth */
          const depth = Math.cos((abs * Math.PI) / 180);
          const z = RADIUS_DESKTOP * depth;
          const y = depth * DEPTH_Y_OFFSET;

          /* Visual dominance */
          const t = clamp((VISIBLE_ARC - abs) / VISIBLE_ARC, 0, 1);
          const scale = SIDE_SCALE_DESKTOP + t * (FRONT_SCALE_DESKTOP - SIDE_SCALE_DESKTOP);
          const brightness = BRIGHTNESS_BACK + t * (BRIGHTNESS_FRONT - BRIGHTNESS_BACK);
          const blur = (1 - t) * BLUR_MAX;
          const saturation = SATURATION_MIN + t * (1 - SATURATION_MIN);

          /* Curvature */
          const curveIntensity = (1 - t) * MAX_CURVE_ANGLE;
          const curveDirection = relative > 0 ? 1 : -1;

          const isActive = i === currentIndex;

          return (
            <div
              key={event.id}
              className="absolute cursor-pointer"
              style={{
                transform: `
                  rotateY(${angle}deg)
                  translateZ(${z}px)
                  translateY(${-y}px)
                `,
                transformStyle: "preserve-3d",
              }}
              onClick={() => isActive ? onSelect(event) : setIndex(i)}
            >
              {/* CARD */}
              <div
                className="relative rounded-3xl overflow-hidden border border-white/10"
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
                    ? `0 0 180px ${COLORS.glow}AA, 0 30px 80px rgba(0,0,0,0.7)`
                    : `0 15px 40px rgba(0,0,0,0.55)`,
                  transition: `all ${ROTATION_DURATION} ${ROTATION_EASING}`,
                }}
              >
                {/* IMAGE WITH SUBTLE CURVE */}
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${event.poster})`,
                    transform: `rotateY(${curveIntensity * curveDirection * 0.1}deg)`,
                  }}
                />

                {/* EDGE SHADING */}
                <div className="absolute inset-0 bg-gradient-to-l from-black/40 via-transparent to-black/40" />

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
                  <div className="absolute top-5 right-5 z-10">
                    <span
                      className={`px-4 py-2 text-xs font-bold text-white rounded-full bg-gradient-to-r ${COLORS.gradient} shadow-lg`}
                    >
                      {event.badge}
                    </span>
                  </div>
                )}

                {/* CONTENT */}
                <div className="absolute bottom-0 p-7 text-white">
                  <h3 className="text-2xl font-bold mb-3 line-clamp-2">
                    {event.title}
                  </h3>

                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} /> 
                      <span className="truncate">{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} /> 
                      <span className="truncate">{event.location}</span>
                    </div>
                    {event.duration && (
                      <div className="flex items-center gap-2">
                        <Clock size={14} /> 
                        <span className="truncate">{event.duration}</span>
                      </div>
                    )}
                  </div>

                  {isActive && (
                    <div
                      className={`mt-5 py-3 text-center text-base font-bold rounded-xl bg-gradient-to-r ${COLORS.gradient} shadow-xl cursor-pointer hover:shadow-2xl transition-shadow`}
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

      {/* CONTROLS AT BOTTOM */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
        <div className="relative">
          {/* Glass panel background */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl -z-10" />
          
          {/* Inner glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          
          {/* Control buttons */}
          <div className="relative flex items-center gap-8 px-10 py-6">
            {/* Left arrow */}
            <button
              onClick={() => setIndex(wrap(currentIndex - 1))}
              className="group p-4 rounded-full bg-gradient-to-r from-white/5 to-white/10 border border-white/20 text-white hover:scale-110 transition-all duration-300 hover:border-white/40 hover:shadow-lg hover:shadow-black/30"
            >
              <ChevronLeft 
                size={24} 
                className="group-hover:-translate-x-1 transition-transform"
              />
            </button>

            {/* Dots indicator */}
            <div className="flex items-center gap-6 px-6 py-3 rounded-full bg-black/40 border border-white/10 backdrop-blur-sm">
              {events.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentIndex
                      ? `w-10 bg-gradient-to-r ${COLORS.gradient} shadow-md shadow-black/30`
                      : "w-2 bg-gray-500 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>

            {/* Right arrow */}
            <button
              onClick={() => setIndex(wrap(currentIndex + 1))}
              className="group p-4 rounded-full bg-gradient-to-r from-white/5 to-white/10 border border-white/20 text-white hover:scale-110 transition-all duration-300 hover:border-white/40 hover:shadow-lg hover:shadow-black/30"
            >
              <ChevronRight 
                size={24} 
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>

          {/* Event counter */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
            <div className="px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-sm text-gray-300">
              Event <span className="font-bold text-white">{currentIndex + 1}</span> of {total}
            </div>
          </div>

          {/* Decorative glow */}
          <div 
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-4 blur-xl rounded-full -z-20"
            style={{
              background: COLORS.glow,
              opacity: 0.3
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default Carousal;