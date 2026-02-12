import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  MotionValue,
} from "framer-motion";
import { Service } from "../../types/services";

type HalfCircleSelectorProps = {
  services: Service[];
  activeId: string | null;
  onSelect: (serviceId: string) => void;
};

const useIsMobile = (breakpoint: number = 768): boolean => {
  const getInitial = (): boolean =>
    typeof window !== "undefined" && window.innerWidth < breakpoint;

  const [isMobile, setIsMobile] = React.useState<boolean>(getInitial);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = (): void =>
      setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
};

const normalize180 = (value: number): number => {
  const r = value % 180;
  return r < 0 ? r + 180 : r;
};

export const HalfCircleSelector: React.FC<HalfCircleSelectorProps> = ({
  services,
  activeId,
  onSelect,
}) => {
  const isMobile = useIsMobile();
  const wheelRef = useRef<HTMLDivElement>(null);
  const rotationMV = useMotionValue<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const safeServices = useMemo<Service[]>(() => {
    if (!Array.isArray(services)) return [];
    return services.filter(
      (s): s is Service =>
        Boolean(s && typeof s.id === "string" && typeof s.name === "string")
    );
  }, [services]);

  const serviceCount = safeServices.length;
  if (serviceCount === 0) return null;

  const ANGLE_STEP = 170 / serviceCount;

  const handleDrag = (_: unknown, info: { delta: { y: number } }) => {
    const delta = info?.delta?.y ?? 0;
    rotationMV.set(normalize180(rotationMV.get() - delta * 0.35));
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.4;
    rotationMV.set(normalize180(rotationMV.get() - delta));
  };

  useEffect(() => {
    if (isMobile || !wheelRef.current) return;
    const el = wheelRef.current;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [isMobile]);

  const handleServiceClick = (serviceId: string, index: number) => {
    onSelect(serviceId);
  
    const desiredAngle = 90;
    const currentBase = index * ANGLE_STEP;
    const target = currentBase - desiredAngle;
  
    animate(rotationMV, target, {
      type: "spring",
      stiffness: 260,
      damping: 28,
      onUpdate: (v) => rotationMV.set(normalize180(v)),
    });
  };
  

  if (!isMobile) {
    const OUTER_RADIUS = 130;
    const INNER_RADIUS = 30;
    const CENTER = OUTER_RADIUS;
    const DIAMETER = OUTER_RADIUS * 2;
    const HIDDEN_OFFSET = -OUTER_RADIUS * 0.6;
    const VISIBLE_OFFSET = 0;

    const ServiceButton: React.FC<{
      service: Service;
      index: number;
      rotationMV: MotionValue<number>;
    }> = ({ service, index, rotationMV }) => {
      const baseAngle = index * ANGLE_STEP;

      const projectedAngle = useTransform(rotationMV, (r) => {
        let angle = baseAngle - r;
        angle = ((angle % 180) + 180) % 180;
        return angle - 90;
      });

      const depth = useTransform(rotationMV, (r) => {
        let angle = baseAngle - r;
        angle = ((angle % 180) + 180) % 180;
        return Math.abs(angle - 90) / 90;
      });

      const scale = useTransform(
        depth,
        [0, 0.45, 0.75, 1],
        [1.08, 0.98, 0.78, 0.6]
      );

      const opacity = useTransform(
        depth,
        [0, 0.35, 0.65, 0.88, 1],
        [1, 0.98, 0.75, 0.25, 0]
      );

      const blur = useTransform(
        depth,
        [0, 0.6, 0.85, 1],
        [0, 0, 1, 2.5]
      );

      const shadowIntensity = useTransform(
        depth,
        [0, 0.5, 1],
        [1, 0.5, 0.2]
      );

      const buttonMaxWidth = OUTER_RADIUS * 0.9;

      return (
        <motion.div
          className="absolute"
          style={{
            left: CENTER,
            top: CENTER,
            rotate: projectedAngle,
            transformOrigin: "0 0",
            pointerEvents: "auto",
          }}
        >
          <motion.button
            onClick={() => handleServiceClick(service.id, index)}
            style={{
              x: INNER_RADIUS,
              translateY: "-50%",
              scale,
              opacity,
              filter: useTransform(blur, (b) => `blur(${b}px)`),
              transformOrigin: "left center",
              maxWidth: `${buttonMaxWidth}px`,
            }}
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 30,
              mass: 0.85,
            }}
            className="relative px-3 py-2 rounded-full font-semibold text-sm whitespace-nowrap overflow-hidden text-ellipsis"
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #fffbfd 100%)",
              }}
            />

            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 50%, transparent 80%)",
              }}
            />

            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                padding: "1px",
                background: "linear-gradient(135deg, rgba(236, 72, 153, 0.3), rgba(219, 39, 119, 0.4))",
                WebkitMask:
                  "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
                opacity: useTransform(depth, [0, 0.6, 1], [0.6, 0.3, 0]),
              }}
            />

            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                boxShadow: useTransform(
                  shadowIntensity,
                  (si) =>
                    `0 ${2 + si * 6}px ${8 + si * 16}px rgba(236, 72, 153, ${si * 0.15}), 
                     0 ${1 + si * 2}px ${4 + si * 6}px rgba(0, 0, 0, ${si * 0.08})`
                ),
              }}
            />

            <div
              className="absolute inset-0 rounded-full"
              style={{
                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.03)",
              }}
            />

            <span
              className="relative z-10 bg-gradient-to-br from-pink-600 to-rose-600 bg-clip-text font-bold"
              style={{
                WebkitTextFillColor: "transparent",
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {service.name}
            </span>
          </motion.button>
        </motion.div>
      );
    };

    return (
      <motion.div
        ref={wheelRef}
        className="fixed z-40"
        style={{
          left: 0,
          top: `calc(50vh - ${DIAMETER / 2}px)`,
          width: `${OUTER_RADIUS}px`,
          height: `${DIAMETER}px`,
          overflow: "hidden",
          pointerEvents: "none",
          x: HIDDEN_OFFSET,
        }}
        animate={{
          x: isHovered ? VISIBLE_OFFSET : HIDDEN_OFFSET,
        }}
        transition={{
          type: "spring",
          stiffness: 140,
          damping: 22,
          mass: 1,
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <div
          className="absolute"
          style={{
            left: `-${OUTER_RADIUS}px`,
            width: `${DIAMETER}px`,
            height: `${DIAMETER}px`,
            pointerEvents: "none",
          }}
        >
          <div className="w-full h-full rounded-full relative overflow-hidden">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "linear-gradient(135deg, #f472b6 0%, #ec4899 35%, #db2777 70%, #be185d 100%)",
              }}
            />

            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(ellipse at 32% 28%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.08) 40%, transparent 70%)",
              }}
            />

            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, transparent 0%, transparent 55%, rgba(0,0,0,0.08) 92%, rgba(0,0,0,0.15) 100%)",
              }}
            />

            <div
              className="absolute inset-0 rounded-full opacity-25"
              style={{
                background:
                  "linear-gradient(175deg, transparent 0%, transparent 65%, rgba(255,255,255,0.12) 100%)",
              }}
            />
          </div>

          <div
            className="absolute rounded-full"
            style={{
              left: CENTER - INNER_RADIUS,
              top: CENTER - INNER_RADIUS,
              width: INNER_RADIUS * 2,
              height: INNER_RADIUS * 2,
              background: "linear-gradient(135deg, #ffffff 0%, #fefbfc 100%)",
              boxShadow: `
                0 0 0 1.5px rgba(236, 72, 153, 0.06),
                0 4px 20px rgba(0, 0, 0, 0.08),
                0 2px 8px rgba(236, 72, 153, 0.1),
                inset 0 1px 2px rgba(255, 255, 255, 0.9)
              `,
            }}
          >
            <div
              className="absolute inset-5 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(236, 72, 153, 0.03) 0%, transparent 75%)",
              }}
            />

            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.15) 55%, transparent 80%)",
              }}
            />
          </div>
        </div>

        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.1}
          dragMomentum={false}
          onDrag={handleDrag}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
          style={{ pointerEvents: "auto" }}
        />

        <div
          className="absolute"
          style={{
            left: `-${OUTER_RADIUS}px`,
            width: `${DIAMETER}px`,
            height: `${DIAMETER}px`,
            pointerEvents: "none",
          }}
        >
          {safeServices.map((service, index) => (
            <ServiceButton
              key={service.id}
              service={service}
              index={index}
              rotationMV={rotationMV}
            />
          ))}
        </div>

        <div
          className="absolute top-0 left-0 w-full pointer-events-none"
          style={{
            height: "140px",
            background: "transparent",
            maskImage: `radial-gradient(ellipse ${OUTER_RADIUS * 1.8}px ${
              DIAMETER * 0.3
            }px at ${OUTER_RADIUS}px 0px, transparent 0%, white 100%)`,
            WebkitMaskImage: `radial-gradient(ellipse ${
              OUTER_RADIUS * 1.8
            }px ${DIAMETER * 0.3}px at ${OUTER_RADIUS}px 0px, transparent 0%, white 100%)`,
            backdropFilter: "blur(0px)",
          }}
        >
          <div
            className="w-full h-full"
            style={{
                background: "transparent",

            }}
          />
        </div>

        <div
          className="absolute bottom-0 left-0 w-full pointer-events-none"
          style={{
            height: "140px",
            background: "transparent",
            maskImage: `radial-gradient(ellipse ${OUTER_RADIUS * 1.8}px ${
              DIAMETER * 0.3
            }px at ${OUTER_RADIUS}px ${DIAMETER}px, transparent 0%, white 100%)`,
            WebkitMaskImage: `radial-gradient(ellipse ${
              OUTER_RADIUS * 1.8
            }px ${DIAMETER * 0.3}px at ${OUTER_RADIUS}px ${DIAMETER}px, transparent 0%, white 100%)`,
            backdropFilter: "blur(0px)",
          }}
        >
          <div
            className="w-full h-full"
            style={{
                background: "transparent",

            }}
          />
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full overflow-x-auto pb-3 xs:pb-4 -mx-3 xs:-mx-4 px-3 xs:px-4 mt-1 scrollbar-hide">
      <div className="flex gap-2 xs:gap-2.5 sm:gap-3 min-w-max mt-3">
        {safeServices.map((service) => (
          <button
            key={service.id}
            onClick={() => onSelect(service.id)}
            aria-pressed={activeId === service.id}
            aria-label={`Select ${service.name}`}
            className={`
              relative flex-shrink-0 
              px-4 xs:px-5 sm:px-6 
              py-2 xs:py-2.5 sm:py-3 
              rounded-full font-bold 
              text-xs xs:text-sm sm:text-sm
              whitespace-nowrap 
              transition-all duration-300 ease-out
              touch-manipulation
              active:scale-95
              ${
                activeId === service.id
                  ? "bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/50 scale-105"
                  : "bg-white text-pink-600 border-2 border-pink-200 hover:border-pink-400 hover:shadow-md"
              }
            `}
          >
            {activeId === service.id && (
              <motion.div
                layoutId="activeService"
                className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-500 to-rose-600"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10">{service.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};