import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Loader2, ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
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

// Fetch events from backend
const fetchEvents = async (): Promise<Event[]> => {
  const response = await fetch(`${API_URL}/public/events?is_active=true&page=1&limit=100`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch events");
  }

  const data = await response.json();
  return data.events || [];
};

// Categorize and format events based on current date
const categorizeEvents = (events: any[]): Event[] => {
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Reset to start of day for accurate comparison

  return events
    .filter((event) => event.status !== "draft")
    .map((event) => {
      const eventStartDate = new Date(event.date_from);
      const eventEndDate = new Date(event.date_to);
      
      // Reset time for date comparison
      eventStartDate.setHours(0, 0, 0, 0);
      eventEndDate.setHours(23, 59, 59, 999);

      let category: "current" | "upcoming" | "past";
      
      // If event has ended (end date is before today)
      if (eventEndDate < now) {
        category = "past";
      }
      // If event is happening now (today is between start and end date)
      else if (now >= eventStartDate && now <= eventEndDate) {
        category = "current";
      }
      // If event hasn't started yet (start date is after today)
      else {
        category = "upcoming";
      }

      const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      };

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
    .sort((a, b) => new Date(a.date_from).getTime() - new Date(b.date_from).getTime());
};

// Select 4 events to display - MANDATORY: 3 current + 1 upcoming if available
const selectEventsForDisplay = (events: Event[]): Event[] => {
  const current = events.filter((e) => e.category === "current");
  const upcoming = events.filter((e) => e.category === "upcoming");
  const past = events.filter((e) => e.category === "past");

  let selected: Event[] = [];

  // PRIORITY 1: MANDATORY - 3 current + 1 upcoming (if both available)
  if (current.length >= 3 && upcoming.length >= 1) {
    selected = [...current.slice(0, 3), upcoming[0]];
  }
  // PRIORITY 2: 2 current + 2 upcoming
  else if (current.length >= 2 && upcoming.length >= 2) {
    selected = [...current.slice(0, 2), ...upcoming.slice(0, 2)];
  }
  // PRIORITY 3: 1 current + 3 upcoming
  else if (current.length >= 1 && upcoming.length >= 3) {
    selected = [current[0], ...upcoming.slice(0, 3)];
  }
  // PRIORITY 4: All available current + fill with upcoming
  else if (current.length > 0) {
    const remainingSlots = 4 - current.length;
    selected = [...current.slice(0, 4), ...upcoming.slice(0, remainingSlots)];
  }
  // PRIORITY 5: All upcoming only
  else if (upcoming.length > 0) {
    selected = upcoming.slice(0, 4);
  }
  // PRIORITY 6: Use past events as fallback
  else {
    selected = past.slice(0, 4);
  }

  return selected.slice(0, 4);
};

// Truncate text helper
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

// Shorten location (take first part before comma)
const shortenLocation = (location: string): string => {
  const parts = location.split(",");
  return parts[0].trim();
};

/* -------------------- COMPONENT -------------------- */

interface EventsSectionProps {
  scrollY: number;
}

const EventsSection: React.FC<EventsSectionProps> = ({ scrollY }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  // Fetch events using React Query
  const {
    data: allEvents = [],
    isLoading: eventsLoading,
    isError: eventsError,
  } = useQuery({
    queryKey: ["homepage-events"],
    queryFn: fetchEvents,
    select: categorizeEvents,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const displayEvents = selectEventsForDisplay(allEvents);

  // Event slider navigation
  const nextEvent = () => {
    setCurrentEventIndex((prev) => (prev + 1) % displayEvents.length);
  };

  const prevEvent = () => {
    setCurrentEventIndex((prev) =>
      prev === 0 ? displayEvents.length - 1 : prev - 1
    );
  };

  // Get badge color based on category
  const getCategoryBadge = (category: "current" | "upcoming" | "past") => {
    const badges = {
      current: {
        bg: "bg-green-500",
        text: "Current",
      },
      upcoming: {
        bg: "bg-blue-500",
        text: "Upcoming",
      },
      past: {
        bg: "bg-gray-500",
        text: "Past",
      },
    };
    return badges[category];
  };

  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-b from-white via-white to-chirag-pink/10">
      {/* Decorative blobs */}
      <div
        className="absolute -top-48 -right-48 w-[32rem] h-[32rem] rounded-full bg-gradient-to-br from-chirag-purple/20 to-chirag-pink/20 blur-3xl opacity-60"
        style={{ transform: `translateY(${scrollY * 0.15}px)` }}
      />
      <div
        className="absolute -bottom-48 -left-48 w-[32rem] h-[32rem] rounded-full bg-gradient-to-tr from-chirag-peach/20 to-chirag-pink/20 blur-3xl opacity-60"
        style={{ transform: `translateY(${scrollY * -0.1}px)` }}
      />

      <div className="container-custom relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-block relative mb-6">
            <div className="absolute inset-0 -m-6 bg-gradient-to-r from-chirag-pink/30 to-chirag-peach/30 blur-2xl rounded-full" />
            <h2 className="relative text-4xl md:text-5xl font-bold font-playfair">
              Upcoming <span className="header-gradient">Events</span>
            </h2>
          </div>

          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our upcoming bridal looks, fashion shoots, celebrity
            makeovers, and premium henna showcases.
          </p>
        </div>

        {/* Loading State */}
        {eventsLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="flex items-center gap-3 text-gray-600">
              <Loader2 className="animate-spin" size={24} />
              <span className="text-lg">Loading events...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {eventsError && (
          <div className="flex justify-center items-center py-20">
            <div className="px-6 py-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center">
              <p className="font-semibold mb-1">Failed to load events</p>
              <p className="text-sm">Please try again later</p>
            </div>
          </div>
        )}

        {/* No Events State */}
        {!eventsLoading && !eventsError && displayEvents.length === 0 && (
          <div className="flex flex-col items-center gap-6 py-20">
            <div className="w-20 h-20 rounded-full bg-chirag-pink/10 flex items-center justify-center">
              <Calendar className="text-chirag-pink" size={40} />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                No Events Available
              </h3>
              <p className="text-gray-600 max-w-md">
                We don't have any events scheduled at the moment. Check back soon for exciting
                new workshops and masterclasses!
              </p>
            </div>
          </div>
        )}

        {/* Event Cards - Desktop & Tablet (Grid) */}
        {!eventsLoading && !eventsError && displayEvents.length > 0 && (
          <>
            <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
              {displayEvents.map((item, index) => {
                const badge = getCategoryBadge(item.category);
                
                return (
                  <div
                    key={item.id}
                    className="group relative portfolio-item"
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    <div
                      className={`relative h-[420px] rounded-2xl overflow-hidden
                      shadow-lg transition-all duration-500
                      ${
                        activeIndex === index
                          ? "shadow-2xl -translate-y-2"
                          : "shadow-md"
                      }`}
                    >
                      {/* Image */}
                      <img
                        src={item.poster}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover
                        transition-transform duration-700 group-hover:scale-110"
                      />

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                      {/* Category Badge */}
                      <div className="absolute top-4 right-4">
                        <span
                          className={`px-3 py-1.5 text-xs font-bold rounded-full text-white ${badge.bg}`}
                        >
                          {badge.text}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="absolute inset-0 flex flex-col justify-end p-6">
                        {/* Title */}
                        <h3 className="text-white text-xl font-bold font-playfair leading-tight mb-3">
                          {truncateText(item.title, 45)}
                        </h3>

                        {/* Date */}
                        <div className="flex items-center gap-2 text-white/90 text-sm mb-2">
                          <Calendar size={16} className="flex-shrink-0" />
                          <span className="font-medium">{item.date}</span>
                        </div>

                        {/* Time */}
                        <div className="flex items-center gap-2 text-white/90 text-sm mb-2">
                          <Clock size={16} className="flex-shrink-0" />
                          <span className="font-medium">
                            {item.time_from} - {item.time_to}
                          </span>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-2 text-white/80 text-sm mb-4">
                          <MapPin size={16} className="flex-shrink-0" />
                          <span>{truncateText(shortenLocation(item.location), 25)}</span>
                        </div>

                        {/* CTA */}
                        <div
                          className="transform translate-y-6 opacity-0
                          group-hover:translate-y-0 group-hover:opacity-100
                          transition-all duration-500"
                        >
                          <Link
                            to="/events"
                            className="inline-flex items-center gap-2 px-5 py-2.5
                            rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-semibold
                            hover:bg-white/30 transition-colors"
                          >
                            View Details →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Event Cards - Mobile (Slider) */}
            <div className="md:hidden relative mb-20">
              <div className="relative overflow-hidden rounded-2xl">
                {/* Current Event Card */}
                {displayEvents[currentEventIndex] && (
                  <div className="relative h-[550px]">
                    <img
                      src={displayEvents[currentEventIndex].poster}
                      alt={displayEvents[currentEventIndex].title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />

                    {/* Category Badge */}
                    <div className="absolute top-4 right-4">
                      {(() => {
                        const badge = getCategoryBadge(displayEvents[currentEventIndex].category);
                        return (
                          <span
                            className={`px-4 py-2 text-sm font-bold rounded-full text-white ${badge.bg}`}
                          >
                            {badge.text}
                          </span>
                        );
                      })()}
                    </div>

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                      {/* Title */}
                      <h3 className="text-white text-2xl font-bold font-playfair leading-tight mb-4">
                        {truncateText(displayEvents[currentEventIndex].title, 50)}
                      </h3>

                      {/* Date */}
                      <div className="flex items-center gap-2 text-white/95 text-base mb-3">
                        <Calendar size={18} className="flex-shrink-0" />
                        <span className="font-semibold">{displayEvents[currentEventIndex].date}</span>
                      </div>

                      {/* Time */}
                      <div className="flex items-center gap-2 text-white/95 text-base mb-3">
                        <Clock size={18} className="flex-shrink-0" />
                        <span className="font-semibold">
                          {displayEvents[currentEventIndex].time_from} - {displayEvents[currentEventIndex].time_to}
                        </span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-2 text-white/90 text-base mb-5">
                        <MapPin size={18} className="flex-shrink-0" />
                        <span className="font-medium">
                          {truncateText(shortenLocation(displayEvents[currentEventIndex].location), 30)}
                        </span>
                      </div>

                      <Link
                        to="/events"
                        className="inline-flex w-fit items-center gap-2 px-6 py-3
                        rounded-full bg-white/20 backdrop-blur-md text-white text-base font-bold
                        hover:bg-white/30 transition-colors"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                )}

                {/* Navigation Arrows */}
                {displayEvents.length > 1 && (
                  <>
                    <button
                      onClick={prevEvent}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full text-white transition-all active:scale-90 z-10"
                      aria-label="Previous event"
                    >
                      <ChevronLeft size={24} />
                    </button>

                    <button
                      onClick={nextEvent}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full text-white transition-all active:scale-90 z-10"
                      aria-label="Next event"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>

              {/* Dots Indicator */}
              {displayEvents.length > 1 && (
                <div className="flex justify-center mt-6 gap-2">
                  {displayEvents.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentEventIndex(index)}
                      className={`h-2.5 rounded-full transition-all ${
                        index === currentEventIndex
                          ? "bg-chirag-pink w-8"
                          : "bg-gray-300 hover:bg-chirag-pink/50 w-2.5"
                      }`}
                      aria-label={`Go to event ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Bottom CTA */}
            <div className="text-center">
              <Link
                to="/events"
                className="inline-block px-10 py-4 rounded-full font-semibold
                bg-gradient-to-r from-chirag-pink to-chirag-peach
                text-black shadow-lg hover:shadow-xl hover:scale-101
                transition-all duration-300"
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