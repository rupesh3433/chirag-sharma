import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Carousal from "@/components/events/Carousal";
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

/* ================= CONFIGURATION ================= */

// CONTROL: Adjust this to change what's considered "current"
const CURRENT_EVENTS_PERIOD_DAYS = 10;

/* ================= TYPES ================= */

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  attendees: string;
  poster: string;
  category: "current" | "upcoming" | "past";
  price?: string;
  rating?: number;
  badge?: string;
  duration?: string;
  date_from: string;
  date_to: string;
  time_from: string;
  time_to: string;
  location_coords?: { lat: number; lng: number };
  total_seats: number;
  price_details: Array<{
    name: string;
    price: number;
    description?: string;
    available_seats?: number;
  }>;
  gallery_images?: string[];
}

type SectionType = "current" | "upcoming" | "past";

/* ================= API INTEGRATION ================= */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Fetch events from backend (public endpoint - no auth required)
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

// Categorize events based on dates
const categorizeEvents = (events: any[]): Event[] => {
  const now = new Date();
  const currentPeriodEnd = new Date();
  currentPeriodEnd.setDate(now.getDate() + CURRENT_EVENTS_PERIOD_DAYS);

  return events
    .filter((event) => event.status !== "draft") // Exclude drafts
    .map((event) => {
      const eventStartDate = new Date(event.date_from);
      const eventEndDate = new Date(event.date_to);

      // Determine category
      let category: SectionType;
      if (eventEndDate < now) {
        category = "past";
      } else if (eventStartDate <= currentPeriodEnd) {
        category = "current";
      } else {
        category = "upcoming";
      }

      // Format dates
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

      // Determine badge
      let badge = undefined;
      if (category === "current" && eventStartDate <= now && eventEndDate >= now) {
        badge = "LIVE NOW";
      }

      // Get primary price
      const primaryPrice = event.price_details?.[0]?.price
        ? `₹${event.price_details[0].price.toLocaleString()}`
        : undefined;

      // Calculate duration
      const durationDays = Math.ceil(
        (eventEndDate.getTime() - eventStartDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const duration =
        durationDays === 1 ? "1 Day" : durationDays > 1 ? `${durationDays} Days` : undefined;

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
        rating: 4.6, // You can make this dynamic if you have ratings
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

/* ================= SECTION STATS ================= */

const getSectionStats = (events: Event[], section: SectionType) => {
  const sectionEvents = events.filter((e) => e.category === section);
  const totalAttendees = sectionEvents.reduce((sum, e) => sum + e.total_seats, 0);

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
      attendees: totalAttendees > 0 ? `${totalAttendees}+ Expected` : "No events",
      color: "from-blue-500 to-cyan-500",
      glow: "rgba(59, 130, 246, 0.3)",
    },
    past: {
      icon: Award,
      label: "Completed",
      count: sectionEvents.length,
      attendees: totalAttendees > 0 ? `${totalAttendees}+ Attended` : "No events",
      color: "from-gray-500 to-gray-600",
      glow: "rgba(107, 114, 128, 0.3)",
    },
  }[section];
};

/* ================= EVENTS PAGE ================= */

const Events: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SectionType>("current");
  const [indexMap, setIndexMap] = useState({
    current: 0,
    upcoming: 0,
    past: 0,
  });
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);

  // Fetch events using React Query
  const {
    data: allEvents = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
    select: categorizeEvents,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const events = allEvents.filter((e) => e.category === activeSection);
  const currentIndex = indexMap[activeSection];
  const stats = getSectionStats(allEvents, activeSection);

  const setIndex = (i: number) =>
    setIndexMap((prev) => ({
      ...prev,
      [activeSection]: i,
    }));

  // Auto-switch to section with events
  useEffect(() => {
    if (allEvents.length > 0 && events.length === 0) {
      // Find first section with events
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

  // Hide scroll hint after user scrolls
  useEffect(() => {
    const handleScroll = () => setShowScrollHint(false);
    window.addEventListener("scroll", handleScroll, { once: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Reset like state when modal closes
  useEffect(() => {
    if (!selectedEvent) setIsLiked(false);
  }, [selectedEvent]);

  // Lock body scroll when modal is open
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
    <>
      <Navbar />

      <main className="pt-20 sm:pt-24 pb-20 min-h-screen bg-gradient-to-b from-gray-950 via-purple-950/10 to-gray-950 overflow-x-hidden">
        {/* ================= HERO ================= */}
        <section className="text-center mb-8 sm:mb-12 md:mb-14 px-4">
          <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 mb-4 sm:mb-6 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
            <Sparkles className="text-pink-400 animate-pulse" size={16} />
            <span className="text-pink-400 text-xs font-semibold tracking-widest">
              MASTERCLASS
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 px-4 leading-tight">
            Events & Workshops
          </h1>

          <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4 leading-relaxed">
            Explore curated makeup masterclasses, hands-on workshops, and premium beauty events
            designed for real growth.
          </p>

          {/* Loading State */}
          {isLoading && (
            <div className="mt-8 flex justify-center">
              <div className="flex items-center gap-3 text-gray-400">
                <Loader2 className="animate-spin" size={20} />
                <span className="text-sm">Loading events...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="mt-8 flex justify-center">
              <div className="px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                Failed to load events. Please try again later.
              </div>
            </div>
          )}

          {/* Stats Overview */}
          {!isLoading && !isError && allEvents.length > 0 && (
            <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-3 sm:gap-4 px-4">
              {(["current", "upcoming", "past"] as SectionType[]).map((section) => {
                const sectionStats = getSectionStats(allEvents, section);
                const isActive = activeSection === section;

                return (
                  <div
                    key={section}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r " +
                          sectionStats.color +
                          " border-white/20 scale-105"
                        : "bg-gray-900/40 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <sectionStats.icon
                      size={14}
                      className={isActive ? "text-white" : "text-gray-400"}
                    />
                    <span
                      className={`text-xs sm:text-sm font-bold ${
                        isActive ? "text-white" : "text-gray-400"
                      }`}
                    >
                      {sectionStats.count}{" "}
                      {section === "current"
                        ? "Live"
                        : section === "upcoming"
                        ? "Soon"
                        : "Done"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* No Events Message */}
          {!isLoading && !isError && allEvents.length === 0 && (
            <div className="mt-12 flex flex-col items-center gap-4 px-4">
              <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <Calendar className="text-gray-500" size={32} />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">No Events Available</h3>
                <p className="text-gray-400 text-sm max-w-md">
                  We don't have any events scheduled at the moment. Check back soon for exciting
                  new workshops and masterclasses!
                </p>
              </div>
            </div>
          )}
        </section>

        {/* ================= SECTION TABS ================= */}
        {!isLoading && !isError && allEvents.length > 0 && (
          <section className="flex justify-center px-4 mb-8 sm:mb-12 md:mb-14">
            <div className="flex flex-col sm:flex-row w-full max-w-2xl gap-3">
              {/* Mobile: Horizontal scroll tabs */}
              <div className="flex sm:hidden w-full bg-gray-900/40 backdrop-blur-sm rounded-2xl p-1 overflow-x-auto no-scrollbar">
                {(["current", "upcoming", "past"] as SectionType[]).map((section) => {
                  const sectionStats = getSectionStats(allEvents, section);
                  const hasEvents = allEvents.filter((e) => e.category === section).length > 0;
                  
                  return (
                    <button
                      key={section}
                      onClick={() => setActiveSection(section)}
                      className={`flex-1 min-w-[100px] py-3 px-4 text-sm font-bold rounded-xl transition-all duration-300 whitespace-nowrap ${
                        activeSection === section
                          ? `bg-gradient-to-r ${sectionStats.color} text-white shadow-lg`
                          : "text-gray-400 hover:text-white active:scale-95"
                      }`}
                    >
                      {section.charAt(0).toUpperCase() + section.slice(1)}
                    </button>
                  );
                })}
              </div>

              {/* Desktop: Full width tabs */}
              <div className="hidden sm:flex w-full bg-gray-900/40 backdrop-blur-sm rounded-2xl p-1.5 border border-white/5">
                {(["current", "upcoming", "past"] as SectionType[]).map((section) => {
                  const sectionStats = getSectionStats(allEvents, section);
                  
                  return (
                    <button
                      key={section}
                      onClick={() => setActiveSection(section)}
                      className={`flex-1 py-3 sm:py-4 text-sm sm:text-base font-bold rounded-xl transition-all duration-300 ${
                        activeSection === section
                          ? `bg-gradient-to-r ${sectionStats.color} text-white shadow-xl`
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {section.charAt(0).toUpperCase() + section.slice(1)}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ================= CAROUSEL ================= */}
        {!isLoading && !isError && events.length > 0 && (
          <section className="relative max-w-7xl mx-auto px-0 sm:px-2 md:px-4">
            <Carousal
              events={events}
              currentIndex={currentIndex}
              setIndex={setIndex}
              onSelect={setSelectedEvent}
              activeSection={activeSection}
            />
          </section>
        )}

        {/* No Events in Section */}
        {!isLoading && !isError && allEvents.length > 0 && events.length === 0 && (
          <div className="flex flex-col items-center gap-4 px-4 py-16">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <Calendar className="text-gray-500" size={24} />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-white mb-2">
                No {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Events
              </h3>
              <p className="text-gray-400 text-sm max-w-md">
                {activeSection === "current" && "There are no live events happening right now. Check upcoming events for what's coming soon!"}
                {activeSection === "upcoming" && "No events scheduled for the future yet. Stay tuned for exciting announcements!"}
                {activeSection === "past" && "No completed events to show. Check out our current and upcoming events!"}
              </p>
            </div>
          </div>
        )}

        {/* ================= SCROLL HINT (Mobile) ================= */}
        {!isLoading && !isError && events.length > 0 && showScrollHint && (
          <div className="sm:hidden flex justify-center mt-8 animate-bounce">
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <span className="text-xs">Scroll for more</span>
              <ChevronDown size={20} />
            </div>
          </div>
        )}

        {/* ================= QUICK ACTIONS (Mobile Floating) ================= */}
        {!isLoading && !isError && events.length > 0 && (
          <div className="sm:hidden fixed bottom-24 right-4 z-20 flex flex-col gap-3">
            <button className="p-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg active:scale-95 transition-transform">
              <Share2 size={20} />
            </button>
            <button className="p-3 rounded-full bg-gray-900/80 backdrop-blur-sm border border-white/10 text-white shadow-lg active:scale-95 transition-transform">
              <Heart size={20} />
            </button>
          </div>
        )}
      </main>

      {/* ================= EVENT MODAL ================= */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          isLiked={isLiked}
          onToggleLike={() => setIsLiked(!isLiked)}
        />
      )}

      <Footer />
    </>
  );
};

/* ================= EVENT DETAIL MODAL ================= */

interface EventDetailModalProps {
  event: Event;
  onClose: () => void;
  isLiked: boolean;
  onToggleLike: () => void;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  isLiked,
  onToggleLike,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 200);
  };

  // Create gallery with main poster + gallery images
  const allImages = [event.poster, ...(event.gallery_images || [])];

  // Image navigation
  const nextImage = () => {
    setActiveImage((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setActiveImage((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  // Price category icons
  const getPriceCategoryIcon = (index: number, total: number) => {
    if (total === 1) return null;
    const icons = [Ticket, Tag, Star, DollarSign, Award];
    return icons[index % icons.length];
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity duration-200 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Backdrop - Non-clickable */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm pointer-events-none" />

      {/* Modal */}
      <div
        className={`relative z-10 w-full h-full sm:h-auto sm:max-w-4xl bg-gray-950 border-0 sm:border-2 sm:border-white/20 sm:rounded-2xl overflow-hidden flex flex-col sm:flex-row sm:max-h-[90vh] transition-transform duration-300 shadow-2xl ${
          isClosing ? "translate-y-full sm:translate-y-0 sm:scale-95" : "translate-y-0 sm:scale-100"
        }`}
        style={{
          boxShadow: "0 0 80px rgba(239, 68, 68, 0.2), 0 20px 60px rgba(0, 0, 0, 0.8)",
        }}
      >
        {/* Close Button - Red Circle */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-3 bg-red-500 rounded-full z-20 hover:bg-red-600 transition-all active:scale-90 shadow-lg hover:shadow-red-500/50 group"
          aria-label="Close modal"
        >
          <X
            className="text-white group-hover:rotate-90 transition-transform duration-300"
            size={22}
            strokeWidth={2.5}
          />
        </button>

        {/* Image Section */}
        <div className="sm:w-1/2 h-[45vh] sm:h-auto relative bg-gray-900 flex-shrink-0">
          {allImages.length > 0 ? (
            <>
              {/* Main Image */}
              <div className="relative w-full h-full">
                <img
                  src={allImages[activeImage]}
                  alt={event.title}
                  className="w-full h-full object-contain sm:object-cover"
                />

                {/* Image Counter */}
                {allImages.length > 1 && (
                  <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-full text-white text-xs font-bold">
                    {activeImage + 1} / {allImages.length}
                  </div>
                )}

                {/* Navigation Arrows (if multiple images) */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full text-white transition-all active:scale-90"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full text-white transition-all active:scale-90"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                  {allImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-gray-800 border-2 transition-all ${
                        activeImage === index ? "border-pink-500 scale-110" : "border-white/20 hover:border-white/40"
                      }`}
                    >
                      <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Calendar className="text-gray-600" size={48} />
            </div>
          )}

          {/* Image Overlay with Badge */}
          {event.badge && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2">
              <span className="px-3 py-1.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                {event.badge}
              </span>
            </div>
          )}

          {/* Image Actions */}
          <div className="absolute top-4 right-16 flex gap-2">
            <button
              onClick={onToggleLike}
              className={`p-2.5 rounded-full backdrop-blur-sm border transition-all active:scale-90 ${
                isLiked
                  ? "bg-pink-500 border-pink-400 text-white"
                  : "bg-black/50 border-white/20 text-white hover:bg-black/70"
              }`}
            >
              <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
            </button>
            <button className="p-2.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-black/70 transition-all active:scale-90">
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-5 sm:p-6 md:p-8 sm:w-1/2 overflow-y-auto">
          {/* Title */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4 pr-10 leading-tight">
            {event.title}
          </h2>

          {/* Rating */}
          {event.rating && (
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < Math.floor(event.rating!)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-600"
                    }
                  />
                ))}
              </div>
              <span className="text-white font-bold text-sm">{event.rating}</span>
              <span className="text-gray-400 text-xs sm:text-sm">({event.attendees})</span>
            </div>
          )}

          {/* Description */}
          <p className="text-gray-300 mb-5 sm:mb-6 text-sm sm:text-base leading-relaxed whitespace-pre-line">
            {event.description}
          </p>

          {/* Event Details */}
          <div className="space-y-3 sm:space-y-4 text-gray-300 text-sm sm:text-base mb-6 sm:mb-8">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <Calendar className="text-pink-400 flex-shrink-0" size={18} />
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Date</div>
                <div className="font-medium">{event.date}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <Clock className="text-pink-400 flex-shrink-0" size={18} />
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Time</div>
                <div className="font-medium">
                  {event.time_from} - {event.time_to}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <MapPin className="text-pink-400 flex-shrink-0" size={18} />
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Location</div>
                <div className="font-medium">{event.location}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <Users className="text-pink-400 flex-shrink-0" size={18} />
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Total Seats</div>
                <div className="font-medium">{event.total_seats} seats</div>
              </div>
            </div>

            {event.duration && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <Clock className="text-pink-400 flex-shrink-0" size={18} />
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">Duration</div>
                  <div className="font-medium">{event.duration}</div>
                </div>
              </div>
            )}
          </div>

          {/* Price Categories */}
          {event.price_details && event.price_details.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-white mb-3">
                {event.price_details.length === 1 ? "Price" : "Price Categories"}
              </h3>
              
              {event.price_details.length === 1 ? (
                // Single price - simple display
                <div className="p-4 rounded-xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{event.price_details[0].name}</span>
                    <span className="text-pink-400 font-bold text-2xl">₹{event.price_details[0].price.toLocaleString()}</span>
                  </div>
                  {event.price_details[0].description && (
                    <p className="text-xs text-gray-400 mt-2">{event.price_details[0].description}</p>
                  )}
                  {event.price_details[0].available_seats !== undefined && (
                    <p className="text-xs text-gray-400 mt-1">{event.price_details[0].available_seats} seats available</p>
                  )}
                </div>
              ) : (
                // Multiple prices - beautiful badges with icons
                <div className="flex flex-wrap gap-2">
                  {event.price_details.map((category, index) => {
                    const Icon = getPriceCategoryIcon(index, event.price_details.length);
                    
                    return (
                      <div
                        key={index}
                        className="group relative inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 hover:border-pink-500/40 transition-all cursor-pointer hover:scale-105"
                      >
                        {Icon && <Icon className="text-pink-400" size={16} />}
                        <div className="flex flex-col">
                          <span className="text-white font-bold text-xs">{category.name}</span>
                          <span className="text-pink-400 font-bold text-base">₹{category.price.toLocaleString()}</span>
                        </div>
                        
                        {/* Tooltip on hover */}
                        {(category.description || category.available_seats !== undefined) && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-xl">
                            {category.description && (
                              <div className="text-xs text-gray-300 mb-1">{category.description}</div>
                            )}
                            {category.available_seats !== undefined && (
                              <div className="text-xs text-gray-400">{category.available_seats} seats available</div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* CTA */}
          <div className="sticky bottom-0 bg-gray-950 pt-4 pb-2 -mx-5 sm:-mx-6 md:-mx-8 px-5 sm:px-6 md:px-8 border-t border-white/10">
            <button className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-pink-500/50 transition-all active:scale-95">
              {event.category === "current"
                ? "Join Now"
                : event.category === "upcoming"
                ? "Register Now"
                : "View Details"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= EXPORTS ================= */

export default Events;