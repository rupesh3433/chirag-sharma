import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  X,
  Share2,
  Heart,
  Star,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Tag,
  Ticket,
  Award,
  type LucideIcon,
} from "lucide-react";
import { EventItem } from "@/user/types/event";
import EventBookingModal from "./EventBookingModal";

interface EventDetailModalProps {
  event: EventItem;
  onClose: () => void;
  isLiked: boolean;
  onToggleLike: () => void;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  isLiked,
  onToggleLike,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [imageCollapsed, setImageCollapsed] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const touchStartX = useRef<number>(0);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 200);
  };

  const allImages = [event.poster, ...(event.gallery_images || [])];

  const nextImage = () => {
    if (allImages.length === 0) return;
    setActiveImage((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    if (allImages.length === 0) return;
    setActiveImage((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const getPriceCategoryIcon = (
    index: number,
    total: number
  ): LucideIcon | null => {
    if (total === 1) return null;
    const icons: LucideIcon[] = [Ticket, Tag, Star, DollarSign, Award];
    return icons[index % icons.length];
  };

  useEffect(() => {
    const contentEl = contentRef.current;
    if (!contentEl) return;
    const handleScroll = () => {
      if (window.innerWidth < 640) {
        if (contentEl.scrollTop > 50) setImageCollapsed(true);
      }
    };
    contentEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => contentEl.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const imageEl = imageRef.current;
    if (!imageEl || window.innerWidth >= 640) return;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      touchStartX.current = e.touches[0].clientX;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const deltaY = e.touches[0].clientY - touchStartY.current;
      const deltaX = Math.abs(e.touches[0].clientX - touchStartX.current);
      if (deltaY > 30 && deltaX < 20 && imageCollapsed) {
        setImageCollapsed(false);
        if (contentRef.current) contentRef.current.scrollTop = 0;
      }
    };
    imageEl.addEventListener("touchstart", handleTouchStart, { passive: true });
    imageEl.addEventListener("touchmove", handleTouchMove, { passive: true });
    return () => {
      imageEl.removeEventListener("touchstart", handleTouchStart);
      imageEl.removeEventListener("touchmove", handleTouchMove);
    };
  }, [imageCollapsed]);

  // Determine button label based on category
  const getBookingButtonLabel = () => {
    if (event.category === "past") return "View Details";
    if (event.category === "current") return "Book Now";
    return "Register Now";
  };

  const canBook = event.category !== "past";

  return (
    <>
      <div
        className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity duration-200 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm pointer-events-none" />

        <div
          className={`relative z-10 w-full h-full sm:h-auto sm:max-w-4xl bg-gray-950 border-0 sm:border-2 sm:border-white/20 sm:rounded-2xl overflow-hidden flex flex-col sm:flex-row sm:max-h-[90vh] transition-transform duration-300 shadow-2xl ${
            isClosing
              ? "translate-y-full sm:translate-y-0 sm:scale-95"
              : "translate-y-0 sm:scale-100"
          }`}
          style={{
            boxShadow:
              "0 0 80px rgba(239, 68, 68, 0.2), 0 20px 60px rgba(0, 0, 0, 0.8)",
          }}
        >
          <button
            onClick={handleClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-3 bg-red-500 rounded-full z-20 hover:bg-red-600 transition-all active:scale-90 shadow-lg hover:shadow-red-500/50 group"
          >
            <X
              size={22}
              strokeWidth={2.5}
              className="text-white group-hover:rotate-90 transition-transform duration-300"
            />
          </button>

          {/* Image Section */}
          <div
            ref={imageRef}
            className={`sm:w-1/2 relative bg-gray-900 flex-shrink-0 transition-all duration-500 ease-out ${
              imageCollapsed ? "h-[20vh]" : "h-[45vh] sm:h-auto"
            }`}
          >
            {allImages.length > 0 ? (
              <>
                <div className="relative w-full h-full">
                  <img
                    src={allImages[activeImage]}
                    alt={event.title}
                    className="w-full h-full object-contain sm:object-cover"
                  />
                  {allImages.length > 1 && (
                    <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-full text-white text-xs font-bold">
                      {activeImage + 1} / {allImages.length}
                    </div>
                  )}
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full text-white transition-all active:scale-90"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full text-white transition-all active:scale-90"
                      >
                        <ChevronRight size={24} />
                      </button>
                    </>
                  )}
                </div>

                {allImages.length > 1 && !imageCollapsed && (
                  <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                    {allImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImage(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-gray-800 border-2 transition-all ${
                          activeImage === index
                            ? "border-pink-500 scale-110"
                            : "border-white/20 hover:border-white/40"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Calendar className="text-gray-600" size={48} />
              </div>
            )}

            {event.badge && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                  {event.badge}
                </span>
              </div>
            )}

            <div className="absolute top-4 right-16 flex gap-2">
              <button
                onClick={onToggleLike}
                className={`p-2.5 rounded-full backdrop-blur-sm border transition-all active:scale-90 ${
                  isLiked
                    ? "bg-pink-500 border-pink-400 text-white"
                    : "bg-black/50 border-white/20 text-white hover:bg-black/70"
                }`}
              >
                <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
              </button>
              <button className="p-2.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-black/70 transition-all active:scale-90">
                <Share2 size={18} />
              </button>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 sm:w-1/2 flex flex-col overflow-hidden">
            <div className="flex-shrink-0 sticky top-0 z-10 bg-gray-950 px-5 sm:px-6 md:px-8 pt-5 sm:pt-6 md:pt-8 pb-4 border-b border-white/5">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white pr-10 leading-tight">
                {event.title}
              </h2>

              {event.rating && (
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < Math.floor(event.rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-600"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-white font-bold text-sm">
                    {event.rating}
                  </span>
                  <span className="text-gray-400 text-xs sm:text-sm">
                    ({event.attendees})
                  </span>
                </div>
              )}
            </div>

            <div
              ref={contentRef}
              className="flex-1 overflow-y-auto px-5 sm:px-6 md:px-8 py-4 sm:py-6"
            >
              <p className="text-gray-300 mb-5 sm:mb-6 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {event.description}
              </p>

              <div className="space-y-3 sm:space-y-4 text-gray-300 text-sm sm:text-base mb-6 sm:mb-8">
                <Detail icon={Calendar} label="Date" value={event.date} />
                <Detail
                  icon={Clock}
                  label="Time"
                  value={`${event.time_from} - ${event.time_to}`}
                />
                <Detail icon={MapPin} label="Location" value={event.location} />
                <Detail
                  icon={Users}
                  label="Total Seats"
                  value={`${event.total_seats} seats`}
                />
                {event.duration && (
                  <Detail icon={Clock} label="Duration" value={event.duration} />
                )}
              </div>

              {event.price_details && event.price_details.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-white mb-3">
                    {event.price_details.length === 1 ? "Price" : "Price Categories"}
                  </h3>

                  {event.price_details.length === 1 ? (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">
                          {event.price_details[0].name}
                        </span>
                        <span className="text-pink-400 font-bold text-2xl">
                          ₹{event.price_details[0].price.toLocaleString()}
                        </span>
                      </div>
                      {event.price_details[0].available_seats !== undefined && (
                        <p className="text-gray-400 text-xs mt-1">
                          {event.price_details[0].available_seats} seats available
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {event.price_details.map((category, index) => {
                        const Icon = getPriceCategoryIcon(
                          index,
                          event.price_details.length
                        );
                        return (
                          <div
                            key={index}
                            className="group relative inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 hover:border-pink-500/40 transition-all cursor-pointer hover:scale-105"
                          >
                            {Icon && <Icon className="text-pink-400" size={16} />}
                            <div className="flex flex-col">
                              <span className="text-white font-bold text-xs">
                                {category.name}
                              </span>
                              <span className="text-pink-400 font-bold text-base">
                                ₹{category.price.toLocaleString()}
                              </span>
                            </div>
                            {(category.description ||
                              category.available_seats !== undefined) && (
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-xl">
                                {category.description && (
                                  <div className="text-xs text-gray-300 mb-1">
                                    {category.description}
                                  </div>
                                )}
                                {category.available_seats !== undefined && (
                                  <div className="text-xs text-gray-400">
                                    {category.available_seats} seats available
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className="h-24" />
            </div>

            {/* Footer CTA */}
            <div className="flex-shrink-0 sticky bottom-0 z-10 bg-gradient-to-t from-gray-950 via-gray-950 to-gray-950/95 backdrop-blur-sm px-5 sm:px-6 md:px-8 pt-4 pb-5 sm:pb-6 border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
              <button
                onClick={() => {
                  if (canBook) setShowBookingModal(true);
                }}
                className={`w-full py-3.5 sm:py-4 font-bold rounded-xl transition-all active:scale-95 ${
                  canBook
                    ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:shadow-xl hover:shadow-pink-500/50"
                    : "bg-white/5 border border-white/10 text-gray-400 cursor-not-allowed"
                }`}
              >
                {getBookingButtonLabel()}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <EventBookingModal
          event={event}
          onClose={() => setShowBookingModal(false)}
        />
      )}
    </>
  );
};

const Detail = ({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
    <Icon size={18} className="text-pink-400 flex-shrink-0" />
    <div>
      <div className="text-xs text-gray-500 mb-0.5">{label}</div>
      <div className="font-medium text-white">{value}</div>
    </div>
  </div>
);

export default EventDetailModal;