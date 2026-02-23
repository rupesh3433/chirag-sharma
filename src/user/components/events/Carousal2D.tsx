// Carousal2D.tsx

import React, { useEffect, useRef, useState } from "react";
import type { EventItem } from "../../types/event";
import EventCard from "./EventCard";
import CarousalController from "./CarousalController";
import { useCarouselStateMachine } from "./useCarouselStateMachine";
import {
  CARD_DIMENSIONS,
  CAROUSEL_HEIGHTS,
  ANIMATION,
  MOBILE_SWIPE,
  SPACING,
  COLORS,
  VERTICAL_OFFSET,
  type ColorTheme,
  type CarouselConfigOverrides,
} from "./carouselConfig";

// ═══════════════════════════════════════════════════════════════
//  PER-DEVICE LAYOUT CONFIG
//  Edit anything here to adjust the carousel for each breakpoint.
//
//  cardShiftDown      — moves the card track down (+) or up (-)
//  centerScale        — scale of the active/center card (1.0 = natural size)
//  sideScaleStep      — how much smaller each card gets per step from center
//                        ±1 = centerScale - sideScaleStep
//                        ±2 = centerScale - sideScaleStep * 2   … etc.
//  cardGap            — px gap between adjacent card edges
//  controlsBottomOffset — px from the bottom of the section to the controls bar
// ═══════════════════════════════════════════════════════════════
const DEVICE_CONFIG = {
  mobile: {
    cardShiftDown:          -50,   // px  ↕ card track vertical shift
    centerScale:           1.05,  //     active card size
    sideScaleStep:         0.22,  //     shrink per step away
    cardGap:                 0,   // px  (mobile stride is window-based, gap unused)
    controlsBottomOffset:   70,   // px  ↕ controls bar from bottom
  },
  tablet: {
    cardShiftDown:          0,   // px
    centerScale:            1.1,  //
    sideScaleStep:         0.25,  //
    cardGap:                40,   // px
    controlsBottomOffset:   60,   // px
  },
  laptop: {
    cardShiftDown:          0,   // px
    centerScale:            1.2,  //
    sideScaleStep:         0.25,  //
    cardGap:                70,   // px
    controlsBottomOffset:   100,   // px
  },
  desktop: {
    cardShiftDown:          -10,   // px
    centerScale:            1.2,  //
    sideScaleStep:         0.25,  //
    cardGap:                30,   // px
    controlsBottomOffset:   100,   // px
  },
} as const satisfies Record<
  "mobile" | "tablet" | "laptop" | "desktop",
  {
    cardShiftDown: number;
    centerScale: number;
    sideScaleStep: number;
    cardGap: number;
    controlsBottomOffset: number;
  }
>;

// How many cards away from center to keep mounted (they peek or slide off-screen)
const VISIBLE_RANGE = 3;

// ───────────────────────────────────────────────────────────────

interface Carousal2DProps {
  events: EventItem[];
  currentIndex: number;
  setIndex: (i: number) => void;
  onSelect: (event: EventItem) => void;
  activeSection: ColorTheme;
  deviceType: "mobile" | "tablet" | "laptop" | "desktop";
  configOverrides: CarouselConfigOverrides;
}

const Carousal2D: React.FC<Carousal2DProps> = ({
  events,
  currentIndex,
  setIndex,
  onSelect,
  activeSection,
  deviceType,
  configOverrides,
}) => {
  const total = events.length;
  const timerRef = useRef<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 375
  );

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [initialTouchCount, setInitialTouchCount] = useState(0);

  const colors = COLORS[activeSection];
  const isMobile = deviceType === "mobile";
  const isTablet = deviceType === "tablet";
  const isDesktopOrLaptop = deviceType === "desktop" || deviceType === "laptop";

  // ── Pull values from per-device config ──────────────────────
  const cfg = DEVICE_CONFIG[deviceType];

  // Keep windowWidth in sync for accurate mobile stride on resize
  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Tablet uses desktop card dimensions so it looks identical to desktop layout
  const cardDims =
    deviceType === "tablet" ? CARD_DIMENSIONS["desktop"] : CARD_DIMENSIONS[deviceType];
  const carouselHeight = CAROUSEL_HEIGHTS[deviceType];

  // ── Stride ──────────────────────────────────────────────────
  // Mobile: stride so that exactly ~10% of adjacent card is visible at both edges.
  //   stride = windowWidth/2 + cardWidth/2 - (windowWidth × 0.10)
  // Everything else: raw card width + per-device gap
  const stride = isMobile
    ? windowWidth / 2 + cardDims.width / 2 - windowWidth * 0.13
    : cardDims.width + cfg.cardGap;

  const getVerticalOffset = () => {
    const deviceOffset = configOverrides.verticalOffset?.[deviceType];
    return deviceOffset !== undefined ? deviceOffset : VERTICAL_OFFSET[deviceType];
  };

  const getAnimationDuration = () =>
    configOverrides.animationDuration || ANIMATION.duration;

  const getSwipeThreshold = () =>
    configOverrides.swipeThreshold !== undefined
      ? configOverrides.swipeThreshold
      : MOBILE_SWIPE.threshold;

  const getAutoplayDelay = () =>
    configOverrides.autoplayDelay !== undefined
      ? configOverrides.autoplayDelay
      : ANIMATION.autoplayDelay;

  const machineDevice = isMobile ? "mobile" : "desktop";
  const { state, next, prev, goTo } = useCarouselStateMachine(
    currentIndex,
    total,
    machineDevice
  );

  useEffect(() => {
    if (total > 0 && currentIndex >= total) setIndex(0);
  }, [total, currentIndex, setIndex]);

  useEffect(() => {
    setIndex(state.currentIndex);
  }, [state.currentIndex, setIndex]);

  useEffect(() => {
    if (paused || total <= 1 || isDragging || state.phase === "TRANSITION") return;
    timerRef.current = setInterval(() => next(), getAutoplayDelay());
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, state.phase, total, next, isDragging, getAutoplayDelay]);

  // ── Touch / swipe ────────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    const touches = e.touches.length;
    setInitialTouchCount(touches);

    let isValidSwipe = false;
    if (isMobile && touches === 1) isValidSwipe = true;
    else if (isTablet && (touches === 1 || touches === 2)) isValidSwipe = true;
    else if (isDesktopOrLaptop && touches === 2) isValidSwipe = true;

    if (!isValidSwipe) return;

    const clientX =
      touches === 1
        ? e.touches[0].clientX
        : (e.touches[0].clientX + e.touches[1].clientX) / 2;

    setTouchEnd(null);
    setTouchStart(clientX);
    setIsDragging(true);
    setPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null || !isDragging) return;
    const touches = e.touches.length;
    if (touches !== initialTouchCount) return;

    const clientX =
      touches === 1
        ? e.touches[0].clientX
        : (e.touches[0].clientX + e.touches[1].clientX) / 2;

    setTouchEnd(clientX);
    setDragOffset(clientX - touchStart!);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsDragging(false);
      setDragOffset(0);
      setInitialTouchCount(0);
      setPaused(false);
      return;
    }

    const distance = touchStart - touchEnd;
    const threshold = getSwipeThreshold();
    if (distance > threshold) next();
    else if (distance < -threshold) prev();

    setTouchStart(null);
    setTouchEnd(null);
    setIsDragging(false);
    setDragOffset(0);
    setInitialTouchCount(0);
    setPaused(false);
  };

  const handleCardClick = (eventIndex: number) => {
    if (eventIndex === state.currentIndex) {
      onSelect(events[eventIndex]);
    } else {
      goTo(eventIndex);
    }
  };

  const verticalOffset = getVerticalOffset();
  const animationDuration = getAnimationDuration();

  return (
    <section
      className="relative overflow-hidden"
      style={{
        height: carouselHeight,
        paddingLeft: SPACING.mobile.carouselPaddingX,
        paddingRight: SPACING.mobile.carouselPaddingX,
        paddingTop: SPACING.mobile.carouselPaddingY,
        paddingBottom: SPACING.mobile.carouselPaddingY,
      }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${colors.light} 0%, transparent 70%)`,
          filter: "blur(60px)",
          opacity: 0.5,
          transform: `translateY(${verticalOffset}px)`,
        }}
      />

      {/* Controls bar — pinned to bottom, isolated from card shift */}
      <CarousalController
        events={events}
        currentIndex={state.currentIndex}
        gradient={colors.gradient}
        glow={colors.glow}
        onPrev={prev}
        onNext={next}
        onGoTo={goTo}
        className="absolute left-1/2 -translate-x-1/2 z-30 w-full max-w-sm"
        style={{ bottom: cfg.controlsBottomOffset }}
      />

      {/* Cards track — shifted by verticalOffset + per-device cardShiftDown */}
      <div
        className="absolute inset-0 flex items-center justify-center overflow-visible"
        style={{ transform: `translateY(${verticalOffset + cfg.cardShiftDown}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="relative flex items-center justify-center"
          style={{
            width: "100%",
            height: cardDims.height * cfg.centerScale,
          }}
        >
          {events.map((event, i) => {
            // Shortest circular path → correct animation direction always
            let offset = i - state.currentIndex;
            if (offset > total / 2) offset -= total;
            if (offset < -(total / 2)) offset += total;

            const isActive = i === state.currentIndex;
            const absOffset = Math.abs(offset);

            if (absOffset > VISIBLE_RANGE) return null;

            const translateX = offset * stride + (isDragging ? dragOffset : 0);

            // Progressive scale: center → shrinks per step using per-device values
            const scale = isActive
              ? cfg.centerScale
              : Math.max(0.4, cfg.centerScale - absOffset * cfg.sideScaleStep);

            // Gentle opacity fade with distance
            const opacity = isActive
              ? 1
              : Math.max(0.35, 1 - absOffset * 0.18);

            const zIndex = isActive ? 20 : 10 - absOffset;

            return (
              <div
                key={event.id}
                className="absolute left-1/2 top-1/2 cursor-pointer"
                style={{
                  // top:50% + translateY(-50%) → scale() grows equally up & down
                  transform: `translateX(calc(-50% + ${translateX}px)) translateY(-50%) scale(${scale})`,
                  opacity,
                  zIndex,
                  transition: isDragging
                    ? "none"
                    : `all ${animationDuration} ${ANIMATION.easing}`,
                  pointerEvents: "auto",
                }}
                onClick={(e) => {
                  if (Math.abs(dragOffset) > 5) return;
                  e.stopPropagation();
                  handleCardClick(i);
                }}
              >
                <EventCard
                  event={event}
                  width={cardDims.width}
                  height={cardDims.height}
                  isActive={isActive}
                  gradient={colors.gradient}
                  glow={colors.glow}
                  overlay={
                    isActive
                      ? "from-black/95 via-black/40 to-transparent"
                      : "from-black/95 via-black/70 to-black/50"
                  }
                  boxShadow={
                    isActive
                      ? `0 0 80px ${colors.glow}AA, 0 20px 60px rgba(0,0,0,0.6)`
                      : `0 10px 30px rgba(0,0,0,0.5)`
                  }
                  onClick={(e) => e.stopPropagation()}
                  className="rounded-2xl"
                  isMobile={isMobile}
                  style={{
                    transition: isDragging
                      ? "none"
                      : `all ${animationDuration} ${ANIMATION.easing}`,
                  }}
                />

                {/* Dark overlay — deepens with distance: ±1→0.28, ±2→0.56, ±3→0.72 */}
                {!isActive && (
                  <div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                      background: `rgba(0,0,0,${Math.min(0.72, absOffset * 0.28)})`,
                      transition: `background ${animationDuration} ${ANIMATION.easing}`,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Carousal2D;