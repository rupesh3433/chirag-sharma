import React, { useState, useEffect, useCallback } from "react";
import type { ImageItem, Tab } from "../../types/portfolio";
import { useImages } from "./useImages";
import ImageCard from "./ImageCard";
import ImageModal from "./ImageModal";

interface ImageGridProps {
  activeTab: Tab;
}

const COLUMNS = 5;
const INITIAL_ROWS = 2;

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl overflow-hidden shadow-md bg-gray-200 animate-pulse"
      style={{ aspectRatio: "9 / 16" }}
    />
  );
}

const ImageGrid: React.FC<ImageGridProps> = ({ activeTab }) => {
  // "all" → no filter (show everything), "video" → no images, any slug → filter by that slug
  const category = activeTab === "all" || activeTab === "video" ? undefined : activeTab;
  const { images, loadingState, error, refetch } = useImages(category);

  const [visibleRows, setVisibleRows] = useState(INITIAL_ROWS);
  const [selectedItem, setSelectedItem] = useState<ImageItem | null>(null);

  useEffect(() => {
    setVisibleRows(INITIAL_ROWS);
  }, [activeTab]);

  const visibleCount = visibleRows * COLUMNS;
  const visibleImages = images.slice(0, visibleCount);
  const hasMore = visibleCount < images.length;
  const canCollapse = visibleRows > INITIAL_ROWS;

  const handleOpenModal = useCallback((item: ImageItem) => {
    setSelectedItem(item);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedItem(null);
  }, []);

  if (activeTab === "video") return null;

  if (loadingState === "loading") {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 mb-10">
        {Array.from({ length: INITIAL_ROWS * COLUMNS }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (loadingState === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-12 h-12 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
          />
        </svg>
        <p className="text-gray-600 max-w-xs">
          {error ?? "Something went wrong. Please try again."}
        </p>
        <button
          onClick={refetch}
          className="mt-2 px-6 py-2 rounded-full bg-chirag-pink text-chirag-darkPurple
            font-semibold text-sm hover:shadow-md transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (loadingState === "success" && images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-12 h-12 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-gray-400 text-sm">
          No images found in this category yet.
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        id={`panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 mb-8"
      >
        {visibleImages.map((item) => (
          <ImageCard key={item.id} item={item} onClick={handleOpenModal} />
        ))}
      </div>

      {(hasMore || canCollapse) && (
        <div className="flex justify-center gap-4 mb-20">
          {hasMore && (
            <button
              onClick={() => setVisibleRows((r) => r + 2)}
              className="px-8 py-3 rounded-full font-semibold text-sm
                bg-gradient-to-r from-chirag-pink to-chirag-peach
                text-black shadow hover:shadow-lg transition-all duration-200
                hover:scale-105 active:scale-95"
            >
              View More
            </button>
          )}
          {canCollapse && (
            <button
              onClick={() => setVisibleRows(INITIAL_ROWS)}
              className="px-8 py-3 rounded-full font-semibold text-sm
                bg-gray-100 text-gray-700 shadow hover:shadow-lg transition-all
                duration-200 hover:scale-105 active:scale-95"
            >
              View Less
            </button>
          )}
        </div>
      )}

      {selectedItem && (
        <ImageModal item={selectedItem} onClose={handleCloseModal} />
      )}
    </>
  );
};

export default ImageGrid;