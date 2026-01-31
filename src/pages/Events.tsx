import React, { useState } from "react";
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

/* ================= EVENTS PAGE ================= */

const Events: React.FC = () => {
  const [activeSection, setActiveSection] =
    useState<SectionType>("current");

  const [indexMap, setIndexMap] = useState({
    current: 0,
    upcoming: 0,
    past: 0,
  });

  const [selectedEvent, setSelectedEvent] =
    useState<Event | null>(null);

  const events = ALL_EVENTS.filter(
    (e) => e.category === activeSection
  );

  const currentIndex = indexMap[activeSection];

  const setIndex = (i: number) =>
    setIndexMap((prev) => ({
      ...prev,
      [activeSection]: i,
    }));

  return (
    <>
      <Navbar />

      <main className="pt-24 pb-20 min-h-screen bg-gradient-to-b from-gray-950 via-purple-950/10 to-gray-950 overflow-x-hidden">
        {/* ================= HERO ================= */}
        <section className="text-center mb-14 px-4">
          <div className="inline-flex items-center gap-2 px-5 py-2 mb-6 bg-white/5 rounded-full border border-white/10">
            <Sparkles className="text-pink-400" size={18} />
            <span className="text-pink-400 text-xs font-semibold tracking-widest">
              MASTERCLASS
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            Events & Workshops
          </h1>

          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
            Explore curated makeup masterclasses, hands-on workshops, and
            premium beauty events designed for real growth.
          </p>
        </section>

        {/* ================= SECTION TABS ================= */}
        <section className="flex justify-center px-4 mb-14">
          <div className="flex w-full max-w-xl bg-gray-900/40 rounded-2xl p-1">
            {(["current", "upcoming", "past"] as SectionType[]).map(
              (section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`flex-1 py-3 text-sm sm:text-base font-bold rounded-xl transition-all ${
                    activeSection === section
                      ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
              )
            )}
          </div>
        </section>

        {/* ================= CAROUSEL ================= */}
        <section className="relative max-w-7xl mx-auto px-2 sm:px-4">
          <Carousal
            events={events}
            currentIndex={currentIndex}
            setIndex={setIndex}
            onSelect={setSelectedEvent}
            activeSection={activeSection}
          />
        </section>
      </main>

      {/* ================= EVENT MODAL ================= */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
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
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div
      className="absolute inset-0 bg-black/90"
      onClick={onClose}
    />

    <div className="relative z-10 w-full max-w-4xl bg-gray-950 border border-white/10 rounded-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-black/70 rounded-full z-20"
      >
        <X className="text-white" />
      </button>

      <div className="md:w-1/2 h-64 md:h-auto">
        <img
          src={event.poster}
          alt={event.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-6 md:p-8 md:w-1/2 overflow-y-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          {event.title}
        </h2>

        <p className="text-gray-300 mb-6 text-sm sm:text-base">
          {event.description}
        </p>

        <div className="space-y-3 text-gray-300 text-sm sm:text-base">
          <div className="flex gap-3">
            <Calendar className="text-pink-400" /> {event.date}
          </div>
          <div className="flex gap-3">
            <MapPin className="text-pink-400" /> {event.location}
          </div>
          <div className="flex gap-3">
            <Users className="text-pink-400" /> {event.attendees}
          </div>
          <div className="flex gap-3">
            <Clock className="text-pink-400" /> {event.duration}
          </div>
        </div>

        {event.price && (
          <button className="mt-8 w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl">
            {event.category === "current"
              ? "Join Now"
              : "Register Now"}
          </button>
        )}
      </div>
    </div>
  </div>
);

export default Events;
