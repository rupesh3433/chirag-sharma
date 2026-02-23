// Carousal3D.tsx

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
  SLOTS,
  SPACING,
  COLORS,
  VERTICAL_OFFSET,
  type ColorTheme,
  type CarouselConfigOverrides,
} from "./carouselConfig";

interface Carousal3DProps {
  events: EventItem[];
  currentIndex: number;
  setIndex: (i: number) => void;
  onSelect: (event: EventItem) => void;
  activeSection: ColorTheme;
  deviceType: "mobile" | "tablet" | "laptop" | "desktop";
  configOverrides: CarouselConfigOverrides;
}

const Carousal3D: React.FC<Carousal3DProps> = ({
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

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [initialTouchCount, setInitialTouchCount] = useState(0);

  const colors = COLORS[activeSection];
  const isTablet = deviceType === "tablet";
  const isDesktopOrLaptop = deviceType === "desktop" || deviceType === "laptop";

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

  const { state, next, prev, goTo } = useCarouselStateMachine(
    currentIndex,
    total,
    "desktop"
  );

  useEffect(() => {
    if (total > 0 && currentIndex >= total) setIndex(0);
  }, [total, currentIndex, setIndex]);

  useEffect(() => {
    setIndex(state.currentIndex);
  }, [state.currentIndex, setIndex]);

  const cardDims = CARD_DIMENSIONS[deviceType];
  const carouselHeight = CAROUSEL_HEIGHTS[deviceType];

  useEffect(() => {
    if (paused || total <= 1 || isDragging || state.phase === "TRANSITION") return;

    timerRef.current = setInterval(() => {
      next();
    }, getAutoplayDelay());

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, state.phase, total, next, isDragging, getAutoplayDelay]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touches = e.touches.length;
    setInitialTouchCount(touches);

    let isValidSwipe = false;
    if (isTablet && (touches === 1 || touches === 2)) isValidSwipe = true;
    else if (isDesktopOrLaptop && touches === 2) isValidSwipe = true;

    if (!isValidSwipe) return;

    let clientX = 0;
    if (touches === 1) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
    }

    setTouchEnd(null);
    setTouchStart(clientX);
    setIsDragging(true);
    setPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null || !isDragging) return;

    const touches = e.touches.length;
    if (touches !== initialTouchCount) return;

    let clientX = 0;
    if (touches === 1) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
    }

    setTouchEnd(clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsDragging(false);
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
    setInitialTouchCount(0);
    setPaused(false);
  };

  const handleCardClick = (slotIndex: number) => {
    const isCenter = slotIndex === 2;

    if (isCenter) {
      const eventIndex = state.visualOrder[slotIndex];
      onSelect(events[eventIndex]);
    } else {
      const eventIndexInArray = state.visualOrder[slotIndex];
      goTo(eventIndexInArray);
    }
  };

  const verticalOffset = getVerticalOffset();
  const animationDuration = getAnimationDuration();

  return (
    <section
      className="relative flex items-center justify-center direction-reverse overflow-hidden"
      style={{ height: carouselHeight }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${colors.light} 0%, transparent 60%)`,
          filter: "blur(80px)",
          opacity: 0.4,
          transform: `translateY(${verticalOffset}px)`,
        }}
      />

      {/* 3D scene */}
      <div
        className="relative w-full h-full flex items-center justify-center"
        style={{
          perspective: "1600px",
          perspectiveOrigin: "50% 50%",
          transform: `translateY(${verticalOffset}px)`,
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* ========================================== */}
        {/* LAYER 1: VISUAL (3D) - pointer-events: none */}
        {/* ========================================== */}
        <div
          className="absolute inset-0"
          style={{
            transformStyle: "preserve-3d",
            pointerEvents: "none",
          }}
        >
          {state.visualOrder.map((eventIndex, slotIndex) => {
            const event = events[eventIndex];
            const slot = SLOTS[slotIndex];
            const isCenter = slotIndex === 2;

            return (
              <div
                key={`visual-${event.id}`}
                className="absolute top-1/2 left-1/2"
                style={{
                  transform: `
                    translate(-50%, -50%)
                    translateX(${slot.position.x}px)
                    translateY(${slot.position.y}px)
                    translateZ(${slot.position.z}px)
                    rotateY(${slot.rotateY}deg)
                    scale(${slot.scale})
                  `,
                  transformStyle: "preserve-3d",
                  zIndex: slot.zIndex,
                  opacity: slot.opacity,
                  pointerEvents: "none",
                  transition: `all ${animationDuration} ${ANIMATION.easing}`,
                  willChange: "transform, opacity",
                }}
              >
                <EventCard
                  event={event}
                  width={cardDims.width}
                  height={cardDims.height}
                  isActive={isCenter}
                  gradient={colors.gradient}
                  glow={colors.glow}
                  brightness={slot.brightness}
                  blur={slot.blur}
                  saturation={0.7 + slotIndex * 0.075}
                  boxShadow={
                    slotIndex === 2
                      ? `0 0 180px ${colors.glow}CC, 0 45px 100px rgba(0,0,0,0.85)`
                      : slotIndex === 1 || slotIndex === 3
                      ? `0 0 80px ${colors.glow}70, 0 22px 55px rgba(0,0,0,0.7)`
                      : `0 14px 40px rgba(0,0,0,0.55)`
                  }
                  onClick={() => {}}
                  isMobile={false}
                />
              </div>
            );
          })}
        </div>

        {/* ========================================== */}
        {/* LAYER 2: INTERACTION (FLAT) - handles ALL clicks */}
        {/* ========================================== */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "100%",
            height: cardDims.height,
            pointerEvents: "none",
          }}
        >
          {state.visualOrder.map((eventIndex, slotIndex) => {
            const event = events[eventIndex];
            const slot = SLOTS[slotIndex];
            const isCenter = slotIndex === 2;

            const hitWidth = cardDims.width * slot.scale;
            const hitHeight = cardDims.height * slot.scale;

            return (
              <div
                key={`interaction-${event.id}`}
                className="absolute top-1/2 left-1/2 cursor-pointer"
                style={{
                  transform: `
                    translate(-50%, -50%)
                    translateX(${slot.flatX}px)
                  `,
                  width: hitWidth,
                  height: hitHeight,
                  zIndex: 100 + slot.zIndex,
                  pointerEvents: "auto",
                  transition: `all ${animationDuration} ${ANIMATION.easing}`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick(slotIndex);
                }}
                title={isCenter ? "Click to view details" : "Click to navigate"}
              />
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <CarousalController
        events={events}
        currentIndex={state.currentIndex}
        gradient={colors.gradient}
        glow={colors.glow}
        onPrev={prev}
        onNext={next}
        onGoTo={goTo}
        disabled={state.phase === "TRANSITION"}
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: SPACING.desktop.controlsBottomOffset,
          transform: `translateX(-50%) translateY(${verticalOffset}px)`,
        }}
      />
    </section>
  );
};

export default Carousal3D;