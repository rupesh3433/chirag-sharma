// carouselConfig.ts

export const BREAKPOINTS = {
    mobile: 768,
    tablet: 1024,
    laptop: 1440,
  } as const;
  
  export const CARD_DIMENSIONS = {
    mobile: { width: 280, height: 400 },
    tablet: { width: 190, height: 290 },
    laptop: { width: 200, height: 300 },
    desktop: { width: 220, height: 320 },
  } as const;
  
  export const CAROUSEL_HEIGHTS = {
    mobile: 600,
    tablet: 520,
    laptop: 580,
    desktop: 600,
  } as const;
  
  export const VERTICAL_OFFSET = {
    mobile: -30,
    tablet: -70,
    laptop: -90,
    desktop: -80,
  } as const;
  
  export const ANIMATION = {
    autoplayDelay: 2000,
    duration: "0.4s",
    easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  } as const;
  
  export const MOBILE_SWIPE = {
    threshold: 30,
    cardGap: 5,
    inactiveScale: 0.85,
    inactiveOpacity: 0.4,
  } as const;
  
  const CIRCLE_RADIUS = 380;
  const CIRCLE_DEPTH = 350;
  
  export type SlotId =
    | "BACK_LEFT"
    | "SIDE_LEFT"
    | "CENTER"
    | "SIDE_RIGHT"
    | "BACK_RIGHT";
  
  interface BaseSlot {
    readonly id: SlotId;
    readonly angle: number;
    readonly radius: number;
    readonly scale: number;
    readonly zIndex: number;
    readonly opacity: number;
    readonly brightness: number;
    readonly blur: number;
  }
  
  export interface Slot extends BaseSlot {
    readonly position: {
      x: number;
      y: number;
      z: number;
    };
    readonly rotateY: number;
    readonly flatX: number; // NEW: Flat position for interaction layer
  }
  
  const BASE_SLOTS = [
    {
      id: "BACK_LEFT",
      angle: -30,
      radius: CIRCLE_RADIUS,
      scale: 0.48,
      zIndex: 1,
      opacity: 0.5,
      brightness: 0.5,
      blur: 4,
    },
    {
      id: "SIDE_LEFT",
      angle: -60,
      radius: CIRCLE_RADIUS,
      scale: 0.88,
      zIndex: 2,
      opacity: 0.85,
      brightness: 0.88,
      blur: 0.8,
    },
    {
      id: "CENTER",
      angle: 0,
      radius: CIRCLE_RADIUS,
      scale: 1.2, // REDUCED from 1.5 to prevent overlap
      zIndex: 3,
      opacity: 1,
      brightness: 1,
      blur: 0,
    },
    {
      id: "SIDE_RIGHT",
      angle: 60,
      radius: CIRCLE_RADIUS,
      scale: 0.88,
      zIndex: 2,
      opacity: 0.85,
      brightness: 0.88,
      blur: 0.8,
    },
    {
      id: "BACK_RIGHT",
      angle: 30,
      radius: CIRCLE_RADIUS,
      scale: 0.48,
      zIndex: 1,
      opacity: 0.5,
      brightness: 0.5,
      blur: 4,
    },
  ] as const satisfies readonly BaseSlot[];
  
  // Flat interaction positions (where cards appear visually)
  const FLAT_POSITIONS = [-450, -230, 0, 230, 450]; // x positions in pixels
  
  export const SLOTS: readonly Slot[] = BASE_SLOTS.map((slot, index) => {
    const angleRad = (slot.angle * Math.PI) / 180;
  
    const x = Math.sin(angleRad) * slot.radius;
    const z = Math.cos(angleRad) * CIRCLE_DEPTH - CIRCLE_DEPTH;
  
    return {
      ...slot,
      position: {
        x,
        y: 0,
        z,
      },
      rotateY: -slot.angle * 0.75,
      flatX: FLAT_POSITIONS[index], // Flat position for hit-testing
    };
  });
  
  export const SPACING = {
    mobile: {
      carouselPaddingX: 16,
      carouselPaddingY: 20,
      controlsBottomOffset: 24,
      controlsGap: 24,
    },
    desktop: {
      carouselPaddingX: 0,
      carouselPaddingY: 0,
      controlsBottomOffset: -10,
      controlsGap: 14,
    },
  } as const;
  
  export const COLORS = {
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
  } as const;
  
  export type ColorTheme = keyof typeof COLORS;
  
  export interface CarouselConfigOverrides {
    verticalOffset?: Partial<typeof VERTICAL_OFFSET>;
    animationDuration?: string;
    swipeThreshold?: number;
    autoplayDelay?: number;
  }