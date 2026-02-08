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
        padding: `${paddingCqi}cqi`,
      }}
    >
      {/* FULL-WIDTH FLEX — THIS IS THE CRITICAL FIX */}
      <div className="flex items-center justify-between w-full min-w-0">
        {/* ================= LEFT ================= */}
        <div
          className="flex items-center min-w-0"
          style={{ gap: `${gapCqi}cqi` }}
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
                width: "12cqi",
                height: "12cqi",
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
                fontSize: "6cqi",
                lineHeight: 1.1,
                maxWidth: "60cqi",
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
            style={{ gap: `${gapCqi}cqi` }}
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
                  width: "12cqi",
                  height: "12cqi",
                }}
              >
                {React.cloneElement(action.icon, {
                  className: "w-[8cqi] h-[8cqi]",
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
