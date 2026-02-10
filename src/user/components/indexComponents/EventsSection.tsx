// =======================
// EventsSection.tsx
// PRODUCTION READY (ENHANCED & FINAL)
//
// ✔ MOBILE (<640px): SLIDER WITH FULL DETAILS (RESTORED)
// ✔ SMALL RANGE (640px–767px): GRID, 2 CARDS PER ROW
// ✔ TABLET (≥768px) + DESKTOP: GRID, 4 CARDS PER ROW
// ✔ TABLET LOOKS EXACTLY LIKE DESKTOP
// ✔ CARD SCALE CONSISTENT
// ✔ NO LOGIC REMOVED
// ✔ NO MISSING UI DETAILS
// =======================

import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

/* -------------------- TYPES -------------------- */

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  poster: string;
  category: "current" | "upcoming" | "past";
  date_from: string;
  date_to: string;
  time_from: string;
  time_to: string;
}

/* -------------------- API -------------------- */

const API_URL = import.meta.env.VITE_API_URL;

const fetchEvents = async (): Promise<Event[]> => {
  const response = await fetch(
    `${API_URL}/public/events?is_active=true&page=1&limit=100`,
    { headers: { "Content-Type": "application/json" } }
  );
  if (!response.ok) throw new Error("Failed to fetch events");
  const data = await response.json();
  return data.events || [];
};

const categorizeEvents = (events: any[]): Event[] => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return events
    .filter((e) => e.status !== "draft")
    .map((event) => {
      const start = new Date(event.date_from);
      const end = new Date(event.date_to);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      let category: Event["category"];
      if (end < now) category = "past";
      else if (now >= start && now <= end) category = "current";
      else category = "upcoming";

      const formatDate = (d: Date) =>
        d.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });

      return {
        id: event._id,
        title: event.title,
        description: event.bio,
        date:
          formatDate(new Date(event.date_from)) +
          (event.date_from !== event.date_to
            ? ` - ${formatDate(new Date(event.date_to))}`
            : ""),
        location: event.location,
        poster: event.main_poster_url,
        category,
        date_from: event.date_from,
        date_to: event.date_to,
        time_from: event.time_from,
        time_to: event.time_to,
      };
    })
    .sort(
      (a, b) =>
        new Date(a.date_from).getTime() -
        new Date(b.date_from).getTime()
    );
};

const selectEventsForDisplay = (events: Event[]) => {
  const current = events.filter((e) => e.category === "current");
  const upcoming = events.filter((e) => e.category === "upcoming");
  const past = events.filter((e) => e.category === "past");

  if (current.length) return [...current, ...upcoming].slice(0, 4);
  if (upcoming.length) return upcoming.slice(0, 4);
  return past.slice(0, 4);
};

const truncateText = (t: string, n: number) =>
  t.length <= n ? t : t.slice(0, n) + "...";

const shortenLocation = (l: string) => l.split(",")[0];

/* -------------------- COMPONENT -------------------- */

interface EventsSectionProps {
  scrollY: number;
}

const EventsSection: React.FC<EventsSectionProps> = ({ scrollY }) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["homepage-events"],
    queryFn: fetchEvents,
    select: categorizeEvents,
    staleTime: 1000 * 60 * 5,
  });

  const displayEvents = selectEventsForDisplay(data);

  const badgeMap: Record<Event["category"], string> = {
    current: "bg-green-500",
    upcoming: "bg-blue-500",
    past: "bg-gray-500",
  };

  const scrollToIndex = (i: number) => {
    if (!sliderRef.current) return;
    const clamped = Math.max(0, Math.min(i, displayEvents.length - 1));
    sliderRef.current.scrollTo({
      left: sliderRef.current.clientWidth * clamped,
      behavior: "smooth",
    });
    setCurrentIndex(clamped);
  };

  return (
    <section className="relative py-10 sm:py-12 lg:py-14 bg-gradient-to-b from-white to-chirag-pink/10 w-full">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 relative z-10">
        {/* HEADER */}
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="font-playfair font-bold tracking-tight text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] mb-3">
            Upcoming <span className="header-gradient">Events</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
            Bridal looks, fashion shoots, celebrity makeovers & premium showcases.
          </p>
        </div>

        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin" size={26} />
          </div>
        )}

        {!isLoading && !isError && displayEvents.length > 0 && (
          <>
            {/* MOBILE SLIDER (<640px) — FULL DETAILS RESTORED */}
            <div className="sm:hidden relative mb-10">
              <div
                ref={sliderRef}
                className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth"
                onScroll={(e) =>
                  setCurrentIndex(
                    Math.round(
                      e.currentTarget.scrollLeft /
                        e.currentTarget.clientWidth
                    )
                  )
                }
              >
                {displayEvents.map((item) => (
                  <div key={item.id} className="min-w-full snap-center px-4">
                    <div className="relative h-[480px] rounded-xl overflow-hidden">
                      <img
                        src={item.poster}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                      <span
                        className={`absolute top-3 right-3 px-3 py-1 text-xs font-bold rounded-full text-white ${
                          badgeMap[item.category]
                        }`}
                      >
                        {item.category}
                      </span>

                      <div className="absolute inset-0 flex flex-col justify-end p-5">
                        <h3 className="text-white text-lg font-playfair font-bold mb-2">
                          {truncateText(item.title, 45)}
                        </h3>

                        <div className="flex items-center gap-2 text-white text-xs mb-1">
                          <Calendar size={14} /> {item.date}
                        </div>

                        <div className="flex items-center gap-2 text-white text-xs mb-1">
                          <Clock size={14} /> {item.time_from} - {item.time_to}
                        </div>

                        <div className="flex items-center gap-2 text-white text-xs mb-4">
                          <MapPin size={14} />{" "}
                          {truncateText(shortenLocation(item.location), 25)}
                        </div>

                        <Link
                          to="/events"
                          className="inline-flex w-fit px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {displayEvents.length > 1 && (
                <>
                  <button
                    onClick={() => scrollToIndex(currentIndex - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => scrollToIndex(currentIndex + 1)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* GRID:
                640–767px  → 2 columns
                ≥768px     → 4 columns
            */}
            <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 mb-10">
              {displayEvents.map((item, index) => (
                <div
                  key={item.id}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  className={`relative rounded-xl overflow-hidden transition-all duration-300
                    h-[260px] md:h-[280px] lg:h-[300px]
                    ${
                      activeIndex === index
                        ? "shadow-xl -translate-y-1"
                        : "shadow-md"
                    }`}
                >
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                  <span
                    className={`absolute top-3 right-3 px-2.5 py-1 text-xs font-bold text-white rounded-full ${
                      badgeMap[item.category]
                    }`}
                  >
                    {item.category}
                  </span>

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-sm font-playfair font-bold mb-2">
                      {truncateText(item.title, 40)}
                    </h3>

                    <div className="flex items-center gap-2 text-xs mb-1">
                      <Calendar size={14} /> {item.date}
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <MapPin size={14} />{" "}
                      {truncateText(shortenLocation(item.location), 22)}
                    </div>

                    <Link
                      to="/events"
                      className="inline-flex mt-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center">
              <Link
                to="/events"
                className="inline-block px-6 py-2.5 rounded-full font-semibold bg-gradient-to-r from-chirag-pink to-chirag-peach text-black shadow-md hover:shadow-lg transition-all text-xs sm:text-sm"
              >
                Explore All Events
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default EventsSection;
