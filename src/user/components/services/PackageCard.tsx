import React, { useCallback } from "react";
import { Package } from "../../types/services";
import { Check } from "lucide-react";

type PackageCardProps = {
  pkg: Package;
  isSelected: boolean;
  onToggle: (pkg: Package, selected: boolean) => void;
};

export const PackageCard: React.FC<PackageCardProps> = ({
  pkg,
  isSelected,
  onToggle,
}) => {
  const features = Array.isArray(pkg.features) ? pkg.features : [];
  const price =
    typeof pkg.price === "number" && !Number.isNaN(pkg.price)
      ? pkg.price
      : 0;

  const handleClick = useCallback(() => {
    onToggle(pkg, !isSelected);
  }, [onToggle, pkg, isSelected]);

  return (
    <div
      className={`
        w-full
        max-w-full
        p-3 xs:p-4 sm:p-4 md:p-5
        rounded-xl xs:rounded-2xl
        border-2
        transition-all duration-200
        overflow-hidden
        flex flex-col
        min-h-[180px] xs:min-h-[200px] sm:min-h-[220px]
        ${
          isSelected
            ? "border-pink-500 bg-pink-50/60 shadow-md ring-2 ring-pink-200"
            : "border-gray-200 bg-white hover:border-pink-300 hover:shadow-sm"
        }
      `}
    >
      <div className="flex flex-col h-full justify-between gap-2 xs:gap-3">

        {/* Package Name */}
        <h4 className="font-semibold text-gray-900 text-sm xs:text-base sm:text-base md:text-lg lg:text-[clamp(14px,1vw,20px)] break-words leading-tight">
          {pkg.name}
        </h4>

        {/* Price + Button */}
        <div className="flex items-center justify-between gap-2 xs:gap-3 flex-wrap xs:flex-nowrap">
          <span className="font-bold text-pink-600 text-base xs:text-lg sm:text-xl md:text-2xl lg:text-[clamp(16px,1.2vw,24px)] whitespace-nowrap">
            ₹{price.toLocaleString("en-IN")}
          </span>

          <button
            type="button"
            onClick={handleClick}
            aria-pressed={isSelected}
            aria-label={isSelected ? `Remove ${pkg.name}` : `Add ${pkg.name}`}
            className={`
              shrink-0
              px-3 xs:px-4 sm:px-5 md:px-6
              py-1.5 xs:py-2 sm:py-2
              rounded-full font-medium
              transition-all duration-200
              text-xs xs:text-sm sm:text-sm md:text-base
              lg:text-[clamp(12px,0.8vw,16px)]
              touch-manipulation
              active:scale-95
              ${
                isSelected
                  ? "bg-pink-100 text-pink-700 hover:bg-pink-200 shadow-sm"
                  : "bg-pink-500 text-white hover:bg-pink-600 shadow-md hover:shadow-lg"
              }
            `}
          >
            {isSelected ? "✓ Added" : "Add"}
          </button>
        </div>

        {/* Features */}
        {features.length > 0 && (
          <ul className="pt-2 xs:pt-3 border-t border-gray-100 space-y-1.5 xs:space-y-2">
            {features.map((feature, idx) => (
              <li
                key={`${pkg.id}-feature-${idx}`}
                className="flex items-start text-gray-600 text-xs xs:text-sm sm:text-sm md:text-base lg:text-[clamp(12px,0.8vw,16px)] break-words"
              >
                <Check
                  size={14}
                  className="mr-1.5 xs:mr-2 mt-0.5 text-pink-500 flex-shrink-0 w-3.5 h-3.5 xs:w-4 xs:h-4"
                />
                <span className="leading-snug">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        )}

      </div>
    </div>
  );
};
