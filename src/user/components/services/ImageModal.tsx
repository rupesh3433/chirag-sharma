import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

type ImageModalProps = {
  images: string[];
  initialIndex: number;
  onClose: () => void;
};

export const ImageModal: React.FC<ImageModalProps> = ({
  images,
  initialIndex,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const lastTouchDistance = useRef<number | null>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.width = '';
    };
  }, []);

  // Preload adjacent images for smoother navigation
  useEffect(() => {
    const preloadImage = (index: number) => {
      if (images[index]) {
        const img = new Image();
        img.src = images[index];
      }
    };

    // Preload next and previous images
    const nextIndex = (currentIndex + 1) % images.length;
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    
    preloadImage(nextIndex);
    preloadImage(prevIndex);
  }, [currentIndex, images]);

  // Handle image loading state and reset zoom
  useEffect(() => {
    setIsLoading(true);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (scale > 1) return; // Don't navigate if zoomed in
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [scale, images.length]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (scale > 1) return; // Don't navigate if zoomed in
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [scale, images.length]);

  const handleClose = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    onClose();
  }, [onClose]);

  // Calculate distance between two touch points
  type TouchPoint = {
    clientX: number;
    clientY: number;
  };
  
  const getTouchDistance = (
    touch1: TouchPoint,
    touch2: TouchPoint
  ): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };
  

  // Enhanced touch gestures with pinch-to-zoom
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch zoom start
      lastTouchDistance.current = getTouchDistance(e.touches[0], e.touches[1]);
    } else if (e.touches.length === 1) {
      // Single touch
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      
      if (scale > 1) {
        setIsDragging(true);
        dragStart.current = {
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y,
        };
      }
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDistance.current) {
      // Pinch zoom
      e.preventDefault();
      const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
      const scaleChange = currentDistance / lastTouchDistance.current;
      const newScale = Math.max(1, Math.min(scale * scaleChange, 4));
      
      setScale(newScale);
      lastTouchDistance.current = currentDistance;
      
      // Reset position if zooming out to 1
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1) {
      if (!touchStartX.current || !touchStartY.current) return;

      const diffX = touchStartX.current - e.touches[0].clientX;
      const diffY = touchStartY.current - e.touches[0].clientY;

      if (scale > 1 && isDragging) {
        // Pan when zoomed in
        e.preventDefault();
        setPosition({
          x: e.touches[0].clientX - dragStart.current.x,
          y: e.touches[0].clientY - dragStart.current.y,
        });
      } else if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe for navigation (only when not zoomed)
        e.preventDefault();
      }
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      lastTouchDistance.current = null;
      setIsDragging(false);
      
      if (touchStartX.current !== null && touchStartY.current !== null && scale === 1) {
        const diffX = touchStartX.current - e.changedTouches[0].clientX;
        const diffY = touchStartY.current - e.changedTouches[0].clientY;

        // Only trigger if horizontal swipe is dominant and exceeds threshold
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
          if (diffX > 0) {
            handleNext();
          } else {
            handlePrev();
          }
        }
      }

      touchStartX.current = null;
      touchStartY.current = null;
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (scale > 1) {
        // When zoomed in, only allow escape
        if (e.key === 'Escape') {
          if (scale > 1) {
            setScale(1);
            setPosition({ x: 0, y: 0 });
          } else {
            onClose();
          }
        }
        return;
      }
      
      if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, images.length, scale, onClose, handlePrev, handleNext]);

  // Double tap to zoom
  const lastTapRef = useRef<number>(0);
  const handleDoubleTap = (e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;
    
    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      // Double tap detected
      e.preventDefault();
      if (scale === 1) {
        setScale(2);
      } else {
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }
    }
    
    lastTapRef.current = now;
  };

  const showNavigation = images.length > 1;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={handleClose}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Main content container */}
      <div
        className="relative w-full h-full flex items-center justify-center p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image container with loading state */}
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          {/* Loading spinner */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          )}

          {/* Main image */}
          <img
            ref={imageRef}
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1} of ${images.length}`}
            className={`
              max-h-full max-w-full
              object-contain
              select-none
              transition-all duration-300
              ${isLoading ? 'opacity-0' : 'opacity-100'}
              ${scale > 1 ? 'cursor-move' : 'cursor-zoom-in'}
            `}
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              transformOrigin: 'center center',
            }}
            onLoad={() => setIsLoading(false)}
            onClick={handleDoubleTap}
            onTouchEnd={handleDoubleTap}
            draggable={false}
          />

          {/* Zoom indicator */}
          {scale > 1 && (
            <div className="
              absolute 
              top-16 left-1/2 -translate-x-1/2
              sm:top-20
              bg-black/70 
              backdrop-blur-sm
              text-white 
              px-3 py-1.5
              rounded-full 
              text-xs sm:text-sm
              font-medium
              z-30
              pointer-events-none
            ">
              {Math.round(scale * 100)}%
            </div>
          )}
        </div>

        {/* Close button - Adaptive positioning */}
        <button
          onClick={handleClose}
          aria-label="Close modal"
          className="
            absolute 
            top-2 right-2
            xs:top-3 xs:right-3
            sm:top-4 sm:right-4
            md:top-5 md:right-5
            lg:top-6 lg:right-6
            text-white/90 hover:text-white 
            p-1.5 xs:p-2 sm:p-2.5 md:p-3
            rounded-full 
            bg-black/30 hover:bg-black/50 
            backdrop-blur-sm
            transition-all duration-200
            hover:scale-110 active:scale-95
            z-20
            touch-manipulation
          "
        >
          <X className="w-5 h-5 xs:w-6 xs:h-6 sm:w-6 sm:h-6 md:w-7 md:h-7" />
        </button>

        {/* Navigation arrows (desktop & tablet) - Hidden when zoomed */}
        {showNavigation && scale === 1 && (
          <>
            {/* Left arrow */}
            <button
              onClick={handlePrev}
              aria-label="Previous image"
              className="
                absolute 
                left-2 xs:left-3 sm:left-4 md:left-6 lg:left-8
                top-1/2 -translate-y-1/2
                text-white/90 hover:text-white 
                p-2 xs:p-2.5 sm:p-3 md:p-3.5
                rounded-full 
                bg-black/30 hover:bg-black/50 
                backdrop-blur-sm
                transition-all duration-200
                hover:scale-110 active:scale-95
                z-20
                touch-manipulation
                hidden xs:flex items-center justify-center
              "
            >
              <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9" />
            </button>

            {/* Right arrow */}
            <button
              onClick={handleNext}
              aria-label="Next image"
              className="
                absolute 
                right-2 xs:right-3 sm:right-4 md:right-6 lg:right-8
                top-1/2 -translate-y-1/2
                text-white/90 hover:text-white 
                p-2 xs:p-2.5 sm:p-3 md:p-3.5
                rounded-full 
                bg-black/30 hover:bg-black/50 
                backdrop-blur-sm
                transition-all duration-200
                hover:scale-110 active:scale-95
                z-20
                touch-manipulation
                hidden xs:flex items-center justify-center
              "
            >
              <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9" />
            </button>
          </>
        )}

        {/* Bottom controls bar for mobile - Hidden when zoomed */}
        {showNavigation && scale === 1 && (
          <div className="
            absolute 
            bottom-0 left-0 right-0
            flex items-center justify-between
            p-3 xs:p-4 sm:p-5
            bg-gradient-to-t from-black/60 via-black/30 to-transparent
            backdrop-blur-sm
            xs:hidden
          ">
            {/* Mobile previous button */}
            <button
              onClick={handlePrev}
              aria-label="Previous image"
              className="
                text-white/90 active:text-white 
                p-2.5
                rounded-full 
                bg-black/40 active:bg-black/60 
                transition-all duration-200
                active:scale-95
                touch-manipulation
              "
            >
              <ChevronLeft className="w-7 h-7" />
            </button>

            {/* Image counter */}
            <div className="
              text-white/95 
              bg-black/50 
              backdrop-blur-md
              px-4 py-2
              rounded-full 
              text-sm sm:text-base
              font-medium
              select-none
            ">
              {currentIndex + 1} / {images.length}
            </div>

            {/* Mobile next button */}
            <button
              onClick={handleNext}
              aria-label="Next image"
              className="
                text-white/90 active:text-white 
                p-2.5
                rounded-full 
                bg-black/40 active:bg-black/60 
                transition-all duration-200
                active:scale-95
                touch-manipulation
              "
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          </div>
        )}

        {/* Image counter for desktop/tablet (centered bottom) */}
        {showNavigation && (
          <div className={`
            hidden xs:block
            absolute 
            bottom-3 xs:bottom-4 sm:bottom-5 md:bottom-6 lg:bottom-8
            left-1/2 -translate-x-1/2
            text-white/95 
            bg-black/50 
            backdrop-blur-md
            px-3 xs:px-4 sm:px-5
            py-1.5 xs:py-2 sm:py-2.5
            rounded-full 
            text-xs xs:text-sm sm:text-base
            font-medium
            select-none
            z-10
            transition-opacity duration-300
            ${scale > 1 ? 'opacity-0' : 'opacity-100'}
          `}>
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Zoom hint (shows briefly, fades out) */}
        {scale === 1 && (
          <div className="
            absolute 
            top-16 left-1/2 -translate-x-1/2
            sm:top-20
            text-white/50
            text-xs sm:text-sm
            text-center
            pointer-events-none
            select-none
            animate-pulse
            z-10
          ">
            Double tap to zoom
          </div>
        )}
      </div>
    </div>
  );
};