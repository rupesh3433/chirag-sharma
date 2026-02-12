import React, { useMemo } from "react";
import { Service, SelectedPackage, Package } from "../../types/services";
import { PackageCard } from "./PackageCard";
import { ImagePanel } from "./ImagePanel";

type ServiceDetailsPanelProps = {
  service: Service;
  selectedPackages: SelectedPackage[];
  onAddPackage: (pkg: Package) => void;
  onRemovePackage: (pkg: Package) => void;
  onBookSingle: () => void;
};

const isValidService = (
  service: Service | null | undefined
): service is Service => {
  return (
    !!service &&
    !!service.id &&
    !!service.name &&
    Array.isArray(service.packages) &&
    Array.isArray(service.images)
  );
};

const isValidPackage = (
  pkg: Package | null | undefined
): pkg is Package => {
  return !!pkg && !!pkg.id && !!pkg.serviceId;
};

export const ServiceDetailsPanel: React.FC<ServiceDetailsPanelProps> = ({
  service,
  selectedPackages,
  onAddPackage,
  onRemovePackage,
  onBookSingle,
}) => {
  if (!isValidService(service)) {
    return (
      <div className="w-full p-3 xs:p-4 rounded-lg xs:rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs xs:text-sm">
        Invalid service data.
      </div>
    );
  }

  const safeSelectedPackages = useMemo(() => {
    if (!Array.isArray(selectedPackages)) return [];
    return selectedPackages.filter(
      (p) =>
        p &&
        typeof p.serviceId === "string" &&
        typeof p.packageId === "string"
    );
  }, [selectedPackages]);

  const isSelected = (pkg: Package) =>
    safeSelectedPackages.some(
      (p) => p.serviceId === pkg.serviceId && p.packageId === pkg.id
    );

  const handleToggle = (pkg: Package, selected: boolean) => {
    if (!isValidPackage(pkg)) return;
    selected ? onAddPackage(pkg) : onRemovePackage(pkg);
  };

  const hasPackages = service.packages.length > 0;

  return (
    <section className="w-full">
      <div
        className="
          flex flex-col
          lg:flex-row
          gap-4 xs:gap-5 sm:gap-6
          lg:items-stretch
        "
      >

        {/* RIGHT PANEL (Image First on Mobile & Tablet) */}
        <div
          className="
            order-1
            lg:order-2
            w-full
            lg:w-auto
            lg:h-[550px] xl:h-[600px]
            flex-shrink-0
          "
        >
          <ImagePanel images={service.images} />
        </div>

        {/* LEFT PANEL (Details) */}
        <div
          className="
            order-2
            lg:order-1
            flex-1
            flex flex-col
            lg:h-[550px] xl:h-[600px]
            lg:max-h-[550px] xl:max-h-[600px]
          "
        >
          {/* HEADER */}
          <div className="flex-shrink-0 space-y-1.5 xs:space-y-2 mb-3 xs:mb-4">
            <h2 className="font-playfair font-bold text-gray-900 text-base xs:text-lg sm:text-xl md:text-2xl lg:text-[clamp(18px,1.2vw,28px)] leading-tight">
              {service.name}
            </h2>

            {service.tagline && (
              <p className="text-gray-600 italic text-xs xs:text-sm sm:text-base lg:text-[clamp(13px,0.9vw,18px)] leading-relaxed">
                {service.tagline}
              </p>
            )}
          </div>

          {/* PACKAGES SECTION */}
          <div className="flex flex-col flex-1 min-h-0">

            <h3 className="flex-shrink-0 font-semibold text-gray-800 border-b border-pink-200 pb-2 mb-2 xs:mb-3 text-xs xs:text-sm sm:text-base lg:text-[clamp(14px,1vw,20px)]">
              Available Packages
            </h3>

            {/* SCROLLABLE CARDS */}
            <div
              className="
                flex-1
                min-h-0
                overflow-y-auto
                pr-1 xs:pr-2
                scrollbar-hide
              "
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#fbbf24 transparent'
              }}
            >
              {hasPackages ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4 pb-2">
                  {service.packages.map((pkg) =>
                    isValidPackage(pkg) ? (
                      <PackageCard
                        key={pkg.id}
                        pkg={pkg}
                        isSelected={isSelected(pkg)}
                        onToggle={handleToggle}
                      />
                    ) : null
                  )}
                </div>
              ) : (
                <div className="p-3 xs:p-4 rounded-lg xs:rounded-xl bg-gray-50 border border-gray-200 text-gray-500 text-xs xs:text-sm text-center">
                  No packages available.
                </div>
              )}
            </div>
          </div>

          {/* CTA BUTTON */}
          <div className="flex-shrink-0 pt-3 xs:pt-4">
            <button
              onClick={onBookSingle}
              className="
                w-full 
                py-2.5 xs:py-3 sm:py-3.5
                rounded-lg xs:rounded-xl
                font-semibold
                bg-gradient-to-r from-pink-500 to-pink-600
                text-white shadow-md
                hover:shadow-lg hover:scale-[1.02]
                active:scale-[0.98]
                transition-all duration-200
                text-xs xs:text-sm sm:text-base lg:text-[clamp(14px,1vw,20px)]
                touch-manipulation
              "
            >
              Book This Service
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};