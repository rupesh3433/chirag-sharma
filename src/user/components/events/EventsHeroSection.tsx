// src/user/components/events/EventsHeroSection.tsx

import { EventItem } from "@/user/types/event";
import {
    Sparkles,
    Calendar,
    Loader2,
    TrendingUp,
    Award,
  } from "lucide-react";
  
  type SectionType = "current" | "upcoming" | "past";
  
  interface EventsHeroSectionProps {
    isLoading: boolean;
    isError: boolean;
    allEvents: EventItem[];
    activeSection: SectionType;
    setActiveSection: (section: SectionType) => void;
    getSectionStats: (events: EventItem[], section: SectionType) => {
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
    activeSection,
    setActiveSection,
    getSectionStats,
  }) => {
    return (
      <section className="w-full">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 text-center mb-8 sm:mb-12 md:mb-14">
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 mb-4 sm:mb-6 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm">
              <Sparkles className="text-pink-400 animate-pulse" size={16} />
              <span className="text-pink-400 text-xs font-semibold tracking-widest">
                MASTERCLASS
              </span>
            </div>
          </div>
  
          <h1 className="mx-auto max-w-3xl text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 leading-tight">
            Events & Workshops
          </h1>
  
          <p className="mx-auto max-w-2xl text-gray-400 text-sm sm:text-base md:text-lg leading-relaxed">
            Explore curated makeup masterclasses, hands-on workshops, and premium beauty
            events designed for real growth.
          </p>
  
          {isLoading && (
            <div className="mt-8 flex justify-center">
              <div className="flex items-center gap-3 text-gray-400">
                <Loader2 className="animate-spin" size={20} />
                <span className="text-sm">Loading events...</span>
              </div>
            </div>
          )}
  
          {isError && (
            <div className="mt-8 flex justify-center">
              <div className="px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                Failed to load events. Please try again later.
              </div>
            </div>
          )}
  
          {!isLoading && !isError && allEvents.length > 0 && (
            <div className="mt-6 sm:mt-8 flex justify-center">
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                {(["current", "upcoming", "past"] as SectionType[]).map(
                  (section) => {
                    const sectionStats = getSectionStats(allEvents, section);
                    const isActive = activeSection === section;
  
                    return (
                      <button
                        key={section}
                        onClick={() => setActiveSection(section)}
                        className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border transition-all duration-300 ${
                          isActive
                            ? `bg-gradient-to-r ${sectionStats.color} border-white/20 scale-105`
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
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          )}
  
          {!isLoading && !isError && allEvents.length === 0 && (
            <div className="mt-12 flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <Calendar className="text-gray-500" size={32} />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">
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
  