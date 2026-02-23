// EventsPage.tsx

import React, { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import Footer from "../components/Footer";
import Carousal from "../components/events/Carousal";
import Navbar from "../components/Navbar";
import { Calendar, ChevronDown, TrendingUp, Award } from "lucide-react";
import type { EventItem } from "../types/event";
import EventsHeroSection from "../components/events/EventsHeroSection";
import EventDetailModal from "../components/events/EventDetailModal";
import EventSectionTabs from "../components/events/EventSectionTabs";

const CURRENT_EVENTS_PERIOD_DAYS = 60;

type SectionType = "current" | "upcoming" | "past";

const API_URL = import.meta.env.VITE_API_URL;

const fetchEvents = async (): Promise<EventItem[]> => {
  const response = await fetch(
    `${API_URL}/public/events?is_active=true&page=1&limit=100`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch events");
  }

  const data = await response.json();
  return data.events || [];
};

const categorizeEvents = (events: any[]): EventItem[] => {
  const now = new Date();
  const currentPeriodEnd = new Date();
  currentPeriodEnd.setDate(now.getDate() + CURRENT_EVENTS_PERIOD_DAYS);

  return events
    .filter((event) => event.status !== "draft")
    .map((event) => {
      const eventStartDate = new Date(event.date_from);
      const eventEndDate = new Date(event.date_to);

      let category: SectionType;
      if (eventEndDate < now) {
        category = "past";
      } else if (eventStartDate <= currentPeriodEnd) {
        category = "current";
      } else {
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
        formatDate(eventStartDate) +
        (eventStartDate.toDateString() !== eventEndDate.toDateString()
          ? ` – ${formatDate(eventEndDate)}`
          : "");

      let badge = undefined;
      if (
        category === "current" &&
        eventStartDate <= now &&
        eventEndDate >= now
      ) {
        badge = "LIVE NOW";
      }

      const primaryPrice = event.price_details?.[0]?.price
        ? `₹${event.price_details[0].price.toLocaleString()}`
        : undefined;

      const durationDays = Math.ceil(
        (eventEndDate.getTime() - eventStartDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      const duration =
        durationDays === 1
          ? "1 Day"
          : durationDays > 1
          ? `${durationDays} Days`
          : undefined;

      return {
        id: event._id,
        title: event.title,
        description: event.bio,
        date: dateStr,
        location: event.location,
        attendees: `${event.total_seats}+ Seats`,
        poster: event.main_poster_url,
        category,
        price: primaryPrice,
        rating: 4.6,
        badge,
        duration,
        date_from: event.date_from,
        date_to: event.date_to,
        time_from: event.time_from,
        time_to: event.time_to,
        location_coords: event.location_coords,
        total_seats: event.total_seats,
        price_details: event.price_details,
        gallery_images: event.gallery_images,
      };
    });
};

const getSectionStats = (events: EventItem[], section: SectionType) => {
  const sectionEvents = events.filter((e) => e.category === section);
  const totalAttendees = sectionEvents.reduce(
    (sum, e) => sum + e.total_seats,
    0
  );

  return {
    current: {
      icon: TrendingUp,
      label: "Live Events",
      count: sectionEvents.length,
      attendees: totalAttendees > 0 ? `${totalAttendees}+ Live` : "No events",
      color: "from-pink-500 to-purple-500",
      glow: "rgba(236, 72, 153, 0.3)",
    },
    upcoming: {
      icon: Calendar,
      label: "Upcoming",
      count: sectionEvents.length,
      attendees:
        totalAttendees > 0 ? `${totalAttendees}+ Expected` : "No events",
      color: "from-blue-500 to-cyan-500",
      glow: "rgba(59, 130, 246, 0.3)",
    },
    past: {
      icon: Award,
      label: "Completed",
      count: sectionEvents.length,
      attendees:
        totalAttendees > 0 ? `${totalAttendees}+ Attended` : "No events",
      color: "from-gray-500 to-gray-600",
      glow: "rgba(107, 114, 128, 0.3)",
    },
  }[section];
};

const EventsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SectionType>("current");
  const [indexMap, setIndexMap] = useState({
    current: 0,
    upcoming: 0,
    past: 0,
  });
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);

  const {
    data: allEvents = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
    select: categorizeEvents,
    staleTime: 1000 * 60 * 5,
  });

  const events = allEvents.filter((e) => e.category === activeSection);
  const currentIndex = indexMap[activeSection];

  // Reset index when events change (tab switching)
  useEffect(() => {
    if (events.length > 0 && currentIndex >= events.length) {
      setIndexMap((prev) => ({
        ...prev,
        [activeSection]: 0,
      }));
    }
  }, [events, currentIndex, activeSection]);

  const setIndex = useCallback(
    (i: number) => {
      setIndexMap((prev) => ({
        ...prev,
        [activeSection]: i,
      }));
    },
    [activeSection]
  );

  useEffect(() => {
    const handleScroll = () => setShowScrollHint(false);
    window.addEventListener("scroll", handleScroll, { once: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!selectedEvent) setIsLiked(false);
  }, [selectedEvent]);

  useEffect(() => {
    if (selectedEvent) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "var(--scrollbar-width, 0px)";
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [selectedEvent]);

  return (
    <div className="w-full min-w-0 overflow-x-hidden">
      <Navbar />

      <main className="w-full min-w-0 pt-16 sm:pt-20 pb-6 min-h-screen bg-gradient-to-b from-gray-950 via-purple-950/10 to-gray-950">
        <div className="w-full min-w-0 max-w-[100vw]">
          <EventsHeroSection
            isLoading={isLoading}
            isError={isError}
            allEvents={allEvents}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            getSectionStats={getSectionStats}
          />
        </div>

        {!isLoading && !isError && allEvents.length > 0 && (
          <div className="w-full min-w-0 max-w-[100vw] mt-4 sm:mt-6">
            <EventSectionTabs
              allEvents={allEvents}
              activeSection={activeSection}
              setActiveSection={(section) => {
                setActiveSection(section);
              }}
              getSectionStats={getSectionStats}
            />
          </div>
        )}

        {!isLoading && !isError && events.length > 0 && (
          <section className="w-full min-w-0 max-w-[100vw] mt-2 sm:mt-4">
            <div className="w-full min-w-0">
              <Carousal
                key={activeSection}
                events={events}
                currentIndex={currentIndex}
                setIndex={setIndex}
                onSelect={setSelectedEvent}
                activeSection={activeSection}
              />
            </div>
          </section>
        )}

{!isLoading && !isError && events.length === 0 && (
  <div className="w-full min-w-0 max-w-[100vw] flex justify-center px-4 sm:px-6 py-12 sm:py-16 mt-2 sm:mt-4">
    <div
      className={`w-full max-w-xl rounded-xl border p-6 sm:p-8
        ${
          activeSection === "current" &&
          "bg-pink-600/20 border-pink-500/40"
        }
        ${
          activeSection === "upcoming" &&
          "bg-blue-600/20 border-blue-500/40"
        }
        ${
          activeSection === "past" &&
          "bg-gray-600/20 border-gray-500/40"
        }
      `}
    >
      <div className="flex flex-col items-center text-center gap-4">
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center border
            ${
              activeSection === "current" &&
              "bg-pink-500/30 border-pink-400/50"
            }
            ${
              activeSection === "upcoming" &&
              "bg-blue-500/30 border-blue-400/50"
            }
            ${
              activeSection === "past" &&
              "bg-gray-500/30 border-gray-400/50"
            }
          `}
        >
          <Calendar className="text-white" size={20} />
        </div>

        <h3 className="text-lg sm:text-xl font-semibold text-white">
          {activeSection === "current" && "No Current Events"}
          {activeSection === "upcoming" && "No Upcoming Events"}
          {activeSection === "past" && "No Past Events"}
        </h3>

        <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-md">
          {activeSection === "current" &&
            "There are no live events at the moment. Please check the upcoming section."}
          {activeSection === "upcoming" &&
            "No events are scheduled yet. New events will appear here once announced."}
          {activeSection === "past" &&
            "There are no completed events to display at this time."}
        </p>
      </div>
    </div>
  </div>
)}

      </main>

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          isLiked={isLiked}
          onToggleLike={() => setIsLiked(!isLiked)}
        />
      )}

      <Footer />
    </div>
  );
};

export default EventsPage;