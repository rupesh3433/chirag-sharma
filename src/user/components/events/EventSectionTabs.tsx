import React from "react";
import type { EventItem } from "@/user/types/event";

/* ================= TYPES ================= */

export type SectionType = "current" | "upcoming" | "past";

interface EventSectionTabsProps {
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

/* ================= COMPONENT ================= */

const EventSectionTabs: React.FC<EventSectionTabsProps> = ({
  allEvents,
  activeSection,
  setActiveSection,
  getSectionStats,
}) => {
  const sections: SectionType[] = ["current", "upcoming", "past"];

  return (
    <section
      className="
        flex justify-center px-4
        mb-4 sm:mb-12
        md:mb-0
        lg:mb-0
      "
    >
      <div className="flex flex-col sm:flex-row w-full max-w-2xl gap-3">
        {/* ================= MOBILE TABS (UNCHANGED) ================= */}
        <div className="flex sm:hidden w-full bg-gray-900/40 backdrop-blur-sm rounded-2xl p-1 overflow-x-auto no-scrollbar">
          {sections.map((section) => {
            const sectionStats = getSectionStats(allEvents, section);

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

        {/* ================= TABLET / DESKTOP ================= */}
        <div
          className="
            hidden sm:flex w-full
            bg-gray-900/40 backdrop-blur-sm
            rounded-xl
            p-1
            border border-white/5
          "
        >
          {sections.map((section) => {
            const sectionStats = getSectionStats(allEvents, section);

            return (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`
                  flex-1
                  py-2.5
                  md:py-2
                  text-sm
                  md:text-xs
                  font-semibold
                  rounded-lg
                  transition-all duration-300
                  ${
                    activeSection === section
                      ? `bg-gradient-to-r ${sectionStats.color} text-white shadow-md scale-[1.03]`
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }
                `}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default EventSectionTabs;
