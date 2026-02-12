import React, { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronUp, ChevronDown } from "lucide-react";
import { SelectedPackage } from "../../types/services";
import { calculatePriceBreakdown } from "../../utils/pricing";

type PricingSummaryProps = {
  selectedPackages: SelectedPackage[];
  isCollapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  onHeightChange: (height: number) => void;
};

export const PricingSummary: React.FC<PricingSummaryProps> = ({
  selectedPackages,
  isCollapsed,
  onCollapsedChange,
  onHeightChange,
}) => {
  const navigate = useNavigate();
  const breakdown = calculatePriceBreakdown(selectedPackages);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const isVisible = selectedPackages.length > 0;

  const handleBooking = useCallback(() => {
    navigate("/book", {
      state: {
        type: selectedPackages.length > 1 ? "combined" : "single",
        selectedPackages,
        pricing: breakdown,
      },
    });
  }, [navigate, selectedPackages, breakdown]);

  useEffect(() => {
    if (!isVisible || isCollapsed) {
      onHeightChange(0);
      return;
    }

    const element = containerRef.current;
    if (!element) return;

    const updateHeight = () => {
      const height = element.offsetHeight;
      onHeightChange(height);
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(element);

    window.addEventListener("resize", updateHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [isVisible, isCollapsed, selectedPackages, onHeightChange]);

  if (!isVisible) return null;

  return (
    <>
      <div
        ref={containerRef}
        className={`
          fixed top-[60px] left-0 right-0 z-40
          transition-all duration-300 ease-in-out
          ${
            isCollapsed
              ? "-translate-y-full opacity-0 pointer-events-none"
              : "translate-y-0 opacity-100"
          }
        `}
      >
        <div className="bg-white border-b border-pink-100 shadow-md backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-3 xs:px-4 sm:px-6 py-2.5 xs:py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 xs:gap-3.5 sm:gap-4">

            <div className="flex-1 space-y-0.5 xs:space-y-1 text-[11px] xs:text-xs sm:text-sm md:text-base">

              <div className="flex justify-between gap-4 xs:gap-5 sm:gap-6">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900 tabular-nums">
                  ₹{breakdown.subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              {breakdown.discountPercent > 0 && (
                <>
                  <div className="flex justify-between gap-4 xs:gap-5 sm:gap-6 text-green-600">
                    <span>Discount ({breakdown.discountPercent}%)</span>
                    <span className="tabular-nums">
                      -₹{breakdown.discountAmount.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 xs:gap-5 sm:gap-6 font-bold text-gray-900 text-xs xs:text-sm sm:text-base md:text-lg">
                    <span>Total</span>
                    <span className="text-pink-600 tabular-nums">
                      ₹{breakdown.total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </>
              )}

              {breakdown.discountPercent === 0 &&
                selectedPackages.length === 1 && (
                  <div className="text-[9px] xs:text-[10px] sm:text-xs text-gray-400">
                    Add more services to unlock discounts
                  </div>
                )}
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 xs:gap-2.5 sm:gap-3">

              <button
                onClick={() => onCollapsedChange(true)}
                aria-label="Hide pricing summary"
                className="
                  text-[11px] xs:text-xs sm:text-sm 
                  text-gray-500 hover:text-gray-700 
                  underline flex items-center gap-1
                  transition-colors
                  touch-manipulation
                  p-1
                "
              >
                Hide
                <ChevronUp className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
              </button>

              <button
                onClick={handleBooking}
                aria-label={`Book ${selectedPackages.length} service${selectedPackages.length !== 1 ? 's' : ''}`}
                className="
                  bg-gradient-to-r from-pink-500 to-pink-600
                  text-white 
                  px-3 xs:px-4 sm:px-5 md:px-6 
                  py-1.5 xs:py-2 sm:py-2.5
                  text-[11px] xs:text-xs sm:text-sm md:text-base
                  rounded-full font-semibold shadow-md
                  hover:shadow-lg hover:scale-105
                  active:scale-95
                  transition-all duration-200
                  whitespace-nowrap
                  touch-manipulation
                "
              >
                <span className="hidden xs:inline">Book Now </span>
                <span className="xs:hidden">Book </span>
                ({selectedPackages.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {isCollapsed && (
        <button
          onClick={() => onCollapsedChange(false)}
          className="
            fixed
            top-[75px]
            xs:top-[72px]
            sm:top-[76px]
            md:top-[80px]
            lg:top-[70px]
            xl:top-[70px]

            right-3
            xs:right-4
            sm:right-6
            md:right-2

            z-40

            bg-gradient-to-r from-pink-500 to-pink-600
            text-white

            px-3
            xs:px-4
            sm:px-5
            md:px-3

            py-1
            xs:py-1
            sm:py-2

            text-[10px]
            xs:text-xs
            sm:text-sm
            md:text-10px

            rounded-full
            font-medium
            shadow-lg
            hover:shadow-xl
            hover:scale-105
            active:scale-95
            transition-all duration-300

            flex items-center gap-1.5
            whitespace-nowrap
            touch-manipulation
          "
        >
          <ChevronDown className="
            w-3.5 h-3.5
            xs:w-4 xs:h-4
            sm:w-4.5 sm:h-4.5
            md:w-5 md:h-5
          " />
          <span className="tabular-nums">
            Show (₹{breakdown.total.toLocaleString("en-IN")})
          </span>
        </button>
      )}
    </>
  );
};