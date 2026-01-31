import React, { useState, useEffect } from "react";
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
} from "lucide-react";

/* ================= TYPES ================= */

export interface Event {
  id: number;
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
}

type SectionType = "current" | "upcoming" | "past";

/* ================= DATA ================= */

const getPosterImage = (index: number): string =>
  `/photos/chirag${(index % 5) + 1}.jpeg`;

const generateEvents = (
  category: SectionType,
  count: number
): Event[] =>
  Array.from({ length: count }).map((_, i) => ({
    id: Number(`${Date.now()}${i}`),
    title: `${category.toUpperCase()} Event ${i + 1}`,
    description:
      "Join our exclusive masterclass focused on hands-on learning, real-world techniques, and professional guidance from experienced instructors.",
    date: "June 15–17, 2026",
    location: "Kathmandu, Nepal",
    attendees: "50+ Participants",
    poster: getPosterImage(i),
    category,
    price: category !== "past" ? "₹18,000" : undefined,
    rating: 4.6,
    duration: "3 Days",
    badge: category === "current" ? "LIVE NOW" : undefined,
  }));

const ALL_EVENTS: Event[] = [
  ...generateEvents("current", 10),
  ...generateEvents("upcoming", 10),
  ...generateEvents("past", 10),
];

/* ================= SECTION STATS ================= */

const getSectionStats = (section: SectionType) => {
  const sectionEvents = ALL_EVENTS.filter((e) => e.category === section);
  const totalAttendees = sectionEvents.length * 50;
  
  return {
    current: {
      icon: TrendingUp,
      label: "Live Events",
      count: sectionEvents.length,
      attendees: `${totalAttendees}+ Live`,
      color: "from-pink-500 to-purple-500",
      glow: "rgba(236, 72, 153, 0.3)",
    },
    upcoming: {
      icon: Calendar,
      label: "Upcoming",
      count: sectionEvents.length,
      attendees: `${totalAttendees}+ Expected`,
      color: "from-blue-500 to-cyan-500",
      glow: "rgba(59, 130, 246, 0.3)",
    },
    past: {
      icon: Award,
      label: "Completed",
      count: sectionEvents.length,
      attendees: `${totalAttendees}+ Attended`,
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

  const events = ALL_EVENTS.filter((e) => e.category === activeSection);
  const currentIndex = indexMap[activeSection];
  const stats = getSectionStats(activeSection);

  const setIndex = (i: number) =>
    setIndexMap((prev) => ({
      ...prev,
      [activeSection]: i,
    }));

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
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = 'var(--scrollbar-width, 0px)';
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
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
            Explore curated makeup masterclasses, hands-on workshops, and
            premium beauty events designed for real growth.
          </p>

          {/* Stats Overview */}
          <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-3 sm:gap-4 px-4">
            {(["current", "upcoming", "past"] as SectionType[]).map((section) => {
              const sectionStats = getSectionStats(section);
              const isActive = activeSection === section;
              
              return (
                <div
                  key={section}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r " + sectionStats.color + " border-white/20 scale-105"
                      : "bg-gray-900/40 border-white/10 hover:border-white/20"
                  }`}
                >
                  <sectionStats.icon size={14} className={isActive ? "text-white" : "text-gray-400"} />
                  <span className={`text-xs sm:text-sm font-bold ${isActive ? "text-white" : "text-gray-400"}`}>
                    {sectionStats.count} {section === "current" ? "Live" : section === "upcoming" ? "Soon" : "Done"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ================= SECTION TABS ================= */}
        <section className="flex justify-center px-4 mb-8 sm:mb-12 md:mb-14">
          <div className="flex flex-col sm:flex-row w-full max-w-2xl gap-3">
            {/* Mobile: Horizontal scroll tabs */}
            <div className="flex sm:hidden w-full bg-gray-900/40 backdrop-blur-sm rounded-2xl p-1 overflow-x-auto no-scrollbar">
              {(["current", "upcoming", "past"] as SectionType[]).map((section) => {
                const sectionStats = getSectionStats(section);
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
                const sectionStats = getSectionStats(section);
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

        {/* ================= CAROUSEL ================= */}
        <section className="relative max-w-7xl mx-auto px-0 sm:px-2 md:px-4">
          <Carousal
            events={events}
            currentIndex={currentIndex}
            setIndex={setIndex}
            onSelect={setSelectedEvent}
            activeSection={activeSection}
          />
        </section>

        {/* ================= SCROLL HINT (Mobile) ================= */}
        {showScrollHint && (
          <div className="sm:hidden flex justify-center mt-8 animate-bounce">
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <span className="text-xs">Scroll for more</span>
              <ChevronDown size={20} />
            </div>
          </div>
        )}

        {/* ================= QUICK ACTIONS (Mobile Floating) ================= */}
        <div className="sm:hidden fixed bottom-24 right-4 z-20 flex flex-col gap-3">
          <button className="p-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg active:scale-95 transition-transform">
            <Share2 size={20} />
          </button>
          <button className="p-3 rounded-full bg-gray-900/80 backdrop-blur-sm border border-white/10 text-white shadow-lg active:scale-95 transition-transform">
            <Heart size={20} />
          </button>
        </div>
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

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 200);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity duration-200 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Backdrop - Non-clickable */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm pointer-events-none"
      />

      {/* Modal */}
      <div 
        className={`relative z-10 w-full h-full sm:h-auto sm:max-w-4xl bg-gray-950 border-0 sm:border-2 sm:border-white/20 sm:rounded-2xl overflow-hidden flex flex-col sm:flex-row sm:max-h-[90vh] transition-transform duration-300 shadow-2xl ${
          isClosing ? "translate-y-full sm:translate-y-0 sm:scale-95" : "translate-y-0 sm:scale-100"
        }`}
        style={{
          boxShadow: '0 0 80px rgba(239, 68, 68, 0.2), 0 20px 60px rgba(0, 0, 0, 0.8)'
        }}
      >
        {/* Close Button - Red Circle */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-3 bg-red-500 rounded-full z-20 hover:bg-red-600 transition-all active:scale-90 shadow-lg hover:shadow-red-500/50 group"
          aria-label="Close modal"
        >
          <X className="text-white group-hover:rotate-90 transition-transform duration-300" size={22} strokeWidth={2.5} />
        </button>

        {/* Image Section */}
        <div className="sm:w-1/2 h-[45vh] sm:h-auto relative bg-gray-900 flex-shrink-0">
          <img
            src={event.poster}
            alt={event.title}
            className="w-full h-full object-contain sm:object-cover"
          />
          
          {/* Image Overlay with Badge */}
          {event.badge && (
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                {event.badge}
              </span>
            </div>
          )}

          {/* Image Actions */}
          <div className="absolute bottom-4 right-4 flex gap-2">
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
                    className={i < Math.floor(event.rating!) ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}
                  />
                ))}
              </div>
              <span className="text-white font-bold text-sm">{event.rating}</span>
              <span className="text-gray-400 text-xs sm:text-sm">({event.attendees})</span>
            </div>
          )}

          {/* Description */}
          <p className="text-gray-300 mb-5 sm:mb-6 text-sm sm:text-base leading-relaxed">
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
              <MapPin className="text-pink-400 flex-shrink-0" size={18} />
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Location</div>
                <div className="font-medium">{event.location}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <Users className="text-pink-400 flex-shrink-0" size={18} />
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Capacity</div>
                <div className="font-medium">{event.attendees}</div>
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

          {/* Price & CTA */}
          {event.price && (
            <div className="sticky bottom-0 bg-gray-950 pt-4 pb-2 -mx-5 sm:-mx-6 md:-mx-8 px-5 sm:px-6 md:px-8 border-t border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Price</div>
                  <div className="text-2xl font-bold text-white">{event.price}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 mb-1">Per Person</div>
                  <div className="text-sm text-pink-400">All Inclusive</div>
                </div>
              </div>

              <button className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-pink-500/50 transition-all active:scale-95">
                {event.category === "current"
                  ? "Join Now"
                  : event.category === "upcoming"
                  ? "Register Now"
                  : "View Details"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ================= EXPORTS ================= */

export default Events;