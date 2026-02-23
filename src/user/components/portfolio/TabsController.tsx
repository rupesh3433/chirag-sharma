// components/portfolio/TabsController.tsx

import React, { useEffect, useState } from "react";
import type { Tab, CategoryItem } from "../../types/portfolio";
import { fetchCategories } from "../../services/portfolio";

interface TabsControllerProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

// These two tabs are always present — not from the DB
const STATIC_TABS = [
  { id: "all", label: "All Work" },
  { id: "video", label: "Video Content" },
];

const TabsController: React.FC<TabsControllerProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    fetchCategories(controller.signal)
      .then((res) => {
        if (!controller.signal.aborted) {
          setCategories(res.data);
        }
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        // Silently fail — tabs will still show All + Video
        console.error("Failed to load categories:", err);
      });

    return () => controller.abort();
  }, []);

  // Build final tab list: All | ...dynamic categories | Video
  const tabs: { id: string; label: string }[] = [
    { id: "all", label: "All Work" },
    ...categories.map((c) => ({ id: c.slug, label: c.name })),
    { id: "video", label: "Video Content" },
  ];

  return (
    <div
      role="tablist"
      aria-label="Portfolio categories"
      className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10 px-2 pt-0"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-5 py-2 rounded-full text-sm sm:text-base font-medium
              transition-all duration-200 focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-chirag-pink focus-visible:ring-offset-2
              ${
                isActive
                  ? "bg-chirag-pink text-chirag-darkPurple shadow-md scale-105"
                  : "bg-gray-100 text-gray-600 hover:bg-chirag-pink/20 hover:text-chirag-darkPurple"
              }
            `}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default TabsController;