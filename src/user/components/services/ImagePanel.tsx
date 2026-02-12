import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { ImageModal } from "./ImageModal";

type ImagePanelProps = {
  images: string[];
};

export const ImagePanel: React.FC<ImagePanelProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const hasImages = Array.isArray(images) && images.length > 0;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasImages) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasImages) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  if (!hasImages) {
    return (
      <div
        className="
          mx-auto
          w-[200px] xs:w-[220px] sm:w-[240px] md:w-[260px]
          aspect-[9/16]
          lg:mx-0
          lg:w-[300px] xl:w-[350px]
          lg:h-full
          lg:aspect-auto
          bg-gray-100
          rounded-xl xs:rounded-2xl
          flex items-center justify-center
          text-gray-400 text-xs xs:text-sm
          shadow-lg xs:shadow-xl
        "
      >
        No images
      </div>
    );
  }

  return (
    <>
      <div
        className="
          relative
          mx-auto
          w-[200px] xs:w-[220px] sm:w-[260px] md:w-[280px]
          aspect-[9/16]
          lg:mx-0
          lg:aspect-auto
          lg:w-[300px] xl:w-[350px]
          lg:h-full
          rounded-xl xs:rounded-2xl
          overflow-hidden
          bg-gray-900
          shadow-lg xs:shadow-xl
          flex-shrink-0
          group
        "
      >
        <img
          src={images[currentIndex]}
          alt={`Service image ${currentIndex + 1}`}
          className="
            absolute inset-0
            w-full h-full
            object-cover
            cursor-pointer
            transition-all duration-300
            group-hover:scale-105
          "
          onClick={() => setModalOpen(true)}
        />

        <div className="absolute bottom-0 left-0 right-0 h-16 xs:h-20 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

        <div
          className="
            absolute inset-0
            bg-black/30 opacity-0
            hover:opacity-100
            active:opacity-100
            transition-opacity duration-300
            flex items-center justify-center
            cursor-pointer
          "
          onClick={() => setModalOpen(true)}
        >
          <Maximize2 className="text-white w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 drop-shadow-lg" />
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Previous image"
              className="
                absolute left-1.5 xs:left-2 sm:left-2 md:left-3
                top-1/2 -translate-y-1/2
                bg-white/90 hover:bg-white
                p-1 xs:p-1.5 sm:p-2
                rounded-full
                shadow-md
                transition-all duration-200
                hover:scale-110 active:scale-95
                z-10
                touch-manipulation
              "
            >
              <ChevronLeft className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-gray-800" />
            </button>

            <button
              onClick={handleNext}
              aria-label="Next image"
              className="
                absolute right-1.5 xs:right-2 sm:right-2 md:right-3
                top-1/2 -translate-y-1/2
                bg-white/90 hover:bg-white
                p-1 xs:p-1.5 sm:p-2
                rounded-full
                shadow-md
                transition-all duration-200
                hover:scale-110 active:scale-95
                z-10
                touch-manipulation
              "
            >
              <ChevronRight className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-gray-800" />
            </button>

            <div
              className="
                absolute bottom-1.5 xs:bottom-2 sm:bottom-3
                left-1/2 -translate-x-1/2
                bg-black/60 backdrop-blur-sm
                text-white 
                px-2 py-0.5 xs:px-2.5 xs:py-1 sm:px-3 sm:py-1.5
                rounded-full 
                text-[9px] xs:text-[10px] sm:text-xs
                font-medium
                z-10
                select-none
              "
            >
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {modalOpen && (
        <ImageModal
          images={images}
          initialIndex={currentIndex}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
};