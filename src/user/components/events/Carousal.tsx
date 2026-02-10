import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { EventItem } from "../../types/event";
import EventCard from "./EventCard";
import { useCarouselStateMachine } from "./useCarouselStateMachine";
import {
  BREAKPOINTS,
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

interface CarousalProps {
  events: EventItem[];
  currentIndex: number;
  setIndex: (i: number) => void;
  onSelect: (event: EventItem) => void;
  activeSection?: ColorTheme;
  configOverrides?: CarouselConfigOverrides;
}

type DeviceType = "mobile" | "tablet" | "laptop" | "desktop";

const Carousal: React.FC<CarousalProps> = ({
  events,
  currentIndex,
  setIndex,
  onSelect,
  activeSection = "current",
  configOverrides = {},
}) => {
  const total = events.length;
  const timerRef = useRef<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [deviceType, setDeviceType] = useState<DeviceType>("desktop");

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [initialTouchCount, setInitialTouchCount] = useState(0);

  const colors = COLORS[activeSection];

  const getVerticalOffset = () => {
    const deviceOffset = configOverrides.verticalOffset?.[deviceType];
    return deviceOffset !== undefined ? deviceOffset : VERTICAL_OFFSET[deviceType];
  };

  const getAnimationDuration = () => {
    return configOverrides.animationDuration || ANIMATION.duration;
  };

  const getSwipeThreshold = () => {
    return configOverrides.swipeThreshold !== undefined ? configOverrides.swipeThreshold : MOBILE_SWIPE.threshold;
  };

  const getAutoplayDelay = () => {
    return configOverrides.autoplayDelay !== undefined ? configOverrides.autoplayDelay : ANIMATION.autoplayDelay;
  };

  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      if (width < BREAKPOINTS.mobile) {
        setDeviceType("mobile");
      } else if (width < BREAKPOINTS.tablet) {
        setDeviceType("tablet");
      } else if (width < BREAKPOINTS.laptop) {
        setDeviceType("laptop");
      } else {
        setDeviceType("desktop");
      }
    };

    detectDevice();
    window.addEventListener("resize", detectDevice);
    return () => window.removeEventListener("resize", detectDevice);
  }, []);

  const isMobile = deviceType === "mobile";
  const isTablet = deviceType === "tablet";
  const isDesktopOrLaptop = deviceType === "desktop" || deviceType === "laptop";
  const machineDevice = isMobile ? "mobile" : "desktop";

  const { state, next, prev, goTo } = useCarouselStateMachine(
    currentIndex,
    total,
    machineDevice
  );

  useEffect(() => {
    if (total > 0 && currentIndex >= total) {
      setIndex(0);
    }
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
    
    if (isMobile && touches === 1) {
      isValidSwipe = true;
    } else if (isTablet && (touches === 1 || touches === 2)) {
      isValidSwipe = true;
    } else if (isDesktopOrLaptop && touches === 2) {
      isValidSwipe = true;
    }

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
    
    if (isMobile) {
      setDragOffset(clientX - touchStart);
    }
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
    const isLeftSwipe = distance > threshold;
    const isRightSwipe = distance < -threshold;

    if (isLeftSwipe) {
      next();
    } else if (isRightSwipe) {
      prev();
    }

    setTouchStart(null);
    setTouchEnd(null);
    setIsDragging(false);
    setDragOffset(0);
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

  const handleMobileCardClick = (eventIndex: number) => {
    if (eventIndex === state.currentIndex) {
      // Center card - open details
      onSelect(events[eventIndex]);
    } else {
      // Side card - navigate to it
      goTo(eventIndex);
    }
  };

  if (total === 0) {
    return (
      <div className="py-32 text-center text-gray-400 text-xl">
        No events available
      </div>
    );
  }

  const verticalOffset = getVerticalOffset();

  if (isMobile) {
    return (
      <section
        className="relative flex flex-col items-center justify-center overflow-hidden"
        style={{
          height: carouselHeight,
          paddingLeft: SPACING.mobile.carouselPaddingX,
          paddingRight: SPACING.mobile.carouselPaddingX,
          paddingTop: SPACING.mobile.carouselPaddingY,
          paddingBottom: SPACING.mobile.carouselPaddingY,
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 40%, ${colors.light} 0%, transparent 70%)`,
            filter: "blur(60px)",
            opacity: 0.5,
            transform: `translateY(${verticalOffset}px)`,
          }}
        />

        <div
          className="relative w-full flex-1 flex items-center justify-center overflow-visible"
          style={{
            transform: `translateY(${verticalOffset}px)`,
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="relative flex items-center justify-center"
            style={{
              width: cardDims.width,
              height: cardDims.height,
            }}
          >
            {events.map((event, i) => {
              const offset = i - state.currentIndex;
              const isActive = i === state.currentIndex;
              const isVisible = Math.abs(offset) <= 1;

              if (!isVisible) return null;

              const baseTranslateX =
                offset * (cardDims.width + MOBILE_SWIPE.cardGap);
              const translateX = baseTranslateX + (isDragging ? dragOffset : 0);
              const scale = isActive ? 1 : MOBILE_SWIPE.inactiveScale;
              const opacity = isActive ? 1 : MOBILE_SWIPE.inactiveOpacity;
              const zIndex = isActive ? 20 : 10;
              const animationDuration = getAnimationDuration();

              return (
                <div
                  key={event.id}
                  className="absolute top-0 left-1/2 cursor-pointer"
                  style={{
                    transform: `translateX(calc(-50% + ${translateX}px)) scale(${scale})`,
                    opacity,
                    zIndex,
                    transition: isDragging
                      ? "none"
                      : `all ${animationDuration} ${ANIMATION.easing}`,
                    pointerEvents: "auto", // Enable clicks on all visible cards
                  }}
                  onClick={(e) => {
                    // Prevent click if user was dragging
                    if (Math.abs(dragOffset) > 5) return;
                    e.stopPropagation();
                    handleMobileCardClick(i);
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
                    onClick={(e) => {
                      // This onClick is for the button inside the card
                      // Only active card has the button, so this is safe
                      e.stopPropagation();
                      
                    }}
                    className="rounded-2xl"
                    isMobile={true}
                    style={{
                      transition: isDragging
                        ? "none"
                        : `all ${animationDuration} ${ANIMATION.easing}`,
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div
          className="relative z-30 w-full max-w-sm"
          style={{ 
            marginTop: SPACING.mobile.controlsBottomOffset,
            transform: `translateY(${verticalOffset}px)`,
          }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl -z-10" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

            <div
              className="relative flex items-center justify-center px-6 py-4"
              style={{ gap: SPACING.mobile.controlsGap }}
            >
              <button
                onClick={prev}
                className="group p-3 rounded-full bg-gradient-to-r from-white/5 to-white/10 border border-white/20 text-white hover:scale-110 active:scale-95 transition-all duration-300 hover:border-white/40"
              >
                <ChevronLeft
                  size={20}
                  className="group-hover:-translate-x-1 transition-transform"
                />
              </button>

              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-black/40 border border-white/10 backdrop-blur-sm">
                {events.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === state.currentIndex
                        ? `w-8 bg-gradient-to-r ${colors.gradient} shadow-md`
                        : "w-2 bg-gray-500 active:bg-gray-400"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={next}
                className="group p-3 rounded-full bg-gradient-to-r from-white/5 to-white/10 border border-white/20 text-white hover:scale-110 active:scale-95 transition-all duration-300 hover:border-white/40"
              >
                <ChevronRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </div>

            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
              <div className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-xs text-gray-300">
                Event{" "}
                <span className="font-bold text-white">{state.currentIndex + 1}</span>{" "}
                of {total}
              </div>
            </div>

            <div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-2 blur-xl rounded-full -z-20"
              style={{
                background: colors.glow,
                opacity: 0.3,
              }}
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative flex items-center justify-center direction-reverse overflow-hidden"
      style={{ height: carouselHeight }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${colors.light} 0%, transparent 60%)`,
          filter: "blur(80px)",
          opacity: 0.4,
          transform: `translateY(${verticalOffset}px)`,
        }}
      />

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
            pointerEvents: "none", // CRITICAL: No clicks on 3D layer
          }}
        >
          {state.visualOrder.map((eventIndex, slotIndex) => {
            const event = events[eventIndex];
            const slot = SLOTS[slotIndex];
            const animationDuration = getAnimationDuration();
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
                  pointerEvents: "none", // No interaction
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
                  onClick={() => {}} // No-op
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
            pointerEvents: "none", // Container is non-interactive
          }}
        >
          {state.visualOrder.map((eventIndex, slotIndex) => {
            const event = events[eventIndex];
            const slot = SLOTS[slotIndex];
            const animationDuration = getAnimationDuration();
            const isCenter = slotIndex === 2;

            // Calculate scaled dimensions for hit area
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
                  `, // FLAT: only translateX
                  width: hitWidth,
                  height: hitHeight,
                  zIndex: 100 + slot.zIndex, // Above visual layer
                  pointerEvents: "auto", // CRITICAL: Handles clicks
                  transition: `all ${animationDuration} ${ANIMATION.easing}`,
                  // DEBUG: Uncomment to see hit areas
                  // background: isCenter ? 'rgba(255,0,0,0.3)' : 'rgba(0,255,0,0.3)',
                  // border: '2px solid yellow',
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

      <div
        className="absolute"
        style={{ 
          bottom: SPACING.desktop.controlsBottomOffset,
          transform: `translateY(${verticalOffset}px)`,
        }}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl -z-10" />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

          <div
            className="relative flex items-center px-8 py-5"
            style={{ gap: SPACING.desktop.controlsGap }}
          >
            <button
              onClick={prev}
              disabled={state.phase === "TRANSITION"}
              className="group p-3 rounded-full bg-gradient-to-r from-white/5 to-white/10 border border-white/20 text-white hover:scale-110 transition-all duration-300 hover:border-white/40 hover:shadow-lg hover:shadow-black/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft
                size={22}
                className="group-hover:-translate-x-1 transition-transform"
              />
            </button>

            <div className="flex items-center gap-5 px-5 py-2.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-sm">
              {events.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  disabled={state.phase === "TRANSITION"}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === state.currentIndex
                      ? `w-9 bg-gradient-to-r ${colors.gradient} shadow-md shadow-black/30`
                      : "w-2 bg-gray-500 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              disabled={state.phase === "TRANSITION"}
              className="group p-3 rounded-full bg-gradient-to-r from-white/5 to-white/10 border border-white/20 text-white hover:scale-110 transition-all duration-300 hover:border-white/40 hover:shadow-lg hover:shadow-black/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight
                size={22}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>

          <div className="absolute -bottom-9 left-1/2 -translate-x-1/2">
            <div className="px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-sm text-gray-300">
              Event{" "}
              <span className="font-bold text-white">{state.currentIndex + 1}</span> of{" "}
              {total}
            </div>
          </div>

          <div
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-3/4 h-3 blur-xl rounded-full -z-20"
            style={{
              background: colors.glow,
              opacity: 0.3,
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default Carousal;