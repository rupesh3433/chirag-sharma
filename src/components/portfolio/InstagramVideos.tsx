import React, { useEffect, useRef, useState } from "react";
import { 
  Heart, 
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye
} from "lucide-react";

/* =======================
   TYPES
======================= */
type InstagramPost = {
  id: string;
  code: string;
  title: string;
  caption: string;
  thumbnail: string;
  cloudinaryThumbnail?: string | null;
  postUrl: string;
  embedUrl: string;
  likeCount?: number;
  commentCount?: number;
  playCount?: number;
  shareCount?: number;
  takenAt?: number;
};

type InstagramVideosProps = {
  limit?: number;
  heading?: string;
};

/* =======================
   PLAY ICON SVG (Instagram Style Triangle |>)
======================= */
const PlayIcon = ({ size = 32, className = "" }: { size?: number; className?: string }) => (
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
const InstagramVideos = ({
  limit = 12,
  heading = "Latest Instagram Reels",
}: InstagramVideosProps) => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  /* =======================
     FORMAT HELPERS
  ======================= */
  const formatNumber = (num: number): string => {
    if (!num) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return "";
    const date = new Date(timestamp * 1000);
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
     FETCH REELS
  ======================= */
  const fetchReels = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log(`🚀 Fetching reels from: ${API_URL}/public/instagram/reels?limit=${limit}`);
      
      const response = await fetch(`${API_URL}/public/instagram/reels?limit=${limit}`);
      const data = await response.json();

      console.log("📦 Response:", data);

      if (data.success && data.reels && data.reels.length > 0) {
        const processedReels = data.reels.map((reel: any) => ({
          id: reel.id || `reel_${reel.code}`,
          code: reel.code,
          title: reel.title || reel.caption || "Instagram Reel",
          caption: reel.caption || "",
          thumbnail: reel.cloudinaryThumbnail || reel.thumbnail,
          cloudinaryThumbnail: reel.cloudinaryThumbnail,
          embedUrl: reel.embedUrl,
          postUrl: reel.postUrl?.replace(/\/$/, '') || `https://www.instagram.com/reel/${reel.code}`,
          likeCount: reel.likeCount || 0,
          commentCount: reel.commentCount || 0,
          playCount: reel.playCount || 0,
          shareCount: reel.shareCount || 0,
          takenAt: reel.takenAt || 0
        }));
        
        setPosts(processedReels);
        setDataSource(data.source || "unknown");
        
        // Only show banner if freshly fetched from API
        if (data.source === "rapidapi_fresh") {
          console.log("✅ Fresh data from RapidAPI - showing banner");
          setShowBanner(true);
          
          // Hide banner after 3 seconds
          setTimeout(() => {
            setShowBanner(false);
          }, 3000);
        } else {
          setShowBanner(false);
        }
        
        // Log source info
        if (data.source === "mongodb_cache") {
          console.log(`✅ Loaded from MongoDB cache (age: ${data.cache_age_days} days)`);
        } else if (data.source === "mongodb_cache_fallback") {
          console.warn(`⚠️ Using old cache (age: ${data.cache_age_days} days) - API failed`);
          setError(`Using cached data (${data.cache_age_days} days old)`);
        }
      } else if (data.success === false) {
        // API returned error
        console.error("❌ API returned error:", data.error);
        setError(data.error || "Failed to fetch reels");
        setPosts([]);
      } else {
        // Empty response
        console.warn("⚠️ API returned no reels");
        setError("No reels available");
        setPosts([]);
      }
    } catch (err) {
      console.error("Failed to fetch reels:", err);
      setError("Failed to connect to server");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReels();
  }, [limit]);

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
      setCurrentIndex(Math.min(posts.length - 3, currentIndex + 1));
    }
  };

  /* =======================
     OPEN INSTAGRAM
  ======================= */
  const openInstagram = (postUrl: string) => {
    window.open(postUrl, '_blank', 'noopener,noreferrer');
  };

  /* =======================
     RENDER
  ======================= */
  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading reels...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reels Available</h3>
            <p className="text-gray-600 mb-4">{error || "Unable to load Instagram reels at this time"}</p>
            <button 
              onClick={fetchReels}
              className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-[1280px] mx-auto px-4">
        {/* Fresh Data Banner - Only shows for fresh API data and disappears after 3s */}
        {showBanner && dataSource === "rapidapi_fresh" && (
          <div className="mb-6 border rounded-lg p-4 flex items-center gap-3 bg-blue-50 border-blue-200 text-blue-700 animate-fade-in">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium">🆕 Fresh from API</p>
          </div>
        )}

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
              disabled={currentIndex >= posts.length - 3}
              className="p-2 rounded-full bg-white shadow hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              aria-label="Next"
            >
              <ChevronRight size={20} />
            </button>
            
            {/* View on Instagram Button */}
            <a
              href="https://www.instagram.com/_jinniechiragmua/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white rounded-full hover:shadow-lg transition font-semibold text-sm"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span className="hidden lg:inline">View Profile</span>
            </a>
          </div>
        </div>

        {/* Reels Container */}
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
            {posts.map((post) => {
              const thumbnailUrl = post.cloudinaryThumbnail || post.thumbnail;
              
              return (
                <div
                  key={post.id}
                  className="flex-shrink-0 w-full md:w-[calc(33.333%-11px)] snap-start"
                  onMouseEnter={() => setHoveredId(post.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Instagram-like Card */}
                  <div 
                    className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100"
                    onClick={() => openInstagram(post.postUrl)}
                  >
                    {/* Video Container */}
                    <div className="relative aspect-[9/16] bg-black overflow-hidden group">
                      {/* Thumbnail */}
                      <img
                        src={thumbnailUrl}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          // Fallback to original thumbnail if Cloudinary fails
                          if (e.currentTarget.src !== post.thumbnail) {
                            e.currentTarget.src = post.thumbnail;
                          }
                        }}
                      />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                      {/* Instagram-Style Play Icon Overlay (Triangle |>) */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div 
                          className="transition-all duration-300"
                          style={{
                            transform: hoveredId === post.id ? 'scale(1.2)' : 'scale(1)',
                            opacity: hoveredId === post.id ? 1 : 0.9
                          }}
                        >
                          <div className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center shadow-2xl"
                               style={{ border: '3px solid rgba(255, 255, 255, 0.6)' }}>
                            <PlayIcon size={36} className="text-white drop-shadow-lg" />
                          </div>
                        </div>
                      </div>

                      {/* Top Bar - Instagram Style */}
                      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 p-0.5">
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                              <span className="text-xs font-bold text-gray-700">JC</span>
                            </div>
                          </div>
                          <span className="text-white text-sm font-semibold" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                            _jinniechiragmua
                          </span>
                        </div>
                        <MoreHorizontal className="text-white" size={20} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                      </div>

                      {/* Bottom Stats - Instagram Style */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex items-end justify-between">
                          {/* Left Side - Caption */}
                          <div className="flex-1 mr-4">
                            <p className="text-white text-sm font-medium mb-2 overflow-hidden"
                               style={{ 
                                 display: '-webkit-box',
                                 WebkitLineClamp: 2,
                                 WebkitBoxOrient: 'vertical',
                                 textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                               }}>
                              {post.caption || post.title}
                            </p>
                            <p className="text-white/80 text-xs" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                              {formatDate(post.takenAt || 0)}
                            </p>
                          </div>

                          {/* Right Side - Action Buttons */}
                          <div className="flex flex-col gap-4">
                            {/* Like */}
                            <div className="flex flex-col items-center">
                              <button className="text-white hover:scale-110 transition-transform">
                                <Heart size={28} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                              </button>
                              {post.likeCount && post.likeCount > 0 && (
                                <span className="text-white text-xs font-semibold mt-1" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                                  {formatNumber(post.likeCount)}
                                </span>
                              )}
                            </div>

                            {/* Comment */}
                            {post.commentCount && post.commentCount > 0 && (
                              <div className="flex flex-col items-center">
                                <button className="text-white hover:scale-110 transition-transform">
                                  <MessageCircle size={28} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                                </button>
                                <span className="text-white text-xs font-semibold mt-1" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                                  {formatNumber(post.commentCount)}
                                </span>
                              </div>
                            )}

                            {/* Views */}
                            {post.playCount && post.playCount > 0 && (
                              <div className="flex flex-col items-center">
                                <button className="text-white hover:scale-110 transition-transform">
                                  <Eye size={28} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                                </button>
                                <span className="text-white text-xs font-semibold mt-1" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                                  {formatNumber(post.playCount)}
                                </span>
                              </div>
                            )}

                            {/* Share */}
                            {post.shareCount && post.shareCount > 0 && (
                              <div className="flex flex-col items-center">
                                <button className="text-white hover:scale-110 transition-transform">
                                  <Send size={28} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                                </button>
                                <span className="text-white text-xs font-semibold mt-1" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                                  {formatNumber(post.shareCount)}
                                </span>
                              </div>
                            )}

                            {/* Bookmark */}
                            <button className="text-white hover:scale-110 transition-transform">
                              <Bookmark size={28} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Scroll Indicator */}
        <div className="md:hidden flex justify-center gap-1 mt-6">
          {posts.slice(0, Math.min(posts.length, 5)).map((_, idx) => (
            <div
              key={idx}
              className={`h-1 rounded-full transition-all ${
                idx === currentIndex ? 'w-8 bg-pink-500' : 'w-1 bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Mobile View Profile Link */}
        <div className="md:hidden text-center mt-8">
          <a
            href="https://www.instagram.com/_jinniechiragmua/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white font-semibold rounded-full hover:shadow-lg transition-all"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            View Profile on Instagram
          </a>
        </div>
      </div>
    </section>
  );
};

export default InstagramVideos;