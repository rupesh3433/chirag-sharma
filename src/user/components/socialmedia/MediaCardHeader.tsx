import React from "react";

export type MediaHeaderAction = {
  id: string;
  icon: React.ReactElement;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

interface MediaCardHeaderProps {
  logo?: React.ReactNode;
  title?: string;
  actions?: MediaHeaderAction[];
  paddingCqi?: number;
  gapCqi?: number;
}

const MediaCardHeader: React.FC<MediaCardHeaderProps> = ({
  logo,
  title,
  actions = [],
  paddingCqi = 6,
  gapCqi = 3,
}) => {
  return (
    <div
      className="
        absolute top-0 left-0 right-0 z-20
        pointer-events-none
      "
      style={{
        /* ↓ MOBILE-FIRST: smaller top padding */
        padding: `clamp(8px, ${paddingCqi}cqi, 20px)`,
      }}
    >
      {/* FULL-WIDTH FLEX */}
      <div className="flex items-center justify-between w-full min-w-0">
        {/* ================= LEFT ================= */}
        <div
          className="flex items-center min-w-0"
          style={{ gap: `clamp(6px, ${gapCqi}cqi, 14px)` }}
        >
          {logo && (
            <div
              className="
                flex-shrink-0
                rounded-full
                overflow-hidden
                bg-black/60
                backdrop-blur-sm
                shadow-lg
              "
              style={{
                /* ↓ Smaller avatar on mobile */
                width: "clamp(28px, 10cqi, 44px)",
                height: "clamp(28px, 10cqi, 44px)",
              }}
            >
              {logo}
            </div>
          )}

          {title && (
            <span
              className="
                text-white
                font-semibold
                truncate
                drop-shadow-lg
              "
              style={{
                /* ↓ Smaller, cleaner text on mobile */
                fontSize: "clamp(11px, 5.2cqi, 15px)",
                lineHeight: 1.15,
                maxWidth: "clamp(140px, 60cqi, 260px)",
              }}
            >
              {title}
            </span>
          )}
        </div>

        {/* ================= RIGHT ================= */}
        {actions.length > 0 && (
          <div
            className="flex items-center pointer-events-auto"
            style={{ gap: `clamp(6px, ${gapCqi}cqi, 14px)` }}
          >
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={action.onClick}
                className="
                  flex items-center justify-center
                  rounded-full
                  bg-black/50
                  backdrop-blur-sm
                  text-white
                  hover:bg-black/70
                  transition
                "
                style={{
                  /* ↓ Smaller buttons on mobile */
                  width: "clamp(28px, 10cqi, 44px)",
                  height: "clamp(28px, 10cqi, 44px)",
                }}
              >
                {React.cloneElement(action.icon, {
                  className: "w-[clamp(14px,7cqi,20px)] h-[clamp(14px,7cqi,20px)]",
                  strokeWidth: 2,
                })}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaCardHeader;
