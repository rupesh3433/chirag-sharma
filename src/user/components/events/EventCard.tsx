// EventCard.tsx
import React from "react";
import { Calendar, MapPin, Clock } from "lucide-react";
import type { EventItem } from "../../types/event";

interface EventCardProps {
  event: EventItem;
  width: number;
  height: number;
  isActive: boolean;
  gradient: string;
  glow: string;
  overlay?: string;
  brightness?: number;
  blur?: number;
  saturation?: number;
  boxShadow?: string;
  onClick: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  transform?: string;
  style?: React.CSSProperties;
  className?: string;
  isMobile?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  width,
  height,
  isActive,
  gradient,
  glow,
  overlay,
  brightness = 1,
  blur = 0,
  saturation = 1,
  boxShadow,
  onClick,
  transform,
  style = {},
  className = "",
  isMobile = false,
}) => {
  const defaultOverlay = isActive
    ? "from-black/95 via-black/40 to-transparent"
    : "from-black/95 via-black/80 to-black/60";

  const appliedOverlay = overlay || defaultOverlay;

  const defaultBoxShadow = isActive
    ? `0 0 ${width * 0.6}px ${glow}AA, 0 ${height * 0.06}px ${height * 0.15}px rgba(0,0,0,0.7)`
    : `0 ${height * 0.03}px ${height * 0.088}px rgba(0,0,0,0.55)`;

  const appliedBoxShadow = boxShadow || defaultBoxShadow;

  const padding = Math.max(16, width * 0.057);
  const titleSize = isMobile ? "text-xl" : width < 200 ? "text-base" : "text-lg";
  const textSize = isMobile ? "text-xs" : width < 200 ? "text-[10px]" : "text-xs";
  const iconSize = isMobile ? 12 : Math.max(10, width * 0.043);
  const buttonPadding = isMobile ? "py-2.5" : width < 200 ? "py-2" : "py-2.5";
  const buttonText = isMobile ? "text-sm" : width < 200 ? "text-xs" : "text-sm";
  const badgePadding = isMobile
    ? "px-3 py-1.5"
    : width < 200
    ? "px-2.5 py-1"
    : "px-3 py-1.5";
  const badgeText = isMobile ? "text-xs" : width < 200 ? "text-[10px]" : "text-xs";
  const spacing = isMobile ? "space-y-1.5" : width < 200 ? "space-y-1" : "space-y-1.5";
  const titleMargin = isMobile ? "mb-2" : width < 200 ? "mb-1.5" : "mb-2";
  const buttonMargin = isMobile ? "mt-4" : width < 200 ? "mt-3" : "mt-4";

  return (
    <div
      className={`relative rounded-3xl overflow-hidden border border-white/10 pointer-events-none ${className}`}
      style={{
        width,
        height,
        filter: `brightness(${brightness}) blur(${blur}px) saturate(${saturation})`,
        boxShadow: appliedBoxShadow,
        transform,
        ...style,
      }}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: `url(${event.poster})` }}
      />

      {/* Side Gradient */}
      <div className="absolute inset-0 bg-gradient-to-l from-black/40 via-transparent to-black/40 pointer-events-none" />

      {/* Overlay Gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-t ${appliedOverlay} pointer-events-none`}
      />

      {/* Badge */}
      {isActive && event.badge && (
        <div className="absolute top-4 right-4 z-10 pointer-events-none">
          <span
            className={`${badgePadding} ${badgeText} font-bold text-white rounded-full bg-gradient-to-r ${gradient} shadow-lg`}
          >
            {event.badge}
          </span>
        </div>
      )}

      {/* Content */}
      <div
        className="absolute bottom-0 left-0 right-0 text-white pointer-events-none"
        style={{ padding }}
      >
        <h3 className={`${titleSize} font-bold ${titleMargin} line-clamp-2 pr-2`}>
          {event.title}
        </h3>

        <div className={`${spacing} ${textSize} text-gray-300`}>
          <div className="flex items-center gap-2 pr-2">
            <Calendar size={iconSize} className="flex-shrink-0" />
            <span className="truncate">{event.date}</span>
          </div>

          <div className="flex items-center gap-2 pr-2">
            <MapPin size={iconSize} className="flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>

          {event.duration && (
            <div className="flex items-center gap-2 pr-2">
              <Clock size={iconSize} className="flex-shrink-0" />
              <span className="truncate">{event.duration}</span>
            </div>
          )}
        </div>

        {isActive && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className={`${buttonMargin} w-full ${buttonPadding} text-center ${buttonText} font-bold rounded-xl bg-gradient-to-r ${gradient} shadow-xl hover:shadow-2xl transition-shadow pointer-events-auto`}
          >
            View Full Details
          </button>
        )}
      </div>
    </div>
  );
};

export default EventCard;
