import React from "react";

export type FooterAction = {
  id: string;
  icon: React.ReactElement;
  count?: string | number;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

interface MediaCardFooterProps {
  description?: string;
  dateText?: string;
  actions: FooterAction[];
}

export default function MediaCardFooter({
  description,
  dateText,
  actions,
}: MediaCardFooterProps) {
  const hasLeft = Boolean(description || dateText);
  const visibleActions = actions.filter(
    (a) => a.count !== undefined || a.onClick
  );

  if (!hasLeft && visibleActions.length === 0) return null;

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 ${
        hasLeft ? "p-[6cqi]" : "p-[0.6em]"
      }`}
    >
      <div className="flex items-end justify-between gap-[5cqi]">
        {/* LEFT */}
        {hasLeft && (
          <div className="flex-1 min-w-0 flex flex-col justify-end">
            {description && (
              <p className="text-white font-medium leading-snug text-[7cqi] line-clamp-2 drop-shadow-lg">
                {description}
              </p>
            )}
            {dateText && (
              <p className="text-white/80 text-[6cqi] drop-shadow-lg">
                {dateText}
              </p>
            )}
          </div>
        )}

        {/* RIGHT — ACTION RAIL */}
        <div className="flex flex-col items-center gap-[6cqi]">
          {visibleActions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              className="
                flex flex-col items-center
                text-white
                transition-transform
                hover:scale-110
                w-[5cqi]
              "
            >
              {/* ATOMIC ACTION UNIT */}
              <div className="flex flex-col items-center">
                {React.cloneElement(action.icon, {
                  className: "w-[11cqi] h-[11cqi] drop-shadow-lg",
                  strokeWidth: 2,
                })}

                {action.count !== undefined && (
                  <span className="mt-[1cqi] text-[4.5cqi] font-semibold leading-none drop-shadow-lg">
                    {action.count}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
