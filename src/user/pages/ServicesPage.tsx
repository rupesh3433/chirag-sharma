import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { SERVICES } from "../data/services";
import { Package } from "../types/services";
import {
  SelectedPackagesProvider,
  useSelectedPackages,
} from "../components/services/SelectedPackagesContext";
import { HalfCircleSelector } from "../components/services/HalfCircleSelector";
import { PricingSummary } from "../components/services/PricingSummary";
import { ServiceDetailsPanel } from "../components/services/ServiceDetailsPanel";

const NAVBAR_HEIGHT = 60;
const MOBILE_PILL_HEIGHT = 50; // Adjust if pill height changes

const ServicesPageContent: React.FC = () => {
  const { state, dispatch } = useSelectedPackages();
  const location = useLocation();
  const navigate = useNavigate();

  const [isSummaryCollapsed, setIsSummaryCollapsed] = useState(false);
  const [summaryHeight, setSummaryHeight] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // -----------------------------------
  // Detect Mobile
  // -----------------------------------
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // Tailwind sm breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // -----------------------------------
  // Set Active Service
  // -----------------------------------
  useEffect(() => {
    if (location.state?.selectedServiceId) {
      dispatch({
        type: "SET_ACTIVE_SERVICE",
        payload: location.state.selectedServiceId,
      });
    } else if (!state.activeServiceId && SERVICES.length > 0) {
      dispatch({
        type: "SET_ACTIVE_SERVICE",
        payload: SERVICES[0].id,
      });
    }
  }, [location.state, dispatch, state.activeServiceId]);

  const activeService =
    SERVICES.find((s) => s.id === state.activeServiceId) || SERVICES[0];

  // -----------------------------------
  // Package Handlers
  // -----------------------------------
  const handleAddPackage = useCallback(
    (pkg: Package) => {
      dispatch({
        type: "ADD_PACKAGE",
        payload: {
          serviceId: pkg.serviceId,
          packageId: pkg.id,
          packageName: pkg.name,
          price: pkg.price,
          quantity: 1,
        },
      });
    },
    [dispatch]
  );

  const handleRemovePackage = useCallback(
    (pkg: Package) => {
      dispatch({
        type: "REMOVE_PACKAGE",
        payload: {
          serviceId: pkg.serviceId,
          packageId: pkg.id,
        },
      });
    },
    [dispatch]
  );

  const handleBookSingle = () => {
    const servicePackages = state.selectedPackages.filter(
      (p) => p.serviceId === activeService.id
    );

    navigate("/book", {
      state: {
        type: "single",
        serviceId: activeService.id,
        serviceName: activeService.name,
        selectedPackages: servicePackages,
      },
    });
  };

  // -----------------------------------
  // Dynamic Padding Logic
  // -----------------------------------
  const dynamicPaddingTop =
    NAVBAR_HEIGHT +
    (state.selectedPackages.length > 0 && !isSummaryCollapsed
      ? summaryHeight
      : 0) +
    (state.selectedPackages.length > 0 &&
    isSummaryCollapsed &&
    isMobile
      ? MOBILE_PILL_HEIGHT
      : 0);

  return (
    <div className="min-h-screen flex flex-col bg-white">

      <Navbar />

      {/* Pricing Summary */}
      <PricingSummary
        selectedPackages={state.selectedPackages}
        isCollapsed={isSummaryCollapsed}
        onCollapsedChange={setIsSummaryCollapsed}
        onHeightChange={setSummaryHeight}
      />

      {/* MAIN CONTENT */}
      <main
        className="flex-grow w-full pb-16 transition-all duration-300"
        style={{ paddingTop: dynamicPaddingTop }}
      >
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 flex flex-col gap-8 md:gap-10 lg:gap-12">

          <div className="w-full flex justify-center">
            <HalfCircleSelector
              services={SERVICES}
              activeId={state.activeServiceId}
              onSelect={(id) =>
                dispatch({
                  type: "SET_ACTIVE_SERVICE",
                  payload: id,
                })
              }
            />
          </div>

          <div className="w-full">
            <ServiceDetailsPanel
              service={activeService}
              selectedPackages={state.selectedPackages}
              onAddPackage={handleAddPackage}
              onRemovePackage={handleRemovePackage}
              onBookSingle={handleBookSingle}
            />
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

const ServicesPage: React.FC = () => {
  return (
    <SelectedPackagesProvider>
      <ServicesPageContent />
    </SelectedPackagesProvider>
  );
};

export default ServicesPage;
