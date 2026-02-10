// src/user/components/events/EventsHeroSection.tsx

import { EventItem } from "@/user/types/event";
import { Sparkles, Calendar, Loader2 } from "lucide-react";

type SectionType = "current" | "upcoming" | "past";

interface EventsHeroSectionProps {
  isLoading: boolean;
  isError: boolean;
  allEvents: EventItem[];
  activeSection: SectionType;
  setActiveSection: (section: SectionType) => void;
  getSectionStats: (
    events: EventItem[],
    section: SectionType
  ) => {
    icon: any;
    label: string;
    count: number;
    attendees: string;
    color: string;
    glow: string;
  };
}

const EventsHeroSection: React.FC<EventsHeroSectionProps> = ({
  isLoading,
  isError,
  allEvents,
}) => {
  return (
    <section className="w-full pt-5 sm:pt-0 pb-0">
      <div
        className="
          mx-auto w-full max-w-7xl
          px-4 sm:px-6 lg:px-8
          text-center
          mb-4 sm:mb-12
          md:mb-0
          lg:mb-0
        "
      >
        {/* BADGE */}
        <div className="flex justify-center">
          <div
            className="
              inline-flex items-center gap-2
              px-4 sm:px-5
              py-2
              mb-2 sm:mb-6
              md:mb-1
              lg:mb-0
              bg-white/5 rounded-full
              border border-white/10
              backdrop-blur-sm
            "
          >
            <Sparkles className="text-pink-400 animate-pulse" size={16} />
            <span className="text-pink-400 text-xs font-semibold tracking-widest">
              MASTERCLASS
            </span>
          </div>
        </div>

        {/* TITLE */}
        <h1
          className="
            mx-auto max-w-3xl
            text-3xl sm:text-4xl
            md:text-[2.1rem]
            lg:text-[2.2rem]
            font-bold text-white
            mb-2 sm:mb-4
            md:mb-1
            lg:mb-0
            leading-tight
          "
        >
          Events & Workshops
        </h1>

        {/* DESCRIPTION */}
        <p
          className="
            mx-auto max-w-2xl
            text-gray-400
            text-sm sm:text-base
            md:text-xs
            lg:text-xs
            leading-relaxed
          "
        >
          Explore curated makeup masterclasses, hands-on workshops, and premium
          beauty events designed for real growth.
        </p>

        {/* LOADING */}
        {isLoading && (
          <div className="mt-6 md:mt-2 flex justify-center">
            <div className="flex items-center gap-3 text-gray-400">
              <Loader2 className="animate-spin" size={18} />
              <span className="text-sm">Loading events...</span>
            </div>
          </div>
        )}

        {/* ERROR */}
        {isError && (
          <div className="mt-6 md:mt-2 flex justify-center">
            <div className="px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              Failed to load events. Please try again later.
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {!isLoading && !isError && allEvents.length === 0 && (
          <div className="mt-10 md:mt-4 flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <Calendar className="text-gray-500" size={32} />
            </div>
            <div className="text-center">
              <h3 className="text-xl md:text-lg font-bold text-white mb-1">
                No Events Available
              </h3>
              <p className="text-gray-400 text-sm max-w-md mx-auto">
                We don't have any events scheduled at the moment. Check back
                soon for exciting new workshops and masterclasses!
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default EventsHeroSection;
