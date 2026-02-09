// src/user/components/indexComponents/Testimonials.tsx
import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

/* ======================================================
   Types
====================================================== */
type Testimonial = {
  id: number;
  name: string;
  role: string;
  image: string;
  quote: string;
  rating: number;
};

/* ======================================================
   Data (10 items)
====================================================== */
const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Priya Singh",
    role: "Bride",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=1974",
    quote:
      "Chirag transformed me into the bride I always dreamed of becoming.",
    rating: 5,
  },
  {
    id: 2,
    name: "Aisha Kapoor",
    role: "Fashion Model",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=1974",
    quote: "His artistic vision and attention to detail are unmatched.",
    rating: 5,
  },
  {
    id: 3,
    name: "Neha Sharma",
    role: "Celebrity",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1974",
    quote: "Every look feels elegant, premium, and perfectly balanced.",
    rating: 5,
  },
  {
    id: 4,
    name: "Ritika Malhotra",
    role: "Bride",
    image:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=1974",
    quote: "The makeup stayed flawless from morning till night.",
    rating: 5,
  },
  {
    id: 5,
    name: "Sara Khan",
    role: "Influencer",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=1974",
    quote: "Camera-ready looks with zero heaviness on skin.",
    rating: 5,
  },
  {
    id: 6,
    name: "Ananya Verma",
    role: "Model",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1974",
    quote: "Understood my face better than I ever could.",
    rating: 5,
  },
  {
    id: 7,
    name: "Kritika Joshi",
    role: "Bride",
    image:
      "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&q=80&w=1974",
    quote: "Subtle, elegant, and exactly what I wanted.",
    rating: 5,
  },
  {
    id: 8,
    name: "Megha Patel",
    role: "Entrepreneur",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=1974",
    quote: "Premium finish that looked amazing in real life.",
    rating: 5,
  },
  {
    id: 9,
    name: "Pooja Mehra",
    role: "Bride",
    image:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=1974",
    quote: "Perfect balance between glam and natural.",
    rating: 5,
  },
  {
    id: 10,
    name: "Ishita Roy",
    role: "Actor",
    image:
      "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?auto=format&fit=crop&q=80&w=1974",
    quote: "Every look felt fresh and uniquely crafted.",
    rating: 5,
  },
];

/* ======================================================
   FULL SPACING CONTROL — EDIT ONLY HERE
====================================================== */
const SPACING = {
  section: {
    paddingY: {
      mobile: "3rem",
      tablet: "4.5rem",
      desktop: "1rem",
    },
    marginY: {
      mobile: "0rem",
      tablet: "0rem",
      desktop: "0rem",
    },
  },
  card: {
    paddingY: {
      mobile: "1.25rem",
      tablet: "2rem",
      desktop: "2rem",
    },
    marginY: {
      mobile: "0.5rem",
      tablet: "0.75rem",
      desktop: "1rem",
    },
  },
};

/* ======================================================
   Swipe Constants
====================================================== */
const ANIMATION_MS = 420;
const POINTER_SWIPE_RATIO = 0.12;
const WHEEL_TRIGGER_DISTANCE = 45;
const WHEEL_IDLE_RESET_MS = 120;

/* ======================================================
   Utils
====================================================== */
const clampIndex = (i: number, len: number) =>
  i < 0 ? len - 1 : i >= len ? 0 : i;

const isDesktopDevice = () => navigator.maxTouchPoints === 0;

/* ======================================================
   Component
====================================================== */
const Testimonials: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const widthRef = useRef(0);
  const pointerIdRef = useRef<number | null>(null);
  const startXRef = useRef(0);

  const wheelSumRef = useRef(0);
  const wheelTimerRef = useRef<number | null>(null);
  const wheelLockedRef = useRef(false);

  useEffect(() => {
    setIsDesktop(isDesktopDevice());
  }, []);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        widthRef.current = containerRef.current.offsetWidth;
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const next = () =>
    setIndex((i) => clampIndex(i + 1, testimonials.length));
  const prev = () =>
    setIndex((i) => clampIndex(i - 1, testimonials.length));

  /* Pointer swipe */
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerIdRef.current = e.pointerId;
    startXRef.current = e.clientX;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || pointerIdRef.current !== e.pointerId) return;
    setDragOffset(e.clientX - startXRef.current);
  };

  const endPointerSwipe = () => {
    if (Math.abs(dragOffset) > widthRef.current * POINTER_SWIPE_RATIO) {
      dragOffset < 0 ? next() : prev();
    }
    setDragging(false);
    setDragOffset(0);
    pointerIdRef.current = null;
  };

  /* Wheel swipe (desktop only) */
  const onWheelCapture = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!isDesktop || wheelLockedRef.current) return;
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;

    wheelSumRef.current += e.deltaX;

    if (wheelTimerRef.current) {
      clearTimeout(wheelTimerRef.current);
    }

    wheelTimerRef.current = window.setTimeout(() => {
      wheelSumRef.current = 0;
    }, WHEEL_IDLE_RESET_MS);

    if (Math.abs(wheelSumRef.current) >= WHEEL_TRIGGER_DISTANCE) {
      wheelSumRef.current > 0 ? next() : prev();
      wheelSumRef.current = 0;
      wheelLockedRef.current = true;
      setTimeout(() => (wheelLockedRef.current = false), ANIMATION_MS);
    }
  };

  const translateX =
    -index * widthRef.current + (dragging ? dragOffset : 0);

  return (
    <section
      style={
        {
          "--section-padding-y-mobile":
            SPACING.section.paddingY.mobile,
          "--section-padding-y-tablet":
            SPACING.section.paddingY.tablet,
          "--section-padding-y-desktop":
            SPACING.section.paddingY.desktop,

          "--section-margin-y-mobile":
            SPACING.section.marginY.mobile,
          "--section-margin-y-tablet":
            SPACING.section.marginY.tablet,
          "--section-margin-y-desktop":
            SPACING.section.marginY.desktop,

          "--card-padding-y-mobile":
            SPACING.card.paddingY.mobile,
          "--card-padding-y-tablet":
            SPACING.card.paddingY.tablet,
          "--card-padding-y-desktop":
            SPACING.card.paddingY.desktop,

          "--card-margin-y-mobile":
            SPACING.card.marginY.mobile,
          "--card-margin-y-tablet":
            SPACING.card.marginY.tablet,
          "--card-margin-y-desktop":
            SPACING.card.marginY.desktop,
        } as React.CSSProperties
      }
      className="
        bg-chirag-pink/5

        my-[var(--section-margin-y-mobile)]
        md:my-[var(--section-margin-y-tablet)]
        lg:my-[var(--section-margin-y-desktop)]

        py-[var(--section-padding-y-mobile)]
        md:py-[var(--section-padding-y-tablet)]
        lg:py-[var(--section-padding-y-desktop)]
      "
    >
      <div className="max-w-7xl mx-auto px-4">
      <h2
  className="
    text-center
    font-playfair font-bold

    text-3xl
    sm:text-3xl
    md:text-4xl
    lg:text-4xl    
    mb-3           
    sm:mb-4
    md:mb-6
    lg:mb-8
  "
>
  Client <span className="header-gradient">Testimonials</span>
</h2>


        <div className="relative max-w-4xl mx-auto">
          <div
            ref={containerRef}
            className="overflow-hidden select-none cursor-grab touch-pan-y"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endPointerSwipe}
            onPointerLeave={endPointerSwipe}
            onWheelCapture={onWheelCapture}
          >
            <div
              className="flex"
              style={{
                width: `${testimonials.length * 100}%`,
                transform: `translateX(${translateX}px)`,
                transition: dragging
                  ? "none"
                  : `transform ${ANIMATION_MS}ms cubic-bezier(0.22,0.61,0.36,1)`,
              }}
            >
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="
                    w-full flex-shrink-0 px-4

                    my-[var(--card-margin-y-mobile)]
                    md:my-[var(--card-margin-y-tablet)]
                    lg:my-[var(--card-margin-y-desktop)]
                  "
                  style={{ width: `${100 / testimonials.length}%` }}
                >
                  <div
                    className="
                      bg-white rounded-2xl shadow-md text-center px-6

                      py-[var(--card-padding-y-mobile)]
                      md:py-[var(--card-padding-y-tablet)]
                      lg:py-[var(--card-padding-y-desktop)]
                    "
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden border-4 border-chirag-pink/20">
                      <img
                        src={t.image}
                        alt={t.name}
                        draggable={false}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex justify-center mb-4">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className="fill-chirag-gold text-chirag-gold"
                        />
                      ))}
                    </div>

                    <blockquote className="italic mb-4">
                      "{t.quote}"
                    </blockquote>

                    <cite className="font-semibold block">{t.name}</cite>
                    <span className="text-sm text-gray-500">{t.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow-md"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow-md"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
