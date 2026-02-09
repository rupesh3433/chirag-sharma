import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Footer from "../components/Footer";
import Carousal from "../components/events/Carousal";
import Navbar from "../components/Navbar";
import {
  Sparkles,
  Calendar,
  MapPin,
  Users,
  Clock,
  X,
  Share2,
  Heart,
  Star,
  TrendingUp,
  Award,
  ChevronDown,
  Loader2,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Tag,
  Ticket,
} from "lucide-react";
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
    error,
  } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
    select: categorizeEvents,
    staleTime: 1000 * 60 * 5,
  });

  const events = allEvents.filter((e) => e.category === activeSection);
  const currentIndex = indexMap[activeSection];
  const stats = getSectionStats(allEvents, activeSection);

  const setIndex = (i: number) =>
    setIndexMap((prev) => ({
      ...prev,
      [activeSection]: i,
    }));

  useEffect(() => {
    if (allEvents.length > 0 && events.length === 0) {
      const sections: SectionType[] = ["current", "upcoming", "past"];
      for (const section of sections) {
        const sectionEvents = allEvents.filter((e) => e.category === section);
        if (sectionEvents.length > 0) {
          setActiveSection(section);
          break;
        }
      }
    }
  }, [allEvents, events.length]);

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

      <main className="w-full min-w-0 pt-20 sm:pt-24 pb-5 min-h-screen bg-gradient-to-b from-gray-950 via-purple-950/10 to-gray-950">
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
          <div className="w-full min-w-0 max-w-[100vw]">
            <EventSectionTabs
              allEvents={allEvents}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              getSectionStats={getSectionStats}
            />
          </div>
        )}

        {!isLoading && !isError && events.length > 0 && (
          <section className="w-full min-w-0 max-w-[100vw]">
            <div className="w-full min-w-0 max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="w-full min-w-0">
                <Carousal
                  events={events}
                  currentIndex={currentIndex}
                  setIndex={setIndex}
                  onSelect={setSelectedEvent}
                  activeSection={activeSection}
                />
              </div>
            </div>
          </section>
        )}

        {!isLoading &&
          !isError &&
          allEvents.length > 0 &&
          events.length === 0 && (
            <div className="w-full min-w-0 max-w-[100vw] flex flex-col items-center gap-4 px-4 sm:px-6 py-16">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="text-gray-500" size={24} />
              </div>
              <div className="w-full min-w-0 text-center max-w-md mx-auto px-4">
                <h3 className="text-base sm:text-lg font-bold text-white mb-2 break-words">
                  No{" "}
                  {activeSection.charAt(0).toUpperCase() +
                    activeSection.slice(1)}{" "}
                  Events
                </h3>
                <p className="text-gray-400 text-sm break-words">
                  {activeSection === "current" &&
                    "There are no live events happening right now. Check upcoming events for what's coming soon!"}
                  {activeSection === "upcoming" &&
                    "No events scheduled for the future yet. Stay tuned for exciting announcements!"}
                  {activeSection === "past" &&
                    "No completed events to show. Check out our current and upcoming events!"}
                </p>
              </div>
            </div>
          )}

        {!isLoading && !isError && events.length > 0 && showScrollHint && (
          <div className="w-full min-w-0 max-w-[100vw] sm:hidden flex justify-center mt-8 animate-bounce px-4">
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <span className="text-xs">Scroll for more</span>
              <ChevronDown size={20} className="flex-shrink-0" />
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