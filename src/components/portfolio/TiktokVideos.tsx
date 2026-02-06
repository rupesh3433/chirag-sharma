import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Heart,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Play,
  Volume2,
  VolumeX,
  ExternalLink,
} from "lucide-react";

/* =======================
   TYPES
======================= */
type TikTokVideo = {
  video_id: string;
  description: string;
  create_time: number;
  duration: number;
  thumbnail_url?: string;
  like_count?: number;
  comment_count?: number;
  share_count?: number;
  view_count?: number;
  music_title?: string;
  music_author?: string;
  cloudinary?: {
    url: string;
    public_id: string;
  } | null;
};

type TikTokUser = {
  username: string;
  verified?: boolean;
  followers_count?: number;
  profile_picture_url?: string;
};

type TikTokVideosProps = {
  username?: string;
  limit?: number;
  heading?: string;
};

/* =======================
   THUMBNAIL COMPONENT
======================= */
interface ThumbnailProps {
  thumbnailUrl: string;
  username: string;
  onClick: () => void;
}

const Thumbnail: React.FC<ThumbnailProps> = ({ thumbnailUrl, username, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="relative w-full h-full cursor-pointer group overflow-hidden"
    >
      <img
        src={thumbnailUrl}
        alt={`TikTok by @${username}`}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      
      {/* Play Button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-2xl border-3 border-white group-hover:scale-110 group-hover:bg-cyan-500 transition-all duration-300">
          <Play className="w-10 h-10 text-gray-900 group-hover:text-white ml-1" fill="currentColor" />
        </div>
      </div>

      {/* Bottom Gradient for Info */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/95 to-transparent" />
    </div>
  );
};

/* =======================
   TIKTOK EMBED PLAYER (WITH AUDIO)
======================= */
interface TikTokEmbedPlayerProps {
  videoId: string;
  username: string;
  onClose: () => void;
}

const TikTokEmbedPlayer: React.FC<TikTokEmbedPlayerProps> = ({ videoId, username, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false); // Start unmuted for audio
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Build iframe URL with audio enabled
  const iframeUrl = `https://www.tiktok.com/player/v1/${videoId}?autoplay=1&loop=1&muted=0`;

  useEffect(() => {
    setIsLoading(true);
    
    const handleMessage = (e: MessageEvent) => {
      if (e.data && typeof e.data === 'object' && e.data['x-tiktok-player']) {
        if (e.data.type === 'onPlayerReady') {
          setIsLoading(false);
          // Unmute on ready
          if (iframeRef.current) {
            iframeRef.current.contentWindow?.postMessage(
              { 'x-tiktok-player': true, type: 'unMute' },
              '*'
            );
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [videoId]);

  const toggleMute = () => {
    if (!iframeRef.current) return;
    
    const command = isMuted ? 'unMute' : 'mute';
    iframeRef.current.contentWindow?.postMessage(
      { 'x-tiktok-player': true, type: command },
      '*'
    );
    setIsMuted(!isMuted);
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cyan-900 to-pink-900 z-10">
          <div className="text-center">
            <div className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg font-semibold">Loading video...</p>
          </div>
        </div>
      )}

      {/* TikTok iframe */}
      <iframe
        ref={iframeRef}
        src={iframeUrl}
        className="absolute inset-0 w-full h-full border-none"
        allow="autoplay; fullscreen; encrypted-media"
        referrerPolicy="strict-origin-when-cross-origin"
        title={`TikTok video by @${username}`}
      />

      {/* Controls Overlay */}
      {!isLoading && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Top Controls */}
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent pointer-events-auto">
            <div className="flex items-center justify-between">
              <button
                onClick={onClose}
                className="p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-auto">
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={toggleMute}
                className="p-3 bg-white/90 backdrop-blur-md rounded-full text-gray-900 hover:bg-white transition-all shadow-lg"
              >
                {isMuted ? (
                  <VolumeX className="w-6 h-6" />
                ) : (
                  <Volume2 className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* =======================
   MAIN COMPONENT
======================= */
const TikTokVideos: React.FC<TikTokVideosProps> = ({
  username = "_chirag_101",
  limit = 12,
  heading = "Latest TikTok Videos",
}) => {
  const [videos, setVideos] = useState<TikTokVideo[]>([]);
  const [user, setUser] = useState<TikTokUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>("");
  const [cacheInfo, setCacheInfo] = useState<{ age_days?: number; cached_at?: string } | null>(null);
  
  // Slider state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  /* =======================
     FORMAT HELPERS
  ======================= */
  const formatNumber = useCallback((num?: number): string => {
    if (!num || num === 0) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  }, []);

  const formatDate = useCallback((timestamp: number) => {
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
  }, []);

  const formatDuration = useCallback((seconds: number): string => {
    if (!seconds) return "0s";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  }, []);

  /* =======================
     FETCH PROFILE
  ======================= */
  const fetchProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const url = `${API_URL}/public/tiktok/profile?username=${username}&count=${limit}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success && data.user && data.videos && data.videos.length > 0) {
        setUser(data.user);
        
        const validVideos = data.videos
          .map((video: any) => ({
            video_id: video.video_id,
            description: video.description || '',
            create_time: video.create_time || 0,
            duration: video.duration || 0,
            thumbnail_url: video.cloudinary?.url || video.thumbnail_url,
            like_count: video.like_count,
            comment_count: video.comment_count,
            share_count: video.share_count,
            view_count: video.view_count,
            music_title: video.music_title,
            music_author: video.music_author,
            cloudinary: video.cloudinary || null,
          }))
          .filter((video: TikTokVideo) => video.video_id);
        
        setVideos(validVideos);
        setDataSource(data.source || "unknown");
        
        if (data.cache_age_days !== undefined && data.cached_at) {
          setCacheInfo({
            age_days: data.cache_age_days,
            cached_at: data.cached_at
          });
        }
      } else {
        setError(data.error || "No videos available");
        setVideos([]);
        setUser(null);
      }
    } catch (err) {
      setError("Failed to connect to server");
      setVideos([]);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username, limit]);

  /* =======================
     SLIDER CONTROLS
  ======================= */
  const getVisibleCount = () => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth < 640) return 1; // mobile
    if (window.innerWidth < 1024) return 2; // tablet
    return 3; // desktop
  };

  const [visibleCount, setVisibleCount] = useState(getVisibleCount());

  useEffect(() => {
    const handleResize = () => {
      setVisibleCount(getVisibleCount());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < videos.length - visibleCount;

  const goToPrev = useCallback(() => {
    if (canGoPrev) {
      setCurrentIndex(prev => prev - 1);
      setActiveVideoId(null); // Stop playing when navigating
    }
  }, [canGoPrev]);

  const goToNext = useCallback(() => {
    if (canGoNext) {
      setCurrentIndex(prev => prev + 1);
      setActiveVideoId(null); // Stop playing when navigating
    }
  }, [canGoNext]);

  /* =======================
     TOUCH/SWIPE HANDLERS
  ======================= */
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const threshold = 50; // Minimum swipe distance

    if (Math.abs(distance) > threshold) {
      if (distance > 0) {
        // Swiped left - go next
        goToNext();
      } else {
        // Swiped right - go prev
        goToPrev();
      }
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  /* =======================
     MOUSE/TRACKPAD HANDLERS (2-finger swipe)
  ======================= */
  const handleWheel = (e: React.WheelEvent) => {
    // Horizontal scroll detection (2-finger swipe on trackpad)
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault();
      
      if (e.deltaX > 20) {
        goToNext();
      } else if (e.deltaX < -20) {
        goToPrev();
      }
    }
  };

  /* =======================
     VIDEO CONTROLS
  ======================= */
  const handleCardClick = useCallback((videoId: string) => {
    setActiveVideoId(prev => prev === videoId ? null : videoId);
  }, []);

  const openTikTok = useCallback((videoId: string) => {
    const url = `https://www.tiktok.com/@${username}/video/${videoId}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [username]);

  /* =======================
     RENDER: LOADING
  ======================= */
  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="w-20 h-20 border-4 border-cyan-200 border-t-cyan-500 rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-gray-600 text-lg font-medium">Loading TikTok videos...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* =======================
     RENDER: ERROR / EMPTY
  ======================= */
  if (videos.length === 0) {
    return (
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-32">
            <div className="w-20 h-20 mx-auto mb-6 text-gray-300">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Videos Available</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">{error || "Unable to load TikTok videos at this time"}</p>
            <button 
              onClick={fetchProfile}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-pink-500 text-white rounded-full hover:shadow-xl transition-all font-semibold text-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  /* =======================
     RENDER: MAIN CONTENT
  ======================= */
  const visibleVideos = videos.slice(currentIndex, currentIndex + visibleCount);

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cache Info Banner */}
        {(dataSource === "mongodb_cache_locked" || dataSource === "mongodb_cache_fallback") && cacheInfo && (
          <div className="mb-8 border-2 rounded-2xl p-5 flex items-center gap-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300">
            <svg className="w-6 h-6 flex-shrink-0 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-semibold text-amber-800">
              {dataSource === "mongodb_cache_locked" 
                ? `🔄 Refresh in progress - showing cached data (${cacheInfo.age_days} days old)`
                : `⚠️ Using cached data (${cacheInfo.age_days} days old) - API temporarily unavailable`
              }
            </p>
          </div>
        )}

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{heading}</h2>
              {user && (
                <div className="flex items-center gap-3 text-base text-gray-600">
                  <span className="font-bold text-gray-900 text-lg">@{user.username}</span>
                  {user.verified && (
                    <svg className="w-5 h-5 text-cyan-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  {user.followers_count !== undefined && (
                    <>
                      <span>•</span>
                      <span className="font-semibold">{formatNumber(user.followers_count)} followers</span>
                    </>
                  )}
                </div>
              )}
            </div>
            
            {/* View Profile Link - Desktop */}
            <a
              href={`https://www.tiktok.com/@${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-pink-500 text-white rounded-full hover:shadow-2xl transition-all font-bold text-base"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
              </svg>
              <span>View Profile</span>
            </a>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 font-medium">
              Showing {currentIndex + 1}-{Math.min(currentIndex + visibleCount, videos.length)} of {videos.length}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={goToPrev}
                disabled={!canGoPrev}
                className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all disabled:hover:shadow-lg border-2 border-gray-100"
                aria-label="Previous"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              <button
                onClick={goToNext}
                disabled={!canGoNext}
                className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all disabled:hover:shadow-lg border-2 border-gray-100"
                aria-label="Next"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </div>
        </div>

        {/* Slider Container */}
        <div 
          ref={sliderRef}
          className="relative overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleVideos.map((video) => {
              const thumbnailUrl = video.cloudinary?.url || video.thumbnail_url || '';
              const isActive = activeVideoId === video.video_id;
              
              return (
                <div
                  key={video.video_id}
                  className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-100"
                >
                  {/* Video Container */}
                  <div className="relative aspect-[9/16] bg-black overflow-hidden">
                    {isActive ? (
                      <TikTokEmbedPlayer
                        videoId={video.video_id}
                        username={username}
                        onClose={() => setActiveVideoId(null)}
                      />
                    ) : (
                      <Thumbnail
                        thumbnailUrl={thumbnailUrl}
                        username={username}
                        onClick={() => handleCardClick(video.video_id)}
                      />
                    )}
                    
                    {/* External Link Button */}
                    {!isActive && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openTikTok(video.video_id);
                        }}
                        className="absolute top-4 right-4 z-20 p-3 bg-white/90 backdrop-blur-md rounded-full text-gray-900 hover:bg-white transition-all shadow-lg"
                        aria-label="Open on TikTok"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Video Info */}
                  <div className="p-5">
                    <div className="mb-3">
                      <p className="text-gray-900 text-base font-semibold mb-2 line-clamp-2 leading-snug">
                        {video.description || 'TikTok Video'}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                        <span>{formatDate(video.create_time)}</span>
                        <span>•</span>
                        <span>{formatDuration(video.duration)}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                      {(video.like_count || 0) > 0 && (
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <Heart size={16} className="text-red-500" fill="currentColor" />
                          <span>{formatNumber(video.like_count)}</span>
                        </div>
                      )}
                      {(video.comment_count || 0) > 0 && (
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <MessageCircle size={16} className="text-blue-500" />
                          <span>{formatNumber(video.comment_count)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile View Profile Link */}
        <div className="md:hidden text-center mt-12">
          <a
            href={`https://www.tiktok.com/@${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-pink-500 text-white font-bold rounded-full hover:shadow-2xl transition-all text-lg"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
            </svg>
            View Profile on TikTok
          </a>
        </div>
      </div>

      {/* CSS */}
      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
};

export default TikTokVideos;