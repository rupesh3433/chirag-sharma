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

/* -------------------- API CONFIGURATION -------------------- */

const API_URL = import.meta.env.VITE_API_URL;

const fetchEvents = async (): Promise<Event[]> => {
  const response = await fetch(
    `${API_URL}/public/events?is_active=true&page=1&limit=100`,
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) throw new Error("Failed to fetch events");

  const data = await response.json();
  return data.events || [];
};

const categorizeEvents = (events: any[]): Event[] => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return events
    .filter((event) => event.status !== "draft")
    .map((event) => {
      const start = new Date(event.date_from);
      const end = new Date(event.date_to);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      let category: "current" | "upcoming" | "past";
      if (end < now) category = "past";
      else if (now >= start && now <= end) category = "current";
      else category = "upcoming";

      const formatDate = (date: Date) =>
        date.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });

      const dateStr =
        formatDate(new Date(event.date_from)) +
        (event.date_from !== event.date_to
          ? ` - ${formatDate(new Date(event.date_to))}`
          : "");

      return {
        id: event._id,
        title: event.title,
        description: event.bio,
        date: dateStr,
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

const selectEventsForDisplay = (events: Event[]): Event[] => {
  const current = events.filter((e) => e.category === "current");
  const upcoming = events.filter((e) => e.category === "upcoming");
  const past = events.filter((e) => e.category === "past");

  let selected: Event[] = [];

  if (current.length >= 3 && upcoming.length >= 1)
    selected = [...current.slice(0, 3), upcoming[0]];
  else if (current.length >= 2 && upcoming.length >= 2)
    selected = [...current.slice(0, 2), ...upcoming.slice(0, 2)];
  else if (current.length >= 1 && upcoming.length >= 3)
    selected = [current[0], ...upcoming.slice(0, 3)];
  else if (current.length > 0) {
    const remain = 4 - current.length;
    selected = [...current.slice(0, 4), ...upcoming.slice(0, remain)];
  } else if (upcoming.length > 0) selected = upcoming.slice(0, 4);
  else selected = past.slice(0, 4);

  return selected.slice(0, 4);
};

const truncateText = (text: string, max: number) =>
  text.length <= max ? text : text.substring(0, max) + "...";

const shortenLocation = (location: string) =>
  location.split(",")[0].trim();

/* -------------------- COMPONENT -------------------- */

interface EventsSectionProps {
  scrollY: number;
}

const EventsSection: React.FC<EventsSectionProps> = ({ scrollY }) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const {
    data: allEvents = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["homepage-events"],
    queryFn: fetchEvents,
    select: categorizeEvents,
    staleTime: 1000 * 60 * 5,
  });

  const displayEvents = selectEventsForDisplay(allEvents);

  const scrollToIndex = (i: number) => {
    if (!sliderRef.current) return;
    const clamped = Math.max(0, Math.min(i, displayEvents.length - 1));
    sliderRef.current.scrollTo({
      left: sliderRef.current.clientWidth * clamped,
      behavior: "smooth",
    });
    setCurrentIndex(clamped);
  };

  const next = () => scrollToIndex(currentIndex + 1);
  const prev = () => scrollToIndex(currentIndex - 1);

  const getCategoryBadge = (category: Event["category"]) => {
    const map = {
      current: { bg: "bg-green-500", text: "Current" },
      upcoming: { bg: "bg-blue-500", text: "Upcoming" },
      past: { bg: "bg-gray-500", text: "Past" },
    };
    return map[category];
  };

  return (
<section
  className="
    relative
    py-6
    md:py-10
    lg:py-10
    bg-gradient-to-b from-white via-white to-chirag-pink/10
  "
>
<div
        className="absolute -top-48 -right-48 w-[32rem] h-[32rem] rounded-full bg-gradient-to-br from-chirag-purple/20 to-chirag-pink/20 blur-3xl opacity-60"
        style={{ transform: `translateY(${scrollY * 0.15}px)` }}
      />
      <div
        className="absolute -bottom-48 -left-48 w-[32rem] h-[32rem] rounded-full bg-gradient-to-tr from-chirag-peach/20 to-chirag-pink/20 blur-3xl opacity-60"
        style={{ transform: `translateY(${scrollY * -0.1}px)` }}
      />

      <div className="container-custom relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-bold font-playfair mb-4">
            Upcoming <span className="header-gradient">Events</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our upcoming bridal looks, fashion shoots, celebrity
            makeovers, and premium henna showcases.
          </p>
        </div>

        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin" size={28} />
          </div>
        )}

        {isError && (
          <div className="text-center text-red-600 py-20">
            Failed to load events
          </div>
        )}

        {!isLoading && !isError && displayEvents.length > 0 && (
          <>
            {/* MOBILE SWIPE */}
            <div className="md:hidden relative mb-5">
              <div
                ref={sliderRef}
                className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide"
                onScroll={(e) => {
                  const el = e.currentTarget;
                  const i = Math.round(el.scrollLeft / el.clientWidth);
                  setCurrentIndex(i);
                }}
              >
                {displayEvents.map((item, i) => {
                  const badge = getCategoryBadge(item.category);
                  return (
                    <div
                      key={item.id}
                      className="min-w-full snap-center px-4"
                    >
                      <div className="relative h-[560px] rounded-2xl overflow-hidden">
                        <img
                          src={item.poster}
                          alt={item.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />

                        <div className="absolute top-4 right-4">
                          <span
                            className={`px-4 py-2 text-sm font-bold rounded-full text-white ${badge.bg}`}
                          >
                            {badge.text}
                          </span>
                        </div>

                        <div className="absolute inset-0 flex flex-col justify-end p-6">
                          <h3 className="text-white text-2xl font-bold font-playfair mb-4">
                            {truncateText(item.title, 50)}
                          </h3>

                          <div className="flex items-center gap-2 text-white mb-2">
                            <Calendar size={18} />
                            {item.date}
                          </div>

                          <div className="flex items-center gap-2 text-white mb-2">
                            <Clock size={18} />
                            {item.time_from} - {item.time_to}
                          </div>

                          <div className="flex items-center gap-2 text-white mb-5">
                            <MapPin size={18} />
                            {truncateText(
                              shortenLocation(item.location),
                              30
                            )}
                          </div>

                          <Link
                            to="/events"
                            className="inline-flex w-fit px-6 py-3 rounded-full bg-white/20 backdrop-blur-md text-white font-semibold"
                          >
                            View Details →
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {displayEvents.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 rounded-full text-white z-10"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 rounded-full text-white z-10"
                  >
                    <ChevronRight size={24} />
                  </button>

                  <div className="flex justify-center mt-6 gap-2">
                    {displayEvents.map((_, i) => (
                      <span
                        key={i}
                        className={`h-2.5 rounded-full transition-all ${
                          i === currentIndex
                            ? "bg-chirag-pink w-8"
                            : "bg-gray-300 w-2.5"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* TABLET + DESKTOP GRID */}
            <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
              {displayEvents.map((item, index) => {
                const badge = getCategoryBadge(item.category);
                return (
                  <div
                    key={item.id}
                    className="group relative"
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    <div
                      className={`relative h-[420px] rounded-2xl overflow-hidden transition-all duration-500 ${
                        activeIndex === index
                          ? "shadow-2xl -translate-y-2"
                          : "shadow-md"
                      }`}
                    >
                      <img
                        src={item.poster}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                      <div className="absolute top-4 right-4">
                        <span
                          className={`px-3 py-1.5 text-xs font-bold rounded-full text-white ${badge.bg}`}
                        >
                          {badge.text}
                        </span>
                      </div>

                      <div className="absolute inset-0 flex flex-col justify-end p-6">
                        <h3 className="text-white text-xl font-bold font-playfair mb-3">
                          {truncateText(item.title, 45)}
                        </h3>

                        <div className="flex items-center gap-2 text-white text-sm mb-2">
                          <Calendar size={16} />
                          {item.date}
                        </div>

                        <div className="flex items-center gap-2 text-white text-sm mb-2">
                          <Clock size={16} />
                          {item.time_from} - {item.time_to}
                        </div>

                        <div className="flex items-center gap-2 text-white text-sm mb-4">
                          <MapPin size={16} />
                          {truncateText(
                            shortenLocation(item.location),
                            25
                          )}
                        </div>

                        <Link
                          to="/events"
                          className="inline-flex w-fit px-5 py-2 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-semibold"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center">
              <Link
                to="/events"
                className="inline-block px-10 py-4 rounded-full font-semibold bg-gradient-to-r from-chirag-pink to-chirag-peach text-black shadow-lg"
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
