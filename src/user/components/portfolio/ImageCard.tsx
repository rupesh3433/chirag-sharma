// components/portfolio/ImageCard.tsx

import React, { useState } from "react";
import type { ImageItem } from "../../types/portfolio";

interface ImageCardProps {
  item: ImageItem;
  onClick: (item: ImageItem) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ item, onClick }) => {
  const [imgError, setImgError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <article
      className="group relative cursor-pointer rounded-2xl overflow-hidden shadow-md
        hover:shadow-xl transition-all duration-300 hover:-translate-y-1
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chirag-pink"
      onClick={() => onClick(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(item);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View ${item.title}`}
    >
      {/* 9:16 aspect ratio container */}
      <div className="relative w-full" style={{ aspectRatio: "9 / 16" }}>
        {/* Skeleton loader */}
        {!loaded && !imgError && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-2xl" />
        )}

        {/* Broken image fallback */}
        {imgError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400 gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10 opacity-40"
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
            <span className="text-xs">Image unavailable</span>
          </div>
        ) : (
          <img
            src={item.imageUrl}
            alt={item.title}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setImgError(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500
              group-hover:scale-105 ${loaded ? "opacity-100" : "opacity-0"}`}
          />
        )}

        {/* Hover overlay with title */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent
            opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4"
        >
          <p className="text-white text-sm font-medium leading-snug line-clamp-2">
            {item.title}
          </p>
        </div>
      </div>
    </article>
  );
};

export default ImageCard;