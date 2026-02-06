import React, { useEffect, useRef, useState } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Youtube, 
  Play,
  Eye,
  ThumbsUp,
  MessageCircle,
  Share2,
  Pause,
  Volume2,
  VolumeX,
  Maximize
} from "lucide-react";

/* =======================
   TYPES
======================= */
type Video = {
  id: string;
  title: string;
  thumbnail: string;
  viewCount?: string;
  likeCount?: string;
  publishedAt?: string;
};

/* =======================
   CONFIG
======================= */
const CHANNEL_ID = import.meta.env.VITE_YOUTUBE_CHANNEL_ID;
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const CORS_PROXY = "https://api.allorigins.win/raw?url=";

/* =======================
   PLAY ICON (TRIANGLE)
======================= */
const PlayTriangleIcon = ({ size = 32, className = "" }: { size?: number; className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor"
    className={className}
  >
    <path d="M8 5v14l11-7z" />
  </svg>
);

/* =======================
   COMPONENT
======================= */
const YoutubeVideos = ({ 
  limit = 12,
  heading = "Latest YouTube Videos" 
}: { 
  limit?: number;
  heading?: string;
}) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  /* =======================
     FETCH RSS
  ======================= */
  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log(`🎥 Fetching YouTube videos from channel: ${CHANNEL_ID}`);
        
        const response = await fetch(CORS_PROXY + encodeURIComponent(RSS_URL));
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");

        const entries = Array.from(xmlDoc.getElementsByTagName("entry")).slice(0, limit);

        const parsedVideos: Video[] = entries.map((entry) => {
          const videoId = entry.getElementsByTagName("yt:videoId")[0]?.textContent || "";
          const title = entry.getElementsByTagName("title")[0]?.textContent || "Untitled Video";
          const published = entry.getElementsByTagName("published")[0]?.textContent || "";
          
          // Extract stats from media:group if available
          const mediaGroup = entry.getElementsByTagName("media:group")[0];
          const viewCount = mediaGroup?.getElementsByTagName("media:community")?.[0]
            ?.getElementsByTagName("media:statistics")?.[0]
            ?.getAttribute("views") || undefined;

          return {
            id: videoId,
            title,
            thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            viewCount,
            publishedAt: published
          };
        });

        setVideos(parsedVideos);
        console.log(`✅ Loaded ${parsedVideos.length} YouTube videos`);
      } catch (err) {
        console.error("❌ YouTube RSS fetch error:", err);
        setError("Failed to load YouTube videos");
      } finally {
        setLoading(false);
      }
    };

    if (CHANNEL_ID) {
      fetchVideos();
    } else {
      setError("YouTube Channel ID not configured");
      setLoading(false);
    }
  }, [limit]);

  /* =======================
     FORMAT HELPERS
  ======================= */
  const formatNumber = (num: string | number | undefined): string => {
    if (!num) return "0";
    const n = typeof num === "string" ? parseInt(num) : num;
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  /* =======================
     SCROLL HANDLERS
  ======================= */
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const scrollAmount = container.offsetWidth / 3;
    
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      setCurrentIndex(Math.max(0, currentIndex - 1));
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setCurrentIndex(Math.min(videos.length - 3, currentIndex + 1));
    }
  };

  /* =======================
     VIDEO HANDLERS
  ======================= */
  const playVideo = (videoId: string) => {
    setActiveVideoId(videoId);
  };

  const closeVideo = () => {
    setActiveVideoId(null);
  };

  const openYouTube = (videoId: string) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank', 'noopener,noreferrer');
  };

  /* =======================
     RENDER STATES
  ======================= */
  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading YouTube videos...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || videos.length === 0) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="text-center py-20">
            <Youtube className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Videos Available</h3>
            <p className="text-gray-600 mb-4">{error || "Unable to load YouTube videos at this time"}</p>
            {CHANNEL_ID && (
              <a
                href={`https://www.youtube.com/channel/${CHANNEL_ID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <Youtube size={20} />
                Visit YouTube Channel
              </a>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-[1280px] mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">{heading}</h2>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => scroll('left')}
              disabled={currentIndex === 0}
              className="p-2 rounded-full bg-white shadow hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              aria-label="Previous"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={currentIndex >= videos.length - 3}
              className="p-2 rounded-full bg-white shadow hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              aria-label="Next"
            >
              <ChevronRight size={20} />
            </button>
            
            {CHANNEL_ID && (
              <a
                href={`https://www.youtube.com/channel/${CHANNEL_ID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition font-semibold text-sm"
              >
                <Youtube size={18} />
                <span className="hidden lg:inline">View Channel</span>
              </a>
            )}
          </div>
        </div>

        {/* Videos Container */}
        <div className="relative">
          <div 
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <style>
              {`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}
            </style>

            {videos.map((video) => (
              <div
                key={video.id}
                className="flex-shrink-0 w-full md:w-[calc(33.333%-11px)] snap-start"
                onMouseEnter={() => setHoveredId(video.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Video Card */}
                <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
                  {/* Video Container */}
                  <div className="relative aspect-[9/16] bg-black overflow-hidden group">
                    {activeVideoId === video.id ? (
                      /* Embedded Player */
                      <div className="absolute inset-0">
                        <iframe
                          src={`https://www.youtube.com/embed/${video.id}?autoplay=1&playsinline=1&modestbranding=1&rel=0${isMuted ? '&mute=1' : ''}`}
                          className="w-full h-full"
                          allow="autoplay; encrypted-media; picture-in-picture"
                          allowFullScreen
                          title={video.title}
                        />
                        
                        {/* Close Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            closeVideo();
                          }}
                          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/70 hover:bg-black/90 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      /* Thumbnail View */
                      <button
                        onClick={() => playVideo(video.id)}
                        className="absolute inset-0 w-full h-full"
                      >
                        {/* Thumbnail Image */}
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            // Fallback to hqdefault if maxresdefault fails
                            const target = e.currentTarget;
                            if (!target.src.includes('hqdefault')) {
                              target.src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
                            }
                          }}
                        />

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                        {/* Play Button - Instagram Style */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div 
                            className="transition-all duration-300"
                            style={{
                              transform: hoveredId === video.id ? 'scale(1.15)' : 'scale(1)',
                              opacity: hoveredId === video.id ? 1 : 0.95
                            }}
                          >
                            <div className="w-20 h-20 rounded-full bg-red-600/90 backdrop-blur-sm flex items-center justify-center shadow-2xl border-3 border-white/30">
                              <PlayTriangleIcon size={36} className="text-white drop-shadow-lg ml-1" />
                            </div>
                          </div>
                        </div>

                        {/* Top Bar - Channel Info */}
                        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                              <Youtube className="text-white" size={16} />
                            </div>
                            <span className="text-white text-sm font-semibold" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                              YouTube
                            </span>
                          </div>
                          
                          {/* Open in YouTube button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openYouTube(video.id);
                            }}
                            className="p-1.5 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full transition"
                          >
                            <Maximize className="text-white" size={16} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                          </button>
                        </div>

                        {/* Bottom Info - Instagram Style */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <div className="flex items-end justify-between">
                            {/* Left Side - Title & Date (Instagram Style - Left Aligned) */}
                            <div className="flex-1 mr-4 text-left">
                              <p className="text-white text-sm font-medium mb-2 text-left overflow-hidden"
                                 style={{ 
                                   display: '-webkit-box',
                                   WebkitLineClamp: 2,
                                   WebkitBoxOrient: 'vertical',
                                   textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                                   lineHeight: '1.4',
                                   textAlign: 'left'
                                 }}>
                                {video.title}
                              </p>
                              <p className="text-white/90 text-xs font-medium text-left" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)', textAlign: 'left' }}>
                                {formatDate(video.publishedAt)}
                              </p>
                            </div>

                            {/* Right Side - Action Buttons (Instagram Style) */}
                            <div className="flex flex-col gap-4">
                              {/* Like */}
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openYouTube(video.id);
                                }}
                                className="text-white hover:scale-110 transition-transform"
                              >
                                <ThumbsUp size={28} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                              </button>
                              
                              {/* Comment */}
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openYouTube(video.id);
                                }}
                                className="text-white hover:scale-110 transition-transform"
                              >
                                <MessageCircle size={28} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                              </button>

                              {/* Views - Below Comments */}
                              {video.viewCount && (
                                <div className="flex flex-col items-center">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openYouTube(video.id);
                                    }}
                                    className="text-white hover:scale-110 transition-transform"
                                  >
                                    <Eye size={28} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                                  </button>
                                  <span className="text-white text-xs font-semibold mt-1" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                                    {formatNumber(video.viewCount)}
                                  </span>
                                </div>
                              )}
                              
                              {/* Share */}
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (navigator.share) {
                                    navigator.share({
                                      title: video.title,
                                      url: `https://www.youtube.com/watch?v=${video.id}`
                                    });
                                  }
                                }}
                                className="text-white hover:scale-110 transition-transform"
                              >
                                <Share2 size={28} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Scroll Indicator */}
        <div className="md:hidden flex justify-center gap-1 mt-6">
          {videos.slice(0, Math.min(videos.length, 5)).map((_, idx) => (
            <div
              key={idx}
              className={`h-1 rounded-full transition-all ${
                idx === currentIndex ? 'w-8 bg-red-600' : 'w-1 bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Mobile View Channel Link */}
        {CHANNEL_ID && (
          <div className="md:hidden text-center mt-8">
            <a
              href={`https://www.youtube.com/channel/${CHANNEL_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition-all shadow-lg"
            >
              <Youtube size={20} />
              View Channel on YouTube
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default YoutubeVideos;