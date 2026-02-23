// components/portfolio/ImageModal.tsx

import React, { useEffect, useRef } from "react";
import type { ImageItem } from "../../types/portfolio";

interface ImageModalProps {
  item: ImageItem;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ item, onClose }) => {
  const backdropRef = useRef<HTMLDivElement>(null);

  /* Lock body scroll */
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  /* Escape key closes modal */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      ref={backdropRef}
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      className="fixed inset-0 z-50 flex items-center justify-center p-4
        bg-black/85 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
    >
      <div
        className="relative bg-white rounded-2xl overflow-hidden w-full max-w-sm
          shadow-2xl animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 9:16 image */}
        <div className="relative w-full" style={{ aspectRatio: "9 / 16" }}>
          <img
            src={item.imageUrl}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Title bar */}
        <div className="px-5 py-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-playfair font-semibold text-gray-800 line-clamp-2">
            {item.title}
          </h3>
          <span className="text-xs uppercase tracking-widest text-chirag-pink font-semibold shrink-0 capitalize">
            {item.category}
          </span>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close image"
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50
            text-white flex items-center justify-center hover:bg-black/70
            transition-colors focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.93); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.25s ease-out; }
      `}</style>
    </div>
  );
};

export default ImageModal;