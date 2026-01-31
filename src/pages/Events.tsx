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

const generateEvents = (category: SectionType, count: number): Event[] =>
  Array.from({ length: count }).map((_, i) => ({
    id: i + Math.random(),
    title: `${category.toUpperCase()} Event ${i + 1}`,
    description:
      "This hands-on masterclass focuses on practical skills, real-world techniques, and professional guidance from experienced instructors.",
    date: "June 15–17, 2026",
    location: "Kathmandu, Nepal",
    attendees: "50+ Participants",
    poster: getPosterImage(i),
    category,
    price: category !== "past" ? "₹18,000" : undefined,
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
  const [activeSection, setActiveSection] = useState<SectionType>("current");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const events = ALL_EVENTS.filter((e) => e.category === activeSection);

  return (
    <>
      <Navbar />

      <main className="pt-24 pb-24 min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
        {/* HEADER */}
        <section className="text-center mb-16 px-4">
          <div className="inline-flex gap-3 px-6 py-3 bg-white/5 rounded-full border border-white/10 mb-6">
            <Sparkles className="text-pink-400" />
            <span className="text-pink-400 font-semibold text-sm tracking-widest">
              EVENTS
            </span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold text-white">
            Masterclass Events
          </h1>
        </section>

        <Carousal
          events={events}
          currentIndex={currentIndex}
          setIndex={setCurrentIndex}
          onSelect={setSelectedEvent}
          activeSection={activeSection}
        />
      </main>

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      <Footer />
    </>
  );
};

/* ================= SIMPLE DARK EVENT MODAL ================= */

interface EventModalProps {
  event: Event;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({
  event,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative z-10 w-full max-w-5xl bg-gray-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2 animate-[fadeIn_0.25s_ease-out]">
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/60 rounded-full hover:bg-black/80 border border-white/10 transition"
        >
          <X className="text-white" size={18} />
        </button>

        {/* LEFT — IMAGE */}
        <div className="relative h-[520px] md:h-auto bg-black">
          <img
            src={event.poster}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* RIGHT — CONTENT */}
        <div className="p-8 flex flex-col justify-between">
          {/* TOP */}
          <div>
            {event.badge && (
              <span className="inline-block mb-4 px-4 py-2 bg-pink-500 text-white text-xs font-bold rounded-full">
                {event.badge}
              </span>
            )}

            {/* EVENT OVERVIEW */}
            <h3 className="text-sm uppercase tracking-widest text-gray-400 mb-2">
              Event Overview
            </h3>

            <h2 className="text-3xl font-bold text-white mb-4">
              {event.title}
            </h2>

            <p className="text-gray-300 leading-relaxed mb-8">
              {event.description}
            </p>

            {/* EVENT DETAILS */}
            <h3 className="text-sm uppercase tracking-widest text-gray-400 mb-4">
              Event Details
            </h3>

            <div className="space-y-4">
              <Detail icon={<Calendar />} label="Date" value={event.date} />
              <Detail icon={<MapPin />} label="Location" value={event.location} />
              <Detail icon={<Users />} label="Participants" value={event.attendees} />
              {event.duration && (
                <Detail icon={<Clock />} label="Duration" value={event.duration} />
              )}
            </div>
          </div>

          {/* PRICING */}
          {event.price && (
            <div className="mt-10 pt-6 border-t border-white/10">
              <h3 className="text-sm uppercase tracking-widest text-gray-400 mb-2">
                Pricing
              </h3>

              <div className="text-3xl font-bold text-white mb-4">
                {event.price}
              </div>

              <button className="w-full py-4 rounded-xl bg-pink-500 hover:bg-pink-600 transition text-white font-bold">
                {event.category === "current"
                  ? "Join Now"
                  : "Register Now"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ANIMATION */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

/* ================= DETAIL ROW ================= */

const Detail = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-center gap-4 text-sm">
    <span className="text-pink-400">{icon}</span>
    <span className="text-gray-400 w-28">{label}</span>
    <span className="text-white font-medium">{value}</span>
  </div>
);

export default Events;