// Carousal.tsx

import React, { useEffect, useState } from "react";
import type { EventItem } from "../../types/event";
import Carousal2D from "./Carousal2D";
import Carousal3D from "./Carousal3D";
import {
  BREAKPOINTS,
  type ColorTheme,
  type CarouselConfigOverrides,
} from "./carouselConfig";

// ─────────────────────────────────────────────────────────────
// Switching rules:
//   Mobile (< 768px)                        → always 2D
//   Tablet / Laptop / Desktop + events < 5  → 2D
//   Tablet / Laptop / Desktop + events >= 5 → 3D
// ─────────────────────────────────────────────────────────────

type DeviceType = "mobile" | "tablet" | "laptop" | "desktop";

interface CarousalProps {
  events: EventItem[];
  currentIndex: number;
  setIndex: (i: number) => void;
  onSelect: (event: EventItem) => void;
  activeSection?: ColorTheme;
  configOverrides?: CarouselConfigOverrides;
}

const Carousal: React.FC<CarousalProps> = ({
  events,
  currentIndex,
  setIndex,
  onSelect,
  activeSection = "current",
  configOverrides = {},
}) => {
  const [deviceType, setDeviceType] = useState<DeviceType>("desktop");

  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      if (width < BREAKPOINTS.mobile) setDeviceType("mobile");
      else if (width < BREAKPOINTS.tablet) setDeviceType("tablet");
      else if (width < BREAKPOINTS.laptop) setDeviceType("laptop");
      else setDeviceType("desktop");
    };

    detectDevice();
    window.addEventListener("resize", detectDevice);
    return () => window.removeEventListener("resize", detectDevice);
  }, []);

  if (events.length === 0) {
    return (
      <div className="py-32 text-center text-gray-400 text-xl">
        No events available
      </div>
    );
  }

  const isMobile = deviceType === "mobile";
  const shouldUse3D = !isMobile && events.length >= 5;

  const sharedProps = {
    events,
    currentIndex,
    setIndex,
    onSelect,
    activeSection,
    deviceType,
    configOverrides,
  };

  if (shouldUse3D) {
    return <Carousal3D {...sharedProps} />;
  }

  return <Carousal2D {...sharedProps} />;
};

export default Carousal;